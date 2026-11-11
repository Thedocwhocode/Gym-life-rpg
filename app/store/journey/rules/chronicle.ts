import { LocalDate } from '@js-joda/core';
import { weekKey } from '@/store/rpg/derive';
import type { Dated } from './dated';

// E4: na 1ª abertura a partir de segunda, resumo da semana anterior. Nunca na mesma abertura do
// RewardDialog (DR3) e nunca bloqueia treino (isso é da tela). "Vista" = `chronicleSeenWeek`.

export interface Chronicle {
  week: string;
  /** seg..dom da semana resumida: treinou ou não. */
  days: boolean[];
  missions: number;
  /** Masmorras limpas na semana (DR22). */
  bosses: number;
  heartsLost: number;
  skills: string[];
  xp: number;
  /** Bateu a meta de missões sem perder coração. */
  perfect: boolean;
}

export interface ChronicleInput {
  today: LocalDate;
  sessionDays: readonly LocalDate[];
  missionsByWeek: Record<string, number>;
  xpByWeek: Record<string, number>;
  clearsByWeek: Record<string, number>;
  missed: readonly LocalDate[];
  learned: readonly Dated<string>[] | undefined;
  /** Meta de missões da semana resumida (quest "Missões da semana"). */
  goal: number;
}

/** Resumo da semana anterior a `today`; undefined se nela não houve missão. */
export function chronicleFor(i: ChronicleInput): Chronicle | undefined {
  const monday = i.today
    .minusDays(i.today.dayOfWeek().value() - 1)
    .minusWeeks(1);
  const week = weekKey(monday);
  const missions = i.missionsByWeek[week] ?? 0;
  if (!missions) return undefined;
  const inWeek = (d: LocalDate | string) => {
    const k = typeof d === 'string' ? LocalDate.parse(d) : d;
    return weekKey(k) === week;
  };
  const trained = new Set(i.sessionDays.map((d) => d.toString()));
  const heartsLost = i.missed.filter(inWeek).length;
  return {
    week,
    days: [0, 1, 2, 3, 4, 5, 6].map((n) =>
      trained.has(monday.plusDays(n).toString()),
    ),
    missions,
    bosses: i.clearsByWeek[week] ?? 0,
    heartsLost,
    skills: (i.learned ?? [])
      .filter((l) => inWeek(l.since))
      .map((l) => l.value),
    xp: i.xpByWeek[week] ?? 0,
    perfect: missions >= i.goal && heartsLost === 0,
  };
}

/** Mostra uma vez por semana (a de `today`), se a anterior teve missão. */
export const showChronicle = (
  c: Chronicle | undefined,
  today: LocalDate,
  seenWeek: string | undefined,
) => !!c && seenWeek !== weekKey(today);
