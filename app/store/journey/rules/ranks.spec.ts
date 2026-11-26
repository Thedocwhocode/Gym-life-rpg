import { nextRank, rankFor } from '@/store/journey/rules/ranks';
import { describe, expect, it } from 'vitest';

const facts = (level: number, goalWeeks = 0, prs = 0, dailies = 0) => ({
  level,
  goalWeeks,
  prs,
  dailies,
});

describe('rankFor', () => {
  it('começa no E e pede nível e prova juntos', () => {
    expect(rankFor(facts(1))).toBe('E');
    expect(rankFor(facts(12))).toBe('E');
    expect(rankFor(facts(12, 4))).toBe('D');
  });

  it('não pula rank: passar no C sem ter passado no D fica no E', () => {
    expect(rankFor(facts(25, 0, 5))).toBe('E');
    expect(rankFor(facts(25, 4, 5))).toBe('C');
  });

  it('S pede 292 diárias', () => {
    expect(rankFor(facts(80, 30, 12, 291))).toBe('A');
    expect(rankFor(facts(80, 30, 12, 292))).toBe('S');
  });
});

describe('nextRank', () => {
  it('diz o que falta para o próximo', () => {
    expect(nextRank(facts(8, 2))).toEqual({
      id: 'D',
      missing: [
        { key: 'level', have: 8, need: 10 },
        { key: 'goalWeeks', have: 2, need: 4 },
      ],
    });
    expect(nextRank(facts(80, 30, 12, 300))).toBeUndefined();
  });
});
