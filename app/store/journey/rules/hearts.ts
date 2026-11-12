import { LocalDate } from '@js-joda/core';
import { Dated, valueAt } from './dated';

// D4 + DR8. Dia planejado = dia da semana ISO (1 = seg … 7 = dom) da escolha `trainingDays` vigente.

export const HEARTS = {
  max: 5,
  /** Missões fora do Exausto para recuperar 1 coração. */
  missionsPerHeart: 2,
  /** Sair do Exausto: missões dentro de uma janela de dias. */
  cureMissions: 3,
  cureWindow: 7,
  /** Corações com que se volta do Exausto. */
  afterCure: 2,
} as const;

export interface HeartsInput {
  sessionDays: readonly LocalDate[];
  trainingDays: readonly Dated<number[]>[] | undefined;
  /** `coracoesDesde`: nada antes conta (DR8). Ausente = corações desligados. */
  since: LocalDate | undefined;
  today: LocalDate;
}

export interface HeartsState {
  enabled: boolean;
  hearts: number;
  exhausted: boolean;
  /** Dias planejados que passaram sem missão e custaram 1 coração, em ordem. */
  missed: LocalDate[];
  /** Dias que começaram com o herói Exausto (o status vale para as sessões desses dias). */
  exhaustedDays: ReadonlySet<string>;
  /** Missões na janela de cura (0..3), só com o herói Exausto. */
  cureProgress: number;
}

const OFF: HeartsState = {
  enabled: false,
  hearts: HEARTS.max,
  exhausted: false,
  missed: [],
  exhaustedDays: new Set(),
  cureProgress: 0,
};

const planned = (input: HeartsInput, d: LocalDate) =>
  (valueAt(input.trainingDays, d) ?? []).includes(d.dayOfWeek().value());

/** Percorre dia a dia de `since` até `today`; o dia de hoje ainda não pode custar coração. */
export function deriveHearts(input: HeartsInput): HeartsState {
  const { since, today } = input;
  if (!since || since.isAfter(today)) return OFF;
  if (!(valueAt(input.trainingDays, today) ?? []).length) return OFF;

  const perDay = new Map<string, number>();
  for (const d of input.sessionDays) {
    if (d.isBefore(since) || d.isAfter(today)) continue;
    perDay.set(d.toString(), (perDay.get(d.toString()) ?? 0) + 1);
  }

  let hearts: number = HEARTS.max;
  let exhausted = false;
  let towardHeart = 0;
  let cure: LocalDate[] = [];
  const missed: LocalDate[] = [];
  const exhaustedDays = new Set<string>();
  const inWindow = (d: LocalDate, x: LocalDate) =>
    d.toEpochDay() - x.toEpochDay() < HEARTS.cureWindow;

  for (let d = since; !d.isAfter(today); d = d.plusDays(1)) {
    if (exhausted) exhaustedDays.add(d.toString());
    const missions = perDay.get(d.toString()) ?? 0;
    for (let i = 0; i < missions; i++) {
      if (exhausted) {
        cure = [...cure.filter((x) => inWindow(d, x)), d];
        if (cure.length >= HEARTS.cureMissions) {
          exhausted = false;
          hearts = HEARTS.afterCure;
          towardHeart = 0;
          cure = [];
        }
      } else if (++towardHeart >= HEARTS.missionsPerHeart) {
        towardHeart = 0;
        hearts = Math.min(HEARTS.max, hearts + 1);
      }
    }
    if (d.isBefore(today) && !missions && !exhausted && planned(input, d)) {
      hearts--;
      missed.push(d);
      if (hearts <= 0) {
        hearts = 0;
        exhausted = true;
        cure = [];
      }
    }
  }

  return {
    enabled: true,
    hearts,
    exhausted,
    missed,
    exhaustedDays,
    cureProgress: exhausted ? cure.filter((x) => inWindow(today, x)).length : 0,
  };
}
