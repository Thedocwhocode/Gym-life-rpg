import { ChronoUnit, LocalDate } from '@js-joda/core';

/**
 * Perda por inatividade (decisão do produto, 2026-11-09, substitui o "nunca fica mais fraco" do DR4).
 * Nada até 14 dias sem treinar; a partir daí a perda começa pequena e acelera:
 * 1% no dia 14, dobrando a cada 7 dias (2% no 21, 4% no 28, 8% no 35, 16% no 42...), até o teto.
 * ponytail: curva exponencial com 3 knobs; ajuste aqui se o balanceamento pedir.
 */
export const DECAY = {
  graceDays: 14,
  firstLoss: 0.01,
  doublingDays: 7,
  maxLoss: 0.8,
} as const;

/** Fração perdida (0..maxLoss) depois de `daysInactive` dias sem treinar. */
export function inactivityLoss(daysInactive: number): number {
  if (!(daysInactive >= DECAY.graceDays)) return 0;
  const over = daysInactive - DECAY.graceDays;
  return Math.min(
    DECAY.maxLoss,
    DECAY.firstLoss * Math.pow(2, over / DECAY.doublingDays),
  );
}

export function daysBetween(from: LocalDate, to: LocalDate): number {
  return ChronoUnit.DAYS.between(from, to);
}

/** Aceita "YYYY-MM-DD" ou ISO com hora; data inválida = sem perda. */
export function parseDay(value: string | undefined): LocalDate | undefined {
  if (!value) return undefined;
  try {
    return LocalDate.parse(value.slice(0, 10));
  } catch {
    return undefined;
  }
}

/** XP depois da pausa entre o último treino e `on`. */
export function decayedXp(
  xp: number,
  lastWorkoutDate: string | undefined,
  on: LocalDate,
): number {
  const last = parseDay(lastWorkoutDate);
  if (!last) return xp;
  return Math.floor(xp * (1 - inactivityLoss(daysBetween(last, on))));
}
