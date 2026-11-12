import { useAppSelector } from '@/store';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme,
  Theme,
} from '@react-navigation/native';
import { MsIconSrc } from '@/components/presentation/ms-icon-source';
import { fixedColors, Palette, palettes } from '@/theme/palettes';
import { AppThemeColors, buildScheme } from '@/theme/scheme';
import { fontFamily } from '@/theme/tokens';

export type { AppThemeColors } from '@/theme/scheme';

// Redesign: cantos retos em todo o app (roundness 0).
export const rounding = {
  roundedRectangleRadius: 0,
  roundedRectangleFocusRingRadius: 0,
};

export const spacing = {
  pageHorizontalMargin: 16, // spacing[4]
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  15: 60,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
} as const;

export const font = {
  'text-2xs': {
    fontSize: 10,
    lineHeight: 14,
  },
  'text-xs': {
    fontSize: 12,
    lineHeight: 16,
  },
  'text-sm': {
    fontSize: 14,
    lineHeight: 20,
  },
  'text-base': {
    fontSize: 16,
    lineHeight: 24,
  },
  'text-lg': {
    fontSize: 18,
    lineHeight: 28,
  },
  'text-xl': {
    fontSize: 20,
    lineHeight: 28,
  },
  'text-2xl': {
    fontSize: 24,
    lineHeight: 32,
  },
  'text-3xl': {
    fontSize: 30,
    lineHeight: 40,
  },
  'text-4xl': {
    fontSize: 40,
    lineHeight: 50,
  },
} as const;

// Display/headline/title em Pixelify Sans; body/label em Space Mono (design-spec §A.3).
const fontConfig = {
  displayLarge: {
    fontFamily: fontFamily.display,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  displayMedium: {
    fontFamily: fontFamily.display,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  displaySmall: {
    fontFamily: fontFamily.display,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  headlineLarge: {
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  headlineMedium: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  headlineSmall: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  titleLarge: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  titleMedium: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '400' as const,
  },
  titleSmall: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '400' as const,
  },
  labelLarge: {
    fontFamily: fontFamily.monoBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '400' as const,
  },
  labelMedium: {
    fontFamily: fontFamily.monoBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '400' as const,
  },
  labelSmall: {
    fontFamily: fontFamily.monoBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontFamily: fontFamily.mono,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontFamily: fontFamily.mono,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as const,
  },
};

export type FontChoice = keyof typeof font;

export type ColorChoice = keyof {
  [K in keyof AppThemeColors as AppThemeColors[K] extends string
    ? K
    : never]: AppThemeColors[K];
};

export interface AppTheme {
  colors: AppThemeColors;
  colorScheme: 'light' | 'dark';
  /** Paleta ativa: acesso direto aos aliases semânticos (`surface1`, `line2`…). */
  palette: Palette;
  /** Cores que não mudam com a paleta (palco de FX, brilhos âmbar). */
  fixed: typeof fixedColors;
}

const AppThemeContext = createContext<AppTheme | undefined>(undefined);

export const useAppTheme = (): AppTheme => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a AppThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  const paletteId = useAppSelector((state) => state.settings.palette);
  const palette = palettes[paletteId];
  const isDark = palette.isDark;

  const appTheme = useMemo<AppTheme>(
    () => ({
      colors: buildScheme(palette),
      colorScheme: isDark ? 'dark' : 'light',
      palette,
      fixed: fixedColors,
    }),
    [palette, isDark],
  );

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      roundness: 0,
      colors: appTheme.colors,
      fonts: configureFonts({ config: fontConfig }),
    };
  }, [appTheme, isDark]);

  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        background: appTheme.colors.background,
        border: appTheme.colors.outline,
        card: appTheme.colors.surfaceContainer,
        notification: appTheme.colors.surface,
        primary: appTheme.colors.primary,
        text: appTheme.colors.onSurface,
      },
    };
  }, [appTheme, isDark]);

  return (
    <AppThemeContext.Provider value={appTheme}>
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props) => (
            <MsIconSrc
              {...props}
              color={props.color ?? appTheme.colors.onSurface}
            />
          ),
        }}
      >
        <NavigationThemeProvider value={navigationTheme}>
          {children}
        </NavigationThemeProvider>
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};

export function argbToHexRGBA(argb: number): string {
  const a = (argb >> 24) & 0xff;
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}
