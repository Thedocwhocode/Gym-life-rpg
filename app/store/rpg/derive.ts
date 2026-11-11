import type { TranslationKey } from '@tolgee/react';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { daysBetween, inactivityLoss } from '@/store/rpg/decay';
import { IsoFields, LocalDate } from '@js-joda/core';
import { NormalizedName } from '@/models/blueprint-models';
import type { RpgClass } from '@/store/choices';
import { Dated, valueAt } from '@/store/journey/rules/dated';
import { deriveHearts, HeartsState } from '@/store/journey/rules/hearts';
import {
  totalPct,
  withPct,
  xpSources,
  XpSource,
} from '@/store/journey/rules/multipliers';
import {
  EMPTY_STATS,
  equippedSkill,
  SKILLS,
  SkillStats,
} from '@/store/journey/rules/skills';
import {
  activeStatuses,
  STATUS_RULES,
  StatusId,
} from '@/store/journey/rules/status';

/** Siglas do design (D2). INT fica fora até a Fase 5. */
export type AttrKey = 'STR' | 'DEX' | 'CON' | 'STA';

export interface AttrValue {
  /** Total da vida, já descontadas as pausas de 14+ dias (decay.ts). */
  total: number;
  /** Quanto entrou na semana ISO de `today`. */
  week: number;
}

/** O que uma sessão contribui para os atributos; separado para a fórmula ser testável sem montar Session. */
export interface SessionFacts {
  date: LocalDate;
  sets: number;
  minutes: number;
  exercises: readonly string[];
  /** Exercícios de cardio concluídos. */
  cardio?: number;
  /** Maior carga numa série concluída (na unidade gravada). */
  maxWeight?: number;
  /** Desempate estável da ordem (mesma data). */
  id?: string;
  /** Nome do treino (masmorra, DR22). */
  workout?: string;
  /** Melhor kg com reps > 0 por exercício (chave normalizada): PR da Fúria e do Martelo. */
  loads?: readonly (readonly [string, number])[];
  cardioMin?: number;
  cardioKm?: number;
}

const KM: Record<string, number> = {
  metre: 0.001,
  yard: 0.0009144,
  mile: 1.609344,
  kilometre: 1,
};

export function sessionFacts(session: Session): SessionFacts {
  let sets = 0;
  let cardio = 0;
  let maxWeight = 0;
  let cardioMin = 0;
  let cardioKm = 0;
  const loads: [string, number][] = [];
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      let best = 0;
      for (const ps of ex.potentialSets) {
        if (ps.set === undefined) continue;
        sets++;
        maxWeight = Math.max(maxWeight, ps.weight.value.toNumber());
        if (ps.set.repsCompleted > 0)
          best = Math.max(
            best,
            ps.weight.convertTo('kilograms').value.toNumber(),
          );
      }
      if (best > 0)
        loads.push([
          NormalizedName.fromExerciseBlueprint(ex.blueprint).toString(),
          best,
        ]);
    } else if (ex instanceof RecordedCardioExercise) {
      if (ex.completionDateTime === undefined) continue;
      cardio++;
      cardioMin += ex.duration ? Number(ex.duration.seconds()) / 60 : 0;
      cardioKm += ex.distance
        ? ex.distance.value.toNumber() * (KM[ex.distance.unit] ?? 0)
        : 0;
    }
  }
  const seconds = session.duration ? Number(session.duration.seconds()) : 0;
  return {
    date: session.date,
    sets,
    minutes: Math.floor(seconds / 60),
    exercises: session.recordedExercises.map((ex) => ex.blueprint.name),
    cardio,
    maxWeight,
    id: session.id,
    workout: session.blueprint.name,
    loads,
    cardioMin: Math.floor(cardioMin),
    cardioKm,
  };
}

/**
 * DR4: STR = séries, STA = minutos, CON = dias de treino, DEX = exercícios distintos.
 * Acumulado na vida, mas cada pausa de 14+ dias corta os totais pela curva de `decay.ts`
 * (inclusive a pausa atual, até `today`). `week` conta os ganhos da semana ISO (seg–dom) de `today`.
 * `today` é injetado: nada de relógio aqui.
 */
