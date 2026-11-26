import { describe, expect, it } from 'vitest';
import { HERO_COLORS, HERO_SPRITE } from '@/components/presentation/fx/engine';
import {
  HAIR_COLORS,
  HERO_SIZE,
  heroPixels,
  shade,
  SKIN_TONES,
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

describe('heroPixels com visual', () => {
  it('índice 0 é idêntico ao herói sem visual', () => {
    expect(heroPixels('#d8683f', { skin: 0, hair: 0 })).toEqual(
      heroPixels('#d8683f'),
    );
  });

  it('troca só pele e cabelo', () => {
    const base = heroPixels('#d8683f');
    const looked = heroPixels('#d8683f', { skin: 3, hair: 2 });
    const allowed = new Set([
      SKIN_TONES[3][0],
      SKIN_TONES[3][1],
      HAIR_COLORS[2],
    ]);
    const changed = looked.filter((p, i) => p.color !== base[i].color);
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every((p) => allowed.has(p.color))).toBe(true);
    // linha 4 = ".khhssssshhk": x 4 é pele, x 2 é cabelo
    expect(looked.find((p) => p.x === 4 && p.y === 4)?.color).toBe(
      SKIN_TONES[3][0],
    );
    expect(looked.find((p) => p.x === 2 && p.y === 4)?.color).toBe(
      HAIR_COLORS[2],
    );
  });

  it('índice fora da faixa cai no original', () => {
    expect(heroPixels(undefined, { skin: 99, hair: -1 })).toEqual(heroPixels());
  });
});

describe('shade', () => {
  it('escurece cada canal', () => {
    expect(shade('#ffffff', 0.5)).toBe('#808080');
    expect(shade('#d8683f', 1)).toBe('#d8683f');
  });
});
