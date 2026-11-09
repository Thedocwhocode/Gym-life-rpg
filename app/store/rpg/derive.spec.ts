import { deriveAttributes, type SessionFacts } from '@/store/rpg/derive';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';

const day = (iso: string) => LocalDate.parse(iso);
const fact = (
  iso: string,
  sets: number,
  minutes: number,
  exercises: string[],
): SessionFacts => ({ date: day(iso), sets, minutes, exercises });

describe('deriveAttributes', () => {
  // 2026-11-09 é segunda-feira: a semana ISO vai de 09 a 15.
  const today = day('2026-11-11');

  it('zera tudo sem sessões', () => {
    expect(deriveAttributes([], today)).toEqual({
      STR: { total: 0, week: 0 },
      DEX: { total: 0, week: 0 },
      CON: { total: 0, week: 0 },
      STA: { total: 0, week: 0 },
    });
  });

  it('acumula a vida e separa a semana ISO', () => {
    const attrs = deriveAttributes(
      [
        fact('2026-11-08', 10, 40, ['Supino', 'Agachamento']), // domingo anterior
        fact('2026-11-09', 6, 30, ['Supino', 'Remada']),
        fact('2026-11-11', 4, 20, ['Remada']),
        fact('2026-11-11', 2, 5, ['Prancha']),
      ],
      today,
    );
    expect(attrs.STR).toEqual({ total: 22, week: 12 });
    expect(attrs.STA).toEqual({ total: 95, week: 55 });
    expect(attrs.CON).toEqual({ total: 3, week: 2 });
    // Remada e Prancha são novos nesta semana; Supino já vinha de antes.
    expect(attrs.DEX).toEqual({ total: 4, week: 2 });
  });

  it('ignora sessões depois de hoje na semana e não depende da ordem', () => {
    const attrs = deriveAttributes(
      [fact('2026-11-13', 3, 10, ['Novo']), fact('2026-11-01', 1, 1, ['Novo'])],
      today,
    );
    expect(attrs.DEX).toEqual({ total: 1, week: 0 });
    expect(attrs.STR).toEqual({ total: 4, week: 0 });
  });
});
