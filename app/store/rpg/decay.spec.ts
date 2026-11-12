import { inactivityLoss } from '@/store/rpg/decay';
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
