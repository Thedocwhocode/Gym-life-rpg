import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { motion, size as sizes, steps } from '@/theme/tokens';
import { useState } from 'react';
import { Pressable } from 'react-native';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger';

export interface IconButtonProps {
  icon: PixelIconName;
  /** Obrigatório: é o rótulo de acessibilidade. */
  label: string;
  onPress?: (() => void) | undefined;
  variant?: IconButtonVariant | undefined;
  size?: number | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  testID?: string | undefined;
}

/** Botão quadrado só com ícone; afunda 2 px ao pressionar. */
export default function IconButton({
  icon,
  label,
  onPress,
  variant = 'ghost',
  size = sizes.hitMin,
  active = false,
  disabled = false,
  testID,
}: IconButtonProps) {
  const { palette } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const look = {
    ghost: {
      border: active ? palette.accent : 'transparent',
      fill: pressed ? palette.surface2 : 'transparent',
      icon: active ? accentText(palette) : palette.text2,
    },
    secondary: {
      border: palette.line2,
      fill: palette.surface2,
      icon: palette.text1,
    },
    primary: {
      border: palette.accentStrong,
      fill: palette.accent,
      icon: palette.textOnAccent,
    },
    danger: {
      border: palette.dangerStrong,
      fill: palette.dangerDeep,
      icon: palette.textOnDanger,
    },
  }[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ opacity: disabled ? 0.4 : 1, width: size, height: size }}
    >
      <PixelBox
        steps={steps.control}
        padding={0}
        borderColor={look.border}
        fillColor={look.fill}
        style={{
          width: size,
          height: size,
          transform: [{ translateY: pressed ? motion.pressIconButton : 0 }],
        }}
        innerStyle={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={24} color={look.icon} />
      </PixelBox>
    </Pressable>
  );
}
