import IconButton from '@/components/presentation/pixel/IconButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, size, TITLE_MAX_SCALE } from '@/theme/tokens';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export interface AppHeaderProps {
  title: string;
  eyebrow?: string | undefined;
  onBack?: (() => void) | undefined;
  backLabel?: string | undefined;
  actions?: ReactNode;
  topInset?: number | undefined;
}

/** Barra superior: 56 px, borda inferior de 1 px, eyebrow em caixa alta acima do título. */
export default function AppHeader({
  title,
  eyebrow,
  onBack,
  backLabel = 'Voltar',
  actions,
  topInset = 0,
}: AppHeaderProps) {
  const { palette } = useAppTheme();
  return (
    <View
      accessibilityRole="header"
      testID="appbar-header"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: size.appbar + topInset,
        paddingTop: topInset,
        paddingLeft: onBack ? 4 : 16,
        paddingRight: 8,
        backgroundColor: palette.bgApp,
        borderBottomWidth: 1,
        borderBottomColor: palette.line1,
      }}
    >
      {onBack ? (
        <IconButton
          icon="chevron-left"
          label={backLabel}
          onPress={onBack}
          testID="icon-button"
        />
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {eyebrow ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamily.monoBold,
              fontSize: 11,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
              color: palette.text3,
            }}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          numberOfLines={1}
          style={{
            fontFamily: fontFamily.display,
            fontSize: 20,
            color: palette.text1,
          }}
        >
          {title}
        </Text>
      </View>
      {actions ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {actions}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Opções de tela com eyebrow. `eyebrow` não existe no tipo do native-stack;
 * o MaterialStackHeader o lê de volta com `eyebrowOf`.
 */
export function headerOptions(
  title: string,
  eyebrow?: string,
  extra?: NativeStackNavigationOptions,
): NativeStackNavigationOptions {
  return { ...extra, title, eyebrow } as NativeStackNavigationOptions;
}

export function eyebrowOf(options: NativeStackNavigationOptions) {
  return (options as { eyebrow?: string }).eyebrow;
}
