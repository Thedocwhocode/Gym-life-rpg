import { HERO_COLORS, HERO_SPRITE } from '@/components/presentation/fx/engine';
import type { HeroLook } from '@/store/choices/hero';

export type { HeroLook };

export interface SpritePixel {
  x: number;
  y: number;
  color: string;
}

export const HERO_SIZE = {
  w: HERO_SPRITE[0]?.length ?? 0,
  h: HERO_SPRITE.length,
};

/** Escurece um `#rrggbb` multiplicando cada canal por `k`. */
export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const channel = (shift: number) =>
    Math.round(((n >> shift) & 255) * k)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

/** Tons de pele (s claro, S sombra) do criador de sprite; o 0 é o original do pixelfx. */
export const SKIN_TONES: readonly (readonly [string, string])[] = [
  [HERO_COLORS.s ?? '#f3c49d', HERO_COLORS.S ?? '#c98b6c'],
  ['#e0a878', '#b07850'],
  ['#c68a5a', '#97633c'],
  ['#8d5a3b', '#6a3f27'],
  ['#5e3a26', '#432819'],
];
/** Cores de cabelo; o 0 é o original. Nada de preto puro: some no contorno (k). */
export const HAIR_COLORS: readonly string[] = [
  HERO_COLORS.h ?? '#7a4128',
  '#2b2230',
  '#d9b24a',
  '#b8452c',
  '#c9c4bd',
  '#5a7fd6',
];

/**
 * Pixels do herói parado; com `tunic`, a túnica (t claro, T sombra) fica na cor da classe (DR12);
 * com `look`, pele e cabelo vêm do criador de sprite.
 */
export function heroPixels(tunic?: string, look?: HeroLook): SpritePixel[] {
  const skin = SKIN_TONES[look?.skin ?? 0] ?? SKIN_TONES[0];
  const colors: Readonly<Record<string, string>> = {
    ...HERO_COLORS,
    ...(tunic ? { t: tunic, T: shade(tunic, 0.7) } : {}),
    ...(look
      ? { s: skin[0], S: skin[1], h: HAIR_COLORS[look.hair] ?? HAIR_COLORS[0] }
      : {}),
  };
  return HERO_SPRITE.flatMap((row, y) =>
    [...row].flatMap((ch, x) =>
      ch === '.' ? [] : [{ x, y, color: colors[ch] ?? '#000000' }],
    ),
  );
}