export function deriveAttributes(
  facts: readonly SessionFacts[],
  today: LocalDate,
): Record<AttrKey, AttrValue> {
  const monday = today.minusDays(today.dayOfWeek().value() - 1);
  const inWeek = (d: LocalDate) => !d.isBefore(monday) && !d.isAfter(today);
  const sorted = [...facts].sort((a, b) => a.date.compareTo(b.date));

  const total = { STR: 0, DEX: 0, CON: 0, STA: 0 };
  const week = { STR: 0, DEX: 0, CON: 0, STA: 0 };
  const days = new Set<string>();
  const seen = new Set<string>();
  let prev: LocalDate | undefined;

  const decay = (to: LocalDate) => {
    if (!prev) return;
    const keep = 1 - inactivityLoss(daysBetween(prev, to));
    for (const k of ATTR_KEYS) total[k] *= keep;
  };

  for (const f of sorted) {
    decay(f.date);
    prev = f.date;
    const w = inWeek(f.date);
    const day = f.date.toString();
    const newDay = !days.has(day);
    days.add(day);
    const newExercises = f.exercises.filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    }).length;
    const gains = {
      STR: f.sets,
      DEX: newExercises,
      CON: newDay ? 1 : 0,
      STA: f.minutes,
    };
    for (const k of ATTR_KEYS) {
      total[k] += gains[k];
      if (w) week[k] += gains[k];
    }
  }
  decay(today);

  const out = {} as Record<AttrKey, AttrValue>;
  for (const k of ATTR_KEYS) {
    out[k] = { total: Math.floor(total[k] + 1e-9), week: week[k] };
  }
  return out;
}

const ATTR_KEYS: AttrKey[] = ['STR', 'DEX', 'CON', 'STA'];

// ── Progresso: XP, nível, streak, quests e conquistas, tudo projetado das sessões ──

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function levelFromXp(xp: number): number {
  return Math.floor(1 + Math.sqrt(Math.max(0, xp) / 100));
}

// Chaves de i18n (DR25): quem mostra traduz com t().
const TITLES: [number, TranslationKey][] = [
  [20, 'rpg.title.legend'],
  [15, 'rpg.title.master'],
  [10, 'rpg.title.knight'],
  [6, 'rpg.title.swordsman'],
  [3, 'rpg.title.novice'],
  [1, 'rpg.title.beginner'],
];

/** Chave de i18n do título do nível. */
export function titleForLevel(level: number): TranslationKey {
  return TITLES.find(([min]) => level >= min)?.[1] ?? 'rpg.title.beginner';
}

