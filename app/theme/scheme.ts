import { contrastRatio } from './contrast';
import type { Palette } from './palettes';

/** Esquema no formato MD3 que o Paper e o resto do app consomem. */
export interface Material3Scheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  shadow: string;
  scrim: string;
  surfaceDisabled: string;
  onSurfaceDisabled: string;
  backdrop: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright: string;
  surfaceDim: string;
  surfaceTint: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
}

type ColorPair<T extends string> = { [k in T | `on${Capitalize<T>}`]: string };

const EXTRA_COLORS = [
  'orange',
  'red',
  'yellow',
  'blue',
  'green',
  'purple',
  'pink',
  'teal',
  'cyan',
  'brown',
  'indigo',
  'lime',
  'amber',
] as const;
type ExtraColor = (typeof EXTRA_COLORS)[number];

export type AppThemeColors = Material3Scheme & ColorPair<ExtraColor>;

/** Nomes legados (`orange`, `red`…) apontam para tons da paleta. */
function extraTone(p: Palette): Record<ExtraColor, string> {
  return {
    orange: p.attrStr,
    red: p.dangerStrong,
    yellow: p.reward,
    blue: p.steel,
    green: p.success,
    purple: p.steel,
    pink: p.dangerStrong,
    teal: p.attrSta,
    cyan: p.steel,
    brown: p.accentMuted,
    indigo: p.steel,
    lime: p.attrDex,
    amber: p.accent,
  };
}

/** Texto legível sobre `bg`: o de maior contraste entre o escuro e o claro da paleta. */
function onColor(p: Palette, bg: string): string {
  return contrastRatio(bg, p.bgApp) >= contrastRatio(bg, p.text1)
    ? p.bgApp
    : p.text1;
}

/** Mapa explícito alias da paleta → papel MD3 (PLANO §3.1). */
export function buildScheme(p: Palette): AppThemeColors {
  const extras = extraTone(p);
  const pairs = {} as Record<string, string>;
  for (const name of EXTRA_COLORS) {
    const tone = extras[name];
    pairs[name] = tone;
    pairs[`on${name.charAt(0).toUpperCase()}${name.slice(1)}`] = onColor(
      p,
      tone,
    );
  }
  return {
    primary: p.accent,
    onPrimary: p.textOnAccent,
    primaryContainer: p.accentWash,
    onPrimaryContainer: p.accentStrong,
    secondary: p.text2,
    onSecondary: p.bgApp,
    secondaryContainer: p.surface3,
    onSecondaryContainer: p.text1,
    tertiary: p.reward,
    onTertiary: p.textOnAccent,
    tertiaryContainer: p.accentWash,
    onTertiaryContainer: p.reward,
    background: p.bgApp,
    onBackground: p.text1,
    surface: p.bgApp,
    onSurface: p.text1,
    surfaceVariant: p.surface2,
    onSurfaceVariant: p.text2,
    outline: p.line2,
    outlineVariant: p.line1,
    inverseSurface: p.text1,
    inverseOnSurface: p.bgApp,
    inversePrimary: p.accentStrong,
    // Texto de erro usa `dangerStrong` (DR16); o ícone sobre ele é o fundo do app.
    error: p.dangerStrong,
    onError: p.bgApp,
    errorContainer: p.dangerWash,
    onErrorContainer: p.dangerStrong,
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: p.surface2,
    onSurfaceDisabled: p.textDisabled,
    backdrop: p.surfaceOverlay,
    surfaceContainer: p.surface1,
    surfaceContainerLow: p.surface1,
    surfaceContainerLowest: p.bgSunken,
    surfaceContainerHigh: p.surface2,
    surfaceContainerHighest: p.surface3,
    surfaceBright: p.surface2,
    surfaceDim: p.bgSunken,
    // Sem tinta de elevação: o redesign usa superfícies chapadas.
    surfaceTint: 'transparent',
    elevation: {
      level0: 'transparent',
      level1: p.surface1,
      level2: p.surface1,
      level3: p.surface2,
      level4: p.surface2,
      level5: p.surface3,
    },
    ...pairs,
  } as AppThemeColors;
}
