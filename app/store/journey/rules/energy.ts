import { LocalDate } from '@js-joda/core';

// DR13: Energia = recuperação. Só datas das sessões; não bloqueia nada nem tira XP.

export const ENERGY = {
  max: 5,
  /** Gasto por dia com treino. */
  spend: 1,
  /** Devolvido por dia de descanso que já passou. */
  rest: 2,
  /** A partir daqui (inclusive) o card sugere descanso. */
  low: 1,
  /** 3 dias de descanso já enchem a barra; olhar mais para trás não muda nada. */
  window: 14,
} as const;

/**
 * Percorre os últimos `window` dias até hoje. Hoje gasta se já treinou, mas ainda não devolve
 * (o dia não acabou). `restBonus(dia)` é o +1 do Respiro equipado naquele dia.
 */
export function deriveEnergy(
  sessionDays: readonly LocalDate[],
  today: LocalDate,
  restBonus: (day: LocalDate) => number = () => 0,
): number {
  const trained = new Set(sessionDays.map((d) => d.toString()));
  let energy: number = ENERGY.max;
  for (let i = ENERGY.window - 1; i >= 0; i--) {
    const d = today.minusDays(i);
    if (trained.has(d.toString())) energy -= ENERGY.spend;
    else if (i > 0) energy += ENERGY.rest + restBonus(d);
    energy = Math.max(0, Math.min(ENERGY.max, energy));
  }
  return energy;
}

export const restRecommended = (energy: number) => energy <= ENERGY.low;
