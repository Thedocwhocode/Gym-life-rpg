import PixelBox from '@/components/presentation/pixel/PixelBox';
import Icon from '@/components/presentation/pixel/Icon';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText, type Palette } from '@/theme/palettes';
import { fontFamily, size } from '@/theme/tokens';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'ghost';
const HEIGHT = { sm: 36, md: size.hitMin, lg: 56 } as const;

export interface ButtonProps {
  children: ReactNode;
  onPress?: (() => void) | undefined;
  variant?: ButtonVariant | undefined;
  size?: keyof typeof HEIGHT | undefined;
  icon?: PixelIconName | undefined;
  iconRight?: PixelIconName | undefined;
  /** Ocupa a largura toda. */
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  /** v1.1: troca o ícone por um spinner ASCII e bloqueia o toque até terminar. */
  loading?: boolean | undefined;
  style?: StyleProp<ViewStyle>;
  /** Rótulo do leitor de tela quando o texto visível não basta (ex.: vários "Add" numa lista). */
  accessibilityLabel?: string | undefined;
  testID?: string | undefined;
}

function variantColors(p: Palette, variant: Exclude<ButtonVariant, 'ghost'>) {
  switch (variant) {
    case 'danger':
      return {
        border: p.dangerStrong,
        fill: p.dangerDeep,
        text: p.textOnDanger,
      };
    case 'secondary':
      return { border: p.lineControl, fill: p.surface2, text: p.text1 };
    default:
      return { border: p.accentStrong, fill: p.accent, text: p.textOnAccent };
  }
}

const SPIN = '|/-\\';

function Spinner({ color, fontSize }: { color: string; fontSize: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SPIN.length), 120);
    return () => clearInterval(t);
  }, []);
  return (
    <Text
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={{
        fontFamily: fontFamily.monoBold,
        fontSize,
        color,
        width: fontSize,
      }}
    >
      {SPIN[i]}
    </Text>
  );
}

/** Botão pixel: sombra dura que afunda 4 px ao pressionar. `ghost` vira `[ ROTULO ]`. */
export default function Button({
  children,
  onPress,
  variant = 'primary',
  size: buttonSize = 'md',
  icon,
  iconRight,
  block = false,
  disabled: disabledProp = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { palette } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const disabled = disabledProp || loading;
  const height = HEIGHT[buttonSize];
  const ghost = variant === 'ghost';
  const colors = ghost ? null : variantColors(palette, variant);
  const textColor = colors ? colors.text : accentText(palette);
  const fontSize = buttonSize === 'lg' ? 15 : 13;

  const content = (
    <View
      style={{
        minHeight: height - 2 * 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 12,
      }}
    >
      {ghost ? (
        <Text
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={{
            fontFamily: fontFamily.mono,
            fontSize,
            color: palette.text3,
          }}
        >
          [
        </Text>
      ) : null}
      {loading ? (
        <Spinner color={textColor} fontSize={fontSize} />
      ) : icon ? (
        <Icon name={icon} size={24} color={textColor} />
      ) : null}
      <Text
        style={{
          fontFamily: fontFamily.monoBold,
          fontSize,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: textColor,
        }}
      >
        {children}
      </Text>
      {iconRight ? <Icon name={iconRight} size={24} color={textColor} /> : null}
      {ghost ? (
        <Text
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={{
            fontFamily: fontFamily.mono,
            fontSize,
            color: palette.text3,
          }}
        >
          ]
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      // RN web 0.21 ignora accessibilityState; aria-* vale no web e no nativo
      aria-disabled={disabled}
      aria-busy={loading}
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === 'string' ? children : undefined)
      }
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={size.hitMin > height ? (size.hitMin - height) / 2 : 0}
      style={[
        {
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: disabled && !loading ? 0.4 : 1,
        },
        style,
      ]}
    >
      {colors ? (
        <PixelBox
          shadow
          pressed={pressed}
          padding={0}
          borderColor={colors.border}
          fillColor={colors.fill}
        >
          {content}
        </PixelBox>
      ) : (
        content
      )}
    </Pressable>
  );
}
