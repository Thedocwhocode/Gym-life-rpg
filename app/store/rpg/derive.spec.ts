import type { AttrWeights } from '@/store/journey/rules/attributes';
import {
  deriveAttributes,
  sessionFacts,
  type SessionFacts,
} from '@/store/rpg/derive';
import {
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import { LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

const day = (iso: string) => LocalDate.parse(iso);
const fact = (iso: string, attrXp: AttrWeights): SessionFacts => ({
  date: day(iso),
  sets: 0,
  minutes: 0,
  exercises: [],
  attrXp,
});

describe('deriveAttributes', () => {
  // 2026-11-09 é segunda-feira: a semana ISO vai de 09 a 15.
  const today = day('2026-11-11');

  it('zera tudo sem sessões, INT incluído', () => {
    const zero = { total: 0, week: 0 };
    expect(deriveAttributes([], today)).toEqual({
      STR: zero,
      AGI: zero,
      END: zero,
      VIT: zero,
      INT: zero,
    });
  });

  it('soma o XP de atributo de cada sessão e separa a semana ISO', () => {
    const attrs = deriveAttributes(
      [
        fact('2026-11-08', { STR: 30, VIT: 5 }), // domingo anterior
        fact('2026-11-09', { STR: 20, END: 40, AGI: 10 }),
        fact('2026-11-11', { END: 12 }),
      ],
      today,
    );
    expect(attrs.STR).toEqual({ total: 50, week: 20 });
    expect(attrs.END).toEqual({ total: 52, week: 52 });
    expect(attrs.AGI).toEqual({ total: 10, week: 10 });
    expect(attrs.VIT).toEqual({ total: 5, week: 0 });
    expect(attrs.INT).toEqual({ total: 0, week: 0 });
  });

  it('ignora sessões depois de hoje na semana e não depende da ordem', () => {
    const attrs = deriveAttributes(
      [fact('2026-11-13', { STR: 3 }), fact('2026-11-01', { STR: 1 })],
      today,
    );
    expect(attrs.STR).toEqual({ total: 4, week: 0 });
  });

  it('pausas de 14+ dias cortam os totais, e a pausa atual também', () => {
    // 01/10 → 11/11 = 41 dias parado: perde 1% × 2^(27/7) ≈ 14,5%.
    const parado = deriveAttributes([fact('2026-10-01', { STR: 100 })], today);
    expect(parado.STR).toEqual({ total: 85, week: 0 });
    // Treinou de novo em 11/11: a perda da pausa fica e o ganho novo entra inteiro.
    const voltou = deriveAttributes(
      [fact('2026-10-01', { STR: 100 }), fact('2026-11-11', { STR: 10 })],
      today,
    );
    expect(voltou.STR).toEqual({ total: 95, week: 10 });
  });
});

describe('sessionFacts → attrXp', () => {
  // 3 séries de 10 com 40 kg; a última não foi feita.
  const session = (bodyweight?: Weight) => {
    const bp = new WeightedExerciseBlueprint(
      'Calf Raise',
      3,
      10,
      new BigNumber('2.5'),
      Rest.medium,
      false,
      '',
      '',
    );
    const done = new RecordedSet(10, OffsetDateTime.now());
    const sets = [done, done, undefined].map(
      (s) => new PotentialSet(s, new Weight(40, 'kilograms')),
    );
    return new Session(
      'id',
      new SessionBlueprint('Pernas', [bp], ''),
      [new RecordedWeightedExercise(bp, sets, undefined)],
      LocalDate.parse('2026-11-11'),
      bodyweight,
    );
  };

  it('sem descrição na biblioteca, as séries feitas viram STR (PC padrão 80 kg)', () => {
    expect(sessionFacts(session()).attrXp).toEqual({ STR: 20 });
  });

  it('usa o peso corporal da sessão e os músculos do exercício', () => {
    const traits = (name: string) =>
      name === 'Calf Raise' ? { muscles: ['calves'] } : undefined;
    // PC 40 kg: carga relativa 1 → 20 XP por série.
    expect(
      sessionFacts(session(new Weight(40, 'kilograms')), traits).attrXp,
    ).toEqual({ AGI: 40 });
  });
});
