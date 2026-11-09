import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';

/** Siglas do design (D2). INT fica fora até a Fase 5. */
export type AttrKey = 'STR' | 'DEX' | 'CON' | 'STA';

export interface AttrValue {
  /** Total da vida: nunca diminui (DR4). */
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
 * Tudo acumulado na vida; `week` conta só a semana ISO (seg–dom) de `today`.
 * `today` é injetado: nada de relógio aqui.
 */
export function deriveAttributes(
  facts: readonly SessionFacts[],
  today: LocalDate,
): Record<AttrKey, AttrValue> {
  const monday = today.minusDays(today.dayOfWeek().value() - 1);
  const inWeek = (d: LocalDate) => !d.isBefore(monday) && !d.isAfter(today);
  const sorted = [...facts].sort((a, b) => a.date.compareTo(b.date));

  const str = { total: 0, week: 0 };
  const sta = { total: 0, week: 0 };
  const days = new Set<string>();
  const weekDays = new Set<string>();
  const seen = new Set<string>();
  let newExercisesThisWeek = 0;

  for (const f of sorted) {
    const week = inWeek(f.date);
    str.total += f.sets;
    sta.total += f.minutes;
    days.add(f.date.toString());
    if (week) {
      str.week += f.sets;
      sta.week += f.minutes;
      weekDays.add(f.date.toString());
    }
    for (const name of f.exercises) {
      if (seen.has(name)) continue;
      seen.add(name);
      if (week) newExercisesThisWeek++;
    }
  }

  return {
    STR: str,
    DEX: { total: seen.size, week: newExercisesThisWeek },
    CON: { total: days.size, week: weekDays.size },
    STA: sta,
  };
}
