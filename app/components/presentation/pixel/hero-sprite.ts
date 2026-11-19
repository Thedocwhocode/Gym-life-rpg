import { HERO_COLORS, HERO_SPRITE } from '@/components/presentation/fx/engine';

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

/** Pixels do herói parado; com `tunic`, a túnica (t claro, T sombra) fica na cor da classe (DR12). */
export function heroPixels(tunic?: string): SpritePixel[] {
  const colors: Readonly<Record<string, string>> = tunic
    ? { ...HERO_COLORS, t: tunic, T: shade(tunic, 0.7) }
    : HERO_COLORS;
  return HERO_SPRITE.flatMap((row, y) =>
    [...row].flatMap((ch, x) =>
      ch === '.' ? [] : [{ x, y, color: colors[ch] ?? '#000000' }],
    ),
  );
}
