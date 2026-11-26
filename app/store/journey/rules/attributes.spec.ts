import {
  distributeXp,
  weightsFor,
  xpForMinutes,
  xpForSet,
} from '@/store/journey/rules/attributes';
import { describe, expect, it } from 'vitest';

describe('xpForSet', () => {
  it('2 × reps × carga relativa, com teto de 40', () => {
    // 10 reps com 40 kg num herói de 80 kg: 2 × 10 × 0,5 = 10.
    expect(xpForSet(10, 40, 80)).toBe(10);
    expect(xpForSet(10, 200, 80)).toBe(40);
  });

  it('isolado vale 70% e peso do corpo entra pela fração', () => {
    expect(xpForSet(10, 40, 80, 0, true)).toBe(7);
    // Flexão: 0 kg + 80 × 0,6 → 2 × 10 × 0,6 = 12.
    expect(xpForSet(10, 0, 80, 0.6)).toBe(12);
  });

  it('série sem reps não dá nada', () => {
    expect(xpForSet(0, 100)).toBe(0);
  });
});

describe('xpForMinutes', () => {
  it('minutos × MET × 0,25', () => {
    expect(xpForMinutes(30, 7)).toBe(53);
  });
});

describe('weightsFor', () => {
  it('sem descrição é força', () => {
    expect(weightsFor(undefined)).toEqual({ STR: 1 });
  });

  it('categoria vence o músculo', () => {
    expect(weightsFor({ category: 'cardio', muscles: ['quads'] })).toEqual({
      END: 0.8,
      AGI: 0.2,
    });
    expect(weightsFor({ category: 'plyometrics' })).toEqual({
      AGI: 0.7,
      STR: 0.3,
    });
    expect(weightsFor({ category: 'stretching' })).toEqual({ VIT: 1 });
  });

  it('músculos: principal 1,0 e secundários 0,5, normalizado', () => {
    // Panturrilha (AGI) principal, quadríceps (STR) secundário: 1 / 1,5 e 0,5 / 1,5.
    const w = weightsFor({
      category: 'strength',
      muscles: ['calves', 'quads'],
    });
    expect(w.AGI).toBeCloseTo(2 / 3);
    expect(w.STR).toBeCloseTo(1 / 3);
    expect(weightsFor({ muscles: ['abdominals'] })).toEqual({ VIT: 1 });
  });
});

describe('distributeXp', () => {
  it('a soma dos pedaços é o XP inteiro', () => {
    const d = distributeXp(10, { STR: 1 / 3, AGI: 1 / 3, END: 1 / 3 });
    expect(d).toEqual({ STR: 3, AGI: 3, END: 4 });
  });
});
