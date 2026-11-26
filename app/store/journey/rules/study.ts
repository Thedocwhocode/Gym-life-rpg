import { LocalDate } from '@js-joda/core';

/**
 * Estudo (decisão do usuário, 2026-11-26): o INT vem do pomodoro. Só bloco de foco completo conta,
 * e cada minuto de foco vale 0,5 de INT. Puro: o log vem de `Choices.studyLog`.
 */
export interface StudyEntry {
  /** YYYY-MM-DD, fuso do aparelho. */
  date: string;
  /** Minutos de foco concluídos no dia. */
  minutes: number;
}

export const INT_PER_MINUTE = 0.5;
/** Teto por dia: protege o log de um relógio doido (24 h de foco). */
export const MAX_STUDY_MINUTES_PER_DAY = 24 * 60;

export const STUDY_PRESETS = {
  short: { focus: 25, rest: 5 },
  long: { focus: 50, rest: 10 },
} as const;
export type StudyPreset = keyof typeof STUDY_PRESETS;

/** Soma minutos de foco ao dia, sem mutar o log (mantém a ordem por data). */
export function withStudyMinutes(
  log: readonly StudyEntry[],
  date: string,
  minutes: number,
): StudyEntry[] {
  const add = Math.max(0, Math.round(minutes));
  const cur = log.find((e) => e.date === date)?.minutes ?? 0;
  const next = {
    date,
    minutes: Math.min(MAX_STUDY_MINUTES_PER_DAY, cur + add),
  };
  return [...log.filter((e) => e.date !== date), next].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}

export const studyMinutesOn = (log: readonly StudyEntry[], date: string) =>
  log.find((e) => e.date === date)?.minutes ?? 0;

/** Fatos de atributo do estudo, no formato que `deriveAttributes` lê. */
export function studyFacts(log: readonly StudyEntry[]) {
  return log
    .filter((e) => e.minutes > 0)
    .map((e) => ({
      date: LocalDate.parse(e.date),
      sets: 0,
      minutes: 0,
      exercises: [] as string[],
      attrXp: { INT: e.minutes * INT_PER_MINUTE },
    }));
}

/** "mm:ss" para o relógio; nunca negativo. */
export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export type StudyPhase = 'idle' | 'focus' | 'rest';

/**
 * Relógio do pomodoro por timestamp: `endsAt` correndo, `left` pausado. Assim a aba em segundo
 * plano (o navegador estrangula o setInterval) não atrasa o bloco.
 */
export interface StudyTimer {
  phase: StudyPhase;
  preset: StudyPreset;
  endsAt?: number | undefined;
  left?: number | undefined;
}

const MIN = 60_000;

export const timerLeft = (s: StudyTimer, now: number) =>
  s.endsAt !== undefined ? Math.max(0, s.endsAt - now) : (s.left ?? 0);

/** Duração total da fase atual, em ms. */
export const phaseMs = (s: StudyTimer) =>
  s.phase === 'rest'
    ? STUDY_PRESETS[s.preset].rest * MIN
    : STUDY_PRESETS[s.preset].focus * MIN;

export const startFocus = (preset: StudyPreset, now: number): StudyTimer => ({
  phase: 'focus',
  preset,
  endsAt: now + STUDY_PRESETS[preset].focus * MIN,
});

export const pauseTimer = (s: StudyTimer, now: number): StudyTimer =>
  s.endsAt === undefined
    ? s
    : { ...s, endsAt: undefined, left: timerLeft(s, now) };

export const resumeTimer = (s: StudyTimer, now: number): StudyTimer =>
  s.endsAt !== undefined || s.phase === 'idle'
    ? s
    : { ...s, endsAt: now + (s.left ?? 0), left: undefined };

/**
 * Avança o relógio. Foco que chega a zero rende `earned` minutos e abre a pausa; pausa que chega
 * a zero volta ao repouso com `restDone`. Pausado não avança.
 */
export function tickTimer(
  s: StudyTimer,
  now: number,
): { next: StudyTimer; earned: number; restDone: boolean } {
  if (s.endsAt === undefined || now < s.endsAt)
    return { next: s, earned: 0, restDone: false };
  if (s.phase === 'focus')
    return {
      next: {
        phase: 'rest',
        preset: s.preset,
        endsAt: s.endsAt + STUDY_PRESETS[s.preset].rest * MIN,
      },
      earned: STUDY_PRESETS[s.preset].focus,
      restDone: false,
    };
  return {
    next: { phase: 'idle', preset: s.preset },
    earned: 0,
    restDone: true,
  };
}