export function xpProgress(xp: number): { current: number; needed: number } {
  const level = levelFromXp(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { current: xp - cur, needed: next - cur };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  type: 'workouts_this_week' | 'total_sets_this_week' | 'streak_days';
  weekKey: string;
  /** Dia (YYYY-MM-DD) da sessão que fechou a quest. */
  completedAt?: string;
}

/** 50 por missão, 10 por série concluída, 15 por cardio concluído. */
export function factsXp(f: SessionFacts): number {
  return 50 + 10 * f.sets + 15 * (f.cardio ?? 0);
}

export function sessionXp(session: Session): number {
  return factsXp(sessionFacts(session));
}

/** Semana ISO (seg–dom) a partir do LocalDate do aparelho; nunca de toISOString (UTC). */
export function weekKey(d: LocalDate): string {
  const week = d.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
  return `${d.get(IsoFields.WEEK_BASED_YEAR)}-W${String(week).padStart(2, '0')}`;
}

const TIER_TARGETS = {
  workouts: [2, 3, 4],
  sets: [20, 40, 60],
  streak: [2, 3, 4],
} as const;

/** Quest = função de (semana, nível no início da semana). */
export function buildWeeklyQuests(week: string, level: number): Quest[] {
  const tier = level >= 10 ? 2 : level >= 5 ? 1 : 0;
  const workouts = TIER_TARGETS.workouts[tier];
  const sets = TIER_TARGETS.sets[tier];
  const streak = TIER_TARGETS.streak[tier];
  return [
    {
      id: `${week}-workouts`,
      title: 'Missões da Semana',
      description: `Complete ${workouts} treinos esta semana`,
      target: workouts,
      progress: 0,
      xpReward: workouts * 50,
      type: 'workouts_this_week',
      weekKey: week,
    },
    {
      id: `${week}-sets`,
      title: 'Volume de Ferro',
      description: `Complete ${sets} séries esta semana`,
      target: sets,
      progress: 0,
      xpReward: 150,
      type: 'total_sets_this_week',
      weekKey: week,
    },
    {
      id: `${week}-streak`,
      title: 'Combo de Batalhas',
      description: `Treine ${streak} dias seguidos`,
      target: streak,
      progress: 0,
      xpReward: 200,
      type: 'streak_days',
      weekKey: week,
    },
  ];
}

/** Escolhas datadas que a projeção usa (store/choices). `*Since` ausente = regra desligada. */
export interface JourneyContext {
  classHistory?: readonly Dated<RpgClass>[] | undefined;
  skillEquipped?: readonly Dated<string>[] | undefined;
  /** Skills aprendidas (com o dia): só valem no fold a partir desse dia. */
  skillsLearned?: readonly Dated<string>[] | undefined;
  itemsEquipped?: readonly Dated<readonly string[]>[] | undefined;
  trainingDays?: readonly Dated<number[]>[] | undefined;
  /** DR11: multiplicadores, status e streak protegido só valem a partir daqui. */
  multipliersSince?: LocalDate | undefined;
  /** DR8: corações só contam a partir daqui. */
  heartsSince?: LocalDate | undefined;
}

export interface Progress {
  xp: number;
  level: number;
  /** Dias seguidos até hoje (zera quando ontem e hoje passaram sem treino). */
  streak: number;
  /** id → dia (YYYY-MM-DD) em que foi alcançada. */
  achievements: Record<string, string>;
  /** Quests da semana de `today`. */
  quests: Quest[];
  /** Status de hoje (debuffs primeiro). */
  statuses: StatusId[];
  hearts: HeartsState;
  /** Máximos do histórico para os requisitos das skills. */
  stats: SkillStats;
  /** XP ganho (sessões + quests) e missões por semana ISO: crônica E4. */
  xpByWeek: Record<string, number>;
  missionsByWeek: Record<string, number>;
  /** id da sessão → % que valeram nela (só a partir de `multipliersSince`). */
  sources: Record<string, XpSource[]>;
  /** XP de cada sessão (com os %), o mesmo número que entra no total. */
  xpBySession: Record<string, number>;
}

interface WeekTally {
  quests: Quest[];
  workouts: number;
  sets: number;
  cardioMin: number;
  km: number;
}

const tierOf = (level: number) => (level >= 10 ? 2 : level >= 5 ? 1 : 0);
const mondayOf = (d: LocalDate) => d.minusDays(d.dayOfWeek().value() - 1);
const DEADLIFT = /deadlift|terra/i;

/**
 * Fold cronológico: cada pausa de 14+ dias corta o XP (decay.ts), a sessão soma o seu XP
 * (com os % de classe, skill, itens e status a partir de `multipliersSince`) e a quest que
 * bate a meta soma a recompensa na hora. Conquistas são "alcançadas alguma vez".
 * `today` é injetado: nada de relógio aqui.
 */
export function deriveProgress(
  facts: readonly SessionFacts[],
  today: LocalDate,
  ctx: JourneyContext = {},
): Progress {
  const sorted = [...facts].sort(
    (a, b) =>
      a.date.compareTo(b.date) || (a.id ?? '').localeCompare(b.id ?? ''),
  );
  const since = ctx.multipliersSince;
  const ruled = (d: LocalDate) => !!since && !d.isBefore(since);
  const hearts = deriveHearts({
    sessionDays: sorted.map((f) => f.date),
    trainingDays: ctx.trainingDays,
    since: ctx.heartsSince,
    today,
  });
  const classAt = (d: LocalDate) => valueAt(ctx.classHistory, d);
  const learnedAt = (d: LocalDate) =>
    new Set(
      (ctx.skillsLearned ?? [])
        .filter((l) => l.since <= d.toString())
        .map((l) => l.value),
    );
  const skillAt = (d: LocalDate) =>
    equippedSkill(valueAt(ctx.skillEquipped, d), classAt(d), learnedAt(d));
  const shielded = (d: LocalDate) =>
    ruled(d) &&
    (classAt(d) === 'paladin' ||
      !!SKILLS.find((s) => s.id === skillAt(d))?.streakShield);

  const weeks = new Map<string, WeekTally>();
  const achievements: Record<string, string> = {};
  const xpByWeek: Record<string, number> = {};
  const missionsByWeek: Record<string, number> = {};
  const sources: Record<string, XpSource[]> = {};
  const xpBySession: Record<string, number> = {};
  const best = new Map<string, number>();
  const prWeeks = new Set<string>();
  const shieldWeeks = new Set<string>();
  const stats: SkillStats = { ...EMPTY_STATS };
  let xp = 0;
  let maxLevel = 1;
  let streak = 0;
  let count = 0;
  let prev: LocalDate | undefined;
  const first = sorted.at(0)?.date;

  const goalOf = (k: string) =>
    weeks.get(k)?.quests[0].target ??
    TIER_TARGETS.workouts[tierOf(levelFromXp(xp))];
  /** Semanas completas seguidas antes da de `d` abaixo da meta (desde a 2ª semana e o `since`). */
  const weeksBelow = (d: LocalDate) => {
    if (!first || !since) return 0;
    const floor = mondayOf(first).isBefore(mondayOf(since))
      ? mondayOf(since)
      : mondayOf(first).plusWeeks(1);
    let n = 0;
    for (let w = mondayOf(d).minusWeeks(1); !w.isBefore(floor); ) {
      const k = weekKey(w);
      if ((weeks.get(k)?.workouts ?? 0) >= goalOf(k)) break;
      if (++n >= STATUS_RULES.cursedWeeks) break;
      w = w.minusWeeks(1);
    }
    return n;
  };
  const decayTo = (to: LocalDate) => {
    if (prev) {
      xp = Math.floor(xp * (1 - inactivityLoss(daysBetween(prev, to))));
    }
  };
  const unlock = (id: string, cond: boolean, on: string) => {
    if (cond && !achievements[id]) achievements[id] = on;
  };
  const keepStreak = (gap: number | undefined, d: LocalDate) => {
    if (gap !== 2 || !shielded(d) || shieldWeeks.has(weekKey(d))) return false;
    shieldWeeks.add(weekKey(d));
    return true;
  };

  for (const f of sorted) {
    const gap = prev ? daysBetween(prev, f.date) : undefined;
    const key = weekKey(f.date);
    const week = weeks.get(key) ?? {
      quests: buildWeeklyQuests(key, levelFromXp(xp)),
      workouts: 0,
      sets: 0,
      cardioMin: 0,
      km: 0,
    };
    weeks.set(key, week);

    const statuses = ruled(f.date)
      ? activeStatuses({
          exhausted: hearts.exhaustedDays.has(f.date.toString()),
          daysSinceLast: gap,
          prThisWeek: prWeeks.has(key),
          streak: gap !== undefined && gap <= 1 ? streak : 0,
          weeksBelowGoal: weeksBelow(f.date),
          goalMetThisWeek: week.workouts >= goalOf(key),
        })
      : [];

    decayTo(f.date);
    streak =
      gap === 0
        ? streak
        : gap === 1 || keepStreak(gap, f.date)
          ? streak + 1
          : 1;
    prev = f.date;
    count++;
    if (gap !== undefined && gap >= 14) stats.comeback = true;

    for (const [ex, kg] of f.loads ?? []) {
      const cur = best.get(ex);
      if (cur !== undefined && kg > cur) {
        prWeeks.add(key);
        if (DEADLIFT.test(ex)) stats.deadliftPr = true;
      }
      if (cur === undefined || kg > cur) best.set(ex, kg);
    }

    week.workouts++;
    week.sets += f.sets;
    week.cardioMin += f.cardioMin ?? 0;
    week.km += f.cardioKm ?? 0;
    const before = xp;
    let gained = factsXp(f);
    if (ruled(f.date)) {
      const src = xpSources({
        sets: f.sets,
        cardio: f.cardio ?? 0,
        rpgClass: classAt(f.date),
        skill: skillAt(f.date),
        items: valueAt(ctx.itemsEquipped, f.date) ?? [],
        statuses,
      });
      gained = withPct(gained, totalPct(src));
      if (f.id) sources[f.id] = src;
    }
    xp += gained;
    if (f.id) xpBySession[f.id] = gained;

    const on = f.date.toString();
    const now: Record<Quest['type'], number> = {
      workouts_this_week: week.workouts,
      total_sets_this_week: week.sets,
      streak_days: streak,
    };
    week.quests = week.quests.map((q) => {
      if (q.completedAt) return q;
      const progress = Math.min(q.target, Math.max(q.progress, now[q.type]));
      if (progress < q.target) return { ...q, progress };
      xp += q.xpReward;
      return { ...q, progress, completedAt: on };
    });
    xpByWeek[key] = (xpByWeek[key] ?? 0) + (xp - before);
    missionsByWeek[key] = week.workouts;

    maxLevel = Math.max(maxLevel, levelFromXp(xp));
    stats.maxStreak = Math.max(stats.maxStreak, streak);
    stats.maxWeekSets = Math.max(stats.maxWeekSets, week.sets);
    stats.maxSessionCardioMin = Math.max(
      stats.maxSessionCardioMin,
      f.cardioMin ?? 0,
    );
    stats.maxWeekCardioMin = Math.max(stats.maxWeekCardioMin, week.cardioMin);
    stats.maxWeekKm = Math.max(stats.maxWeekKm, week.km);
    unlock('first_quest', count >= 1, on);
    unlock('ten_workouts', count >= 10, on);
    unlock('fifty_workouts', count >= 50, on);
    unlock('hundred_workouts', count >= 100, on);
    unlock('five_streak', streak >= 5, on);
    unlock('level_5', maxLevel >= 5, on);
    unlock('level_10', maxLevel >= 10, on);
    unlock('consistency', week.workouts >= 3, on);
    unlock('heavy_lift', (f.maxWeight ?? 0) >= 100, on);
  }

  const idle = prev ? daysBetween(prev, today) : undefined;
  decayTo(today);
  const todayKey = weekKey(today);
  const alive =
    idle !== undefined &&
    (idle <= 1 ||
      (idle === 2 && shielded(today) && !shieldWeeks.has(todayKey)));
  const finalStreak = alive ? streak : 0;

  stats.missions = count;
  stats.level = maxLevel;
  if (first) {
    let goal = 0;
    let three = 0;
    for (let w = mondayOf(first); !w.isAfter(today); w = w.plusWeeks(1)) {
      const k = weekKey(w);
      const n = weeks.get(k)?.workouts ?? 0;
      const current = k === todayKey;
      goal = n >= goalOf(k) ? goal + 1 : current ? goal : 0;
      three = n >= 3 ? three + 1 : current ? three : 0;
      stats.maxGoalWeeks = Math.max(stats.maxGoalWeeks, goal);
      stats.maxWeeks3x = Math.max(stats.maxWeeks3x, three);
    }
  }

  return {
    xp,
    level: levelFromXp(xp),
    streak: finalStreak,
    achievements,
    quests:
      weeks.get(todayKey)?.quests ??
      buildWeeklyQuests(todayKey, levelFromXp(xp)),
    statuses: ruled(today)
      ? activeStatuses({
          exhausted: hearts.exhausted,
          daysSinceLast: idle,
          prThisWeek: prWeeks.has(todayKey),
          streak: finalStreak,
          weeksBelowGoal: weeksBelow(today),
          goalMetThisWeek:
            (weeks.get(todayKey)?.workouts ?? 0) >= goalOf(todayKey),
        })
      : [],
    hearts,
    stats,
    xpByWeek,
    missionsByWeek,
    sources,
    xpBySession,
  };
}

export interface ProjectionDiff {
  xpGained: number;
  newLevel?: number;
  newAchievementIds: string[];
}

/** O que mudou entre duas projeções (tela de recompensa e level up). */
export function diffProjection(
  before: Progress,
  after: Progress,
): ProjectionDiff {
  const diff: ProjectionDiff = {
    xpGained: Math.max(0, after.xp - before.xp),
    newAchievementIds: Object.keys(after.achievements).filter(
      (id) => !before.achievements[id],
    ),
  };
  if (after.level > before.level) diff.newLevel = after.level;
  return diff;
}
