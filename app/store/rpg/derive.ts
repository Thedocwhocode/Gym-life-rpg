import type { TranslationKey } from '@tolgee/react';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { daysBetween, inactivityLoss } from '@/store/rpg/decay';
import { IsoFields, LocalDate } from '@js-joda/core';

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
}

export function sessionFacts(session: Session): SessionFacts {
  let sets = 0;
  let cardio = 0;
  let maxWeight = 0;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      for (const ps of ex.potentialSets) {
        if (ps.set === undefined) continue;
        sets++;
        maxWeight = Math.max(maxWeight, ps.weight.value.toNumber());
      }
    } else if (ex instanceof RecordedCardioExercise) {
      if (ex.completionDateTime !== undefined) cardio++;
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

/** Chave de i18n do tÃ­tulo do nÃ­vel. */
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

export interface Progress {
  xp: number;
  level: number;
  /** Dias seguidos até hoje (zera quando ontem e hoje passaram sem treino). */
  streak: number;
  /** id → dia (YYYY-MM-DD) em que foi alcançada. */
  achievements: Record<string, string>;
  /** Quests da semana de `today`. */
  quests: Quest[];
}

interface WeekTally {
  quests: Quest[];
  workouts: number;
  sets: number;
}

/**
 * Fold cronológico: cada pausa de 14+ dias corta o XP (decay.ts), a sessão soma o seu XP
 * e a quest que bate a meta soma a recompensa na hora. Conquistas são "alcançadas alguma vez".
 * `today` é injetado: nada de relógio aqui.
 */
export function deriveProgress(
  facts: readonly SessionFacts[],
  today: LocalDate,
): Progress {
  const sorted = [...facts].sort((a, b) => a.date.compareTo(b.date));
  const weeks = new Map<string, WeekTally>();
  const achievements: Record<string, string> = {};
  let xp = 0;
  let maxLevel = 1;
  let streak = 0;
  let count = 0;
  let prev: LocalDate | undefined;

  const decayTo = (to: LocalDate) => {
    if (prev) {
      xp = Math.floor(xp * (1 - inactivityLoss(daysBetween(prev, to))));
    }
  };
  const unlock = (id: string, cond: boolean, on: string) => {
    if (cond && !achievements[id]) achievements[id] = on;
  };

  for (const f of sorted) {
    const gap = prev ? daysBetween(prev, f.date) : undefined;
    decayTo(f.date);
    streak = gap === 0 ? streak : gap === 1 ? streak + 1 : 1;
    prev = f.date;
    count++;

    const key = weekKey(f.date);
    const week = weeks.get(key) ?? {
      quests: buildWeeklyQuests(key, levelFromXp(xp)),
      workouts: 0,
      sets: 0,
    };
    weeks.set(key, week);
    week.workouts++;
    week.sets += f.sets;
    xp += factsXp(f);

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

    maxLevel = Math.max(maxLevel, levelFromXp(xp));
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
  return {
    xp,
    level: levelFromXp(xp),
    streak: idle !== undefined && idle <= 1 ? streak : 0,
    achievements,
    quests:
      weeks.get(todayKey)?.quests ??
      buildWeeklyQuests(todayKey, levelFromXp(xp)),
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
