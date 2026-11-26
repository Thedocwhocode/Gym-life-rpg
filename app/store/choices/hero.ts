/** Nome do herói: o Sistema chama por ele. Só local (não vai para o feed). */
export const HERO_NAME_MAX = 16;

/** Nome limpo (trim, espaços internos colapsados) ou undefined se vazio/longo demais. */
export function heroName(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const name = v.trim().replace(/\s+/g, ' ');
  return name.length >= 1 && name.length <= HERO_NAME_MAX ? name : undefined;
}

/** Visual do criador de sprite: índices de paleta (pixel/hero-sprite.ts). */
export interface HeroLook {
  skin: number;
  hair: number;
}

// shortcut: teto folgado em vez das listas de cor (o store não importa componente); índice sem cor cai no original no heroPixels.
const isIndex = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) < 16;

export function heroLook(v: unknown): HeroLook | undefined {
  const o = (v ?? {}) as Record<string, unknown>;
  return isIndex(o['skin']) && isIndex(o['hair'])
    ? { skin: o['skin'] as number, hair: o['hair'] as number }
    : undefined;
}
