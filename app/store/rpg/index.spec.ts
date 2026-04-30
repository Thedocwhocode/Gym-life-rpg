import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  levelFromXp,
  titleForLevel,
  xpProgress,
} from './index';

describe('xpForLevel', () => {
  it('level 1 requires 0 XP', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('level 2 requires 100 XP', () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it('level 3 requires 400 XP', () => {
    expect(xpForLevel(3)).toBe(400);
  });

  it('level 5 requires 1600 XP', () => {
    expect(xpForLevel(5)).toBe(1600);
  });

  it('level 10 requires 8100 XP', () => {
    expect(xpForLevel(10)).toBe(8100);
  });

  it('follows (level-1)^2 * 100 formula', () => {
    for (let n = 1; n <= 20; n++) {
      expect(xpForLevel(n)).toBe(Math.pow(n - 1, 2) * 100);
    }
  });
});

describe('levelFromXp', () => {
  it('0 XP is level 1', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('99 XP is still level 1', () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it('100 XP is level 2', () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it('399 XP is level 2', () => {
    expect(levelFromXp(399)).toBe(2);
  });

  it('400 XP is level 3', () => {
    expect(levelFromXp(400)).toBe(3);
  });

  it('1600 XP is level 5', () => {
    expect(levelFromXp(1600)).toBe(5);
  });

  it('8100 XP is level 10', () => {
    expect(levelFromXp(8100)).toBe(10);
  });

  it('levelFromXp is inverse of xpForLevel', () => {
    for (let level = 1; level <= 20; level++) {
      expect(levelFromXp(xpForLevel(level))).toBe(level);
    }
  });

  it('never returns less than 1', () => {
    expect(levelFromXp(-100)).toBe(1);
  });
});

describe('titleForLevel', () => {
  it('level 1 is Iniciante', () => {
    expect(titleForLevel(1)).toBe('Iniciante');
  });

  it('level 2 is Iniciante', () => {
    expect(titleForLevel(2)).toBe('Iniciante');
  });

  it('level 3 is Guerreiro Novato', () => {
    expect(titleForLevel(3)).toBe('Guerreiro Novato');
  });

  it('level 6 is Espadachim da Academia', () => {
    expect(titleForLevel(6)).toBe('Espadachim da Academia');
  });

  it('level 10 is Cavaleiro do Ferro', () => {
    expect(titleForLevel(10)).toBe('Cavaleiro do Ferro');
  });

  it('level 15 is Mestre das Placas', () => {
    expect(titleForLevel(15)).toBe('Mestre das Placas');
  });

  it('level 20 is Lenda da Academia', () => {
    expect(titleForLevel(20)).toBe('Lenda da Academia');
  });

  it('level 25 is Lenda da Academia', () => {
    expect(titleForLevel(25)).toBe('Lenda da Academia');
  });
});

describe('xpProgress', () => {
  it('at level 1 start: current=0, needed=100', () => {
    const p = xpProgress(0);
    expect(p.current).toBe(0);
    expect(p.needed).toBe(100);
  });

  it('at 50 XP (mid level 1): current=50, needed=100', () => {
    const p = xpProgress(50);
    expect(p.current).toBe(50);
    expect(p.needed).toBe(100);
  });

  it('at exactly level 2 start (100 XP): current=0, needed=300', () => {
    const p = xpProgress(100);
    expect(p.current).toBe(0);
    expect(p.needed).toBe(300);
  });

  it('at 250 XP (mid level 2): current=150, needed=300', () => {
    const p = xpProgress(250);
    expect(p.current).toBe(150);
    expect(p.needed).toBe(300);
  });

  it('current is always between 0 and needed', () => {
    const testXps = [0, 50, 100, 200, 400, 800, 1600, 3200, 8100];
    for (const xp of testXps) {
      const p = xpProgress(xp);
      expect(p.current).toBeGreaterThanOrEqual(0);
      expect(p.current).toBeLessThanOrEqual(p.needed);
    }
  });
});
