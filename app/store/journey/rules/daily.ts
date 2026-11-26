import { LocalDate } from '@js-joda/core';

/**
 * Missão diária do Sistema (decisão do usuário, 2026-11-26): 10 flexões, 10 agachamentos e 500 m de
 * corrida. A meta cresce 10% a cada semana cumprida (5 de 7 dias), arredondada para cima: reps inteiras,
 * corrida em passos de 50 m. Semana não cumprida não sobe. Dia que fechou incompleto pode ser salvo no
 * dia seguinte pela Quest de Recuperação (metade do que faltou). Puro: o log vem de `Choices.dailyLog`.
 */
export type DailyItem = 'pushups' | 'squats' | 'run';
export const DAILY_ITEMS: readonly DailyItem[] = ['pushups', 'squats', 'run'];
export type DailyCounts = Partial<Record<DailyItem, number>>;
export type DailyTargets = Record<DailyItem, number>;

export interface DailyEntry {
  /** YYYY-MM-DD, fuso do aparelho. */
  date: string;
  done: DailyCounts;
  /** Progresso da Quest de Recuperação deste dia (feita no dia seguinte). */
  recovery?: DailyCounts | undefined;
}

export const DAILY_BASE: DailyTargets = { pushups: 10, squats: 10, run: 500 };
/** Passo dos botões [−]/[+]; corrida em metros. */
export const DAILY_STEP: DailyTargets = { pushups: 1, squats: 1, run: 50 };
export const DAILY_REWARD = { xp: 30, vit: 1 } as const;
const GROWTH = 1.1;
const DAYS_TO_GROW = 5;
const RUN_STEP = 50;

// 1,1 × 10 dá 11,000000000000002 em ponto flutuante; sem a folga, ceil viraria 12.
const up = (v: number, step = 1) =>
  Math.max(0, Math.ceil(v / step - 1e-6) * step);

export function targetsFor(weeksCleared: number): DailyTargets {
  const f = GROWTH ** weeksCleared;
  return {
    pushups: up(DAILY_BASE.pushups * f),
    squats: up(DAILY_BASE.squats * f),
    run: up(DAILY_BASE.run * f, RUN_STEP),
  };
}

const isMet = (c: DailyCounts | undefined, t: DailyTargets) =>
  DAILY_ITEMS.every((k) => (c?.[k] ?? 0) >= t[k]);

/** Recuperação: metade do que faltou em cada item (o que já foi cumprido fica em 0). */
export function recoveryTargets(
  done: DailyCounts | undefined,
  t: DailyTargets,
): DailyTargets {
  const half = (k: DailyItem, step = 1) =>
    up(Math.max(0, t[k] - (done?.[k] ?? 0)) / 2, step);
  return {
    pushups: half('pushups'),
    squats: half('squats'),
    run: half('run', RUN_STEP),
  };
}

const mondayOf = (d: LocalDate) => d.minusDays(d.dayOfWeek().value() - 1);

interface Fold {
  /** Semanas cumpridas antes da semana de `until`. */
  weeks: number;
  targets: DailyTargets;
  completed: Set<string>;
  recovered: Set<string>;
}

/** Semana a semana, do primeiro registro até a semana de `until`; a meta da semana sai das anteriores. */
function fold(log: readonly DailyEntry[], until: LocalDate): Fold {
  const byDate = new Map(log.map((e) => [e.date, e]));
  const completed = new Set<string>();
  const recovered = new Set<string>();
  const first = log.reduce<string | undefined>(
    (min, e) => (min === undefined || e.date < min ? e.date : min),
    undefined,
  );
  const last = mondayOf(until);
  let weeks = 0;
  if (first) {
    for (let w = mondayOf(LocalDate.parse(first)); !w.isAfter(last); ) {
      const t = targetsFor(weeks);
      let kept = 0;
      for (let i = 0; i < 7; i++) {
        const day = w.plusDays(i);
        if (day.isAfter(until)) break;
        const e = byDate.get(day.toString());
        if (!e) continue;
        if (isMet(e.done, t)) completed.add(e.date);
        else if (e.recovery && isMet(e.recovery, recoveryTargets(e.done, t)))
          recovered.add(e.date);
        else continue;
        kept++;
      }
      if (w.isBefore(last) && kept >= DAYS_TO_GROW) weeks++;
      w = w.plusWeeks(1);
    }
  }
  return { weeks, targets: targetsFor(weeks), completed, recovered };
}

/** Dias cumpridos por completo (+30 XP e +1 VIT cada) e dias salvos pela recuperação (+1 VIT). */
export function dailyHistory(log: readonly DailyEntry[], today?: LocalDate) {
  const last = log.at(-1)?.date;
  if (!last) return { completed: [], recovered: [] };
  const f = fold(log, today ?? LocalDate.parse(last));
  return { completed: [...f.completed], recovered: [...f.recovered] };
}

export interface DailyState {
  targets: DailyTargets;
  /** Semanas cumpridas até hoje (cada uma vale +10%). */
  weeks: number;
  done: DailyCounts;
  complete: boolean;
  /** Dias seguidos cumpridos (ou salvos), até hoje ou até ontem se hoje ainda está aberto. */
  streak: number;
  /** Quest de Recuperação aberta hoje, para o dia de ontem. */
  recovery?: {
    date: string;
    targets: DailyTargets;
    progress: DailyCounts;
    /** Streak que volta se a recuperação for cumprida. */
    streak: number;
  };
}

export function dailyState(
  log: readonly DailyEntry[],
  today: LocalDate,
): DailyState {
  const f = fold(log, today);
  const kept = (d: LocalDate) =>
    f.completed.has(d.toString()) || f.recovered.has(d.toString());
  const run = (from: LocalDate) => {
    let n = 0;
    for (let d = from; kept(d); d = d.minusDays(1)) n++;
    return n;
  };
  const yesterday = today.minusDays(1);
  const done = log.find((e) => e.date === today.toString())?.done ?? {};
  const state: DailyState = {
    targets: f.targets,
    weeks: f.weeks,
    done,
    complete: isMet(done, f.targets),
    streak: kept(today) ? run(today) : run(yesterday),
  };
  // Só oferece recuperação se havia um streak a salvar antes de ontem.
  const before = run(yesterday.minusDays(1));
  if (!kept(yesterday) && before > 0) {
    const y = log.find((e) => e.date === yesterday.toString());
    const yTargets = fold(log, yesterday).targets;
    state.recovery = {
      date: yesterday.toString(),
      targets: recoveryTargets(y?.done, yTargets),
      progress: y?.recovery ?? {},
      streak: before + 1 + (kept(today) ? run(today) : 0),
    };
  }
  return state;
}

/** Grava um contador sem mutar o log (cria a entrada do dia se faltar). */
export function withDailyCount(
  log: readonly DailyEntry[],
  date: string,
  item: DailyItem,
  value: number,
  recovery = false,
): DailyEntry[] {
  const v = Math.max(0, Math.round(value));
  const cur = log.find((e) => e.date === date) ?? { date, done: {} };
  const next: DailyEntry = recovery
    ? { ...cur, recovery: { ...cur.recovery, [item]: v } }
    : { ...cur, done: { ...cur.done, [item]: v } };
  return [...log.filter((e) => e.date !== date), next].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}
