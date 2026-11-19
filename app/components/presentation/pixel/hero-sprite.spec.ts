import { describe, expect, it } from 'vitest';
import { HERO_COLORS, HERO_SPRITE } from '@/components/presentation/fx/engine';
import {
  HERO_SIZE,
  heroPixels,
  shade,
} from '@/components/presentation/pixel/hero-sprite';

const at = (x: number, y: number, tunic?: string) =>
  heroPixels(tunic).find((p) => p.x === x && p.y === y)?.color;

describe('heroPixels', () => {
  it('desenha só os pixels cheios do sprite, com as cores do pixelfx', () => {
    const filled = HERO_SPRITE.join('').replace(/\./g, '').length;
    expect(HERO_SIZE).toEqual({ w: 12, h: 19 });
    expect(heroPixels()).toHaveLength(filled);
    expect(heroPixels().every((p) => p.color.startsWith('#'))).toBe(true);
    // linha 9 = "..kttttttk..": x 3 é túnica
    expect(at(3, 9)).toBe(HERO_COLORS.t);
  });

  it('pinta a túnica na cor da classe e mantém o resto', () => {
    expect(at(3, 9, '#d8683f')).toBe('#d8683f');
    // linha 10 = ".kttTttTttk.": x 4 é a sombra da túnica
    expect(at(4, 10, '#d8683f')).toBe(shade('#d8683f', 0.7));
    // linha 4 = ".khhssssshhk": x 4 é pele
    expect(at(4, 4, '#d8683f')).toBe(HERO_COLORS.s);
  });
});

describe('shade', () => {
  it('escurece cada canal', () => {
    expect(shade('#ffffff', 0.5)).toBe('#808080');
    expect(shade('#d8683f', 1)).toBe('#d8683f');
  });
});
