import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { daysBetween, inactivityLoss } from '@/store/rpg/decay';
import { LocalDate } from '@js-joda/core';

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
}

export function sessionFacts(session: Session): SessionFacts {
  let sets = 0;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      sets += ex.potentialSets.filter((ps) => ps.set !== undefined).length;
    }
  }
  const seconds = session.duration ? Number(session.duration.seconds()) : 0;
  return {
    date: session.date,
    sets,
    minutes: Math.floor(seconds / 60),
    exercises: session.recordedExercises.map((ex) => ex.blueprint.name),
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
