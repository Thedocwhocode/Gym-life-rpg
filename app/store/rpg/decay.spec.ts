import {
  applyInactivityDecay,
  awardXp,
  hydrateRpgState,
  rpgReducer,
} from '@/store/rpg';
import { decayedXp, inactivityLoss } from '@/store/rpg/decay';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';

describe('inactivityLoss', () => {
  it('não perde nada antes de 14 dias', () => {
    expect(inactivityLoss(0)).toBe(0);
    expect(inactivityLoss(13)).toBe(0);
    expect(inactivityLoss(-3)).toBe(0);
  });

  it('começa em 1% e acelera, dobrando a cada 7 dias', () => {
    expect(inactivityLoss(14)).toBeCloseTo(0.01);
    expect(inactivityLoss(21)).toBeCloseTo(0.02);
    expect(inactivityLoss(28)).toBeCloseTo(0.04);
    expect(inactivityLoss(42)).toBeCloseTo(0.16);
    // cada semana tira mais que a anterior
    const steps = [14, 21, 28, 35, 42].map(inactivityLoss);
    for (let i = 2; i < steps.length; i++) {
      expect(steps[i] - steps[i - 1]).toBeGreaterThan(
        steps[i - 1] - steps[i - 2],
      );
    }
  });

  it('para no teto', () => {
    expect(inactivityLoss(365)).toBe(0.8);
  });
});

describe('decayedXp', () => {
  const on = LocalDate.parse('2026-11-11');
  it('aplica a pausa desde o último treino', () => {
    expect(decayedXp(1000, '2026-10-28', on)).toBe(990); // 14 dias
    expect(decayedXp(1000, '2026-11-01', on)).toBe(1000);
    expect(decayedXp(1000, '2026-10-28T10:00:00.000Z', on)).toBe(990);
  });
  it('sem data ou data inválida não perde', () => {
    expect(decayedXp(1000, undefined, on)).toBe(1000);
    expect(decayedXp(1000, 'lixo', on)).toBe(1000);
  });
});

describe('applyInactivityDecay + awardXp', () => {
  it('a pausa vira perda permanente e o XP novo entra inteiro', () => {
    const start = rpgReducer(
      undefined,
      hydrateRpgState({ xp: 1000, lastWorkoutDate: '2026-10-01' }),
    );
    // 01/10 → 29/10 = 28 dias: perde 4%.
    const decayed = rpgReducer(
      start,
      applyInactivityDecay({ date: '2026-10-29' }),
    );
    expect(decayed.xp).toBe(960);
    expect(rpgReducer(decayed, awardXp(50)).xp).toBe(1010);
  });
});
