/**
 * Tokens fora de cor (design-spec §A): tipografia, espaço, altura e movimento.
 * As cores vivem em `palettes.ts`.
 */

export const fontFamily = {
  display: 'PixelifySans_500Medium',
  displayBold: 'PixelifySans_600SemiBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

/** Tamanhos em px; números a partir de 20 px usam Space Mono 700 (`<Num>`). */
export const typeSize = {
  hero: 56,
  display: 40,
  titleLg: 26,
  title: 20,
  titleSm: 16,
  bodyLg: 15,
  body: 13,
  small: 12,
  label: 11,
  micro: 10,
} as const;

export const type = {
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: typeSize.title,
    lineHeight: 24,
  },
  titleSm: {
    fontFamily: fontFamily.display,
    fontSize: typeSize.titleSm,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: fontFamily.mono,
    fontSize: typeSize.bodyLg,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily.mono,
    fontSize: typeSize.body,
    lineHeight: 20,
  },
  small: {
    fontFamily: fontFamily.mono,
    fontSize: typeSize.small,
    lineHeight: 16,
  },
  micro: {
    fontFamily: fontFamily.mono,
    fontSize: typeSize.micro,
    lineHeight: 14,
  },
  stat: {
    fontFamily: fontFamily.monoBold,
    fontSize: 22,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamily.monoBold,
    fontSize: typeSize.label,
    lineHeight: 14,
    letterSpacing: 0.14 * typeSize.label,
    textTransform: 'uppercase',
  },
} as const;

/** Escala de 4 px do redesign. */
export const space = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  11: 60,
  12: 64,
} as const;

/** Alturas fixas (DR19: alvo de toque mínimo 44 px). */
export const size = {
  hitMin: 44,
  tabbar: 64,
  appbar: 56,
} as const;

/** Largura do degrau dos cantos: 1 em controles ≤ 48 px, 2 em cards/botões, 3 em diálogos. */
export const pixelStep = 2;
export const steps = { control: 1, card: 2, dialog: 3 } as const;

export const motion = {
  dur1: 120,
  dur2: 240,
  dur3: 400,
  durXp: 800,
  /** Afundamento ao pressionar (px). */
  pressButton: 4,
  pressIconButton: 2,
  /** Sombra dura: deslocamento da View de trás (px). */
  hardShadow: 4,
} as const;
