/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { usePressGesture } from '@/components/presentation/gesture-wrappers/use-press-gesture';
import PixelButton, {
  type ButtonVariant,
} from '@/components/presentation/pixel/Button';
import { resolvePixelIcon } from '@/components/presentation/pixel-icon-map';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Pressable, Text } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import type { ButtonProps } from 'react-native-paper';

// API herdada do Paper (`mode`, `icon`) desenhada com o botão pixel do redesign.
const VARIANT: Record<NonNullable<ButtonProps['mode']>, ButtonVariant> = {
  contained: 'primary',
  'contained-tonal': 'secondary',
  elevated: 'secondary',
  outlined: 'secondary',
  text: 'ghost',
};

export default function Button({
  onPress,
  onLongPress,
  disabled,
  mode = 'text',
  icon,
  children,
  style,
  labelStyle,
  testID,
}: GesturePressableProps<ButtonProps>) {
  const { palette } = useAppTheme();
  const gesture = usePressGesture(onPress, onLongPress, disabled);
  const noop = onPress || onLongPress ? () => {} : undefined;
  return (
    <GestureDetector gesture={gesture}>
      {mode === 'text' && labelStyle ? (
        // Valor tocável (peso, cardio): só o texto, sem moldura.
        <Pressable
          testID={testID}
          accessibilityRole="button"
          disabled={disabled}
          onPress={noop}
          style={style as never}
        >
          <Text style={[{ color: palette.text1 }, labelStyle]}>{children}</Text>
        </Pressable>
      ) : (
        <PixelButton
          testID={testID}
          variant={VARIANT[mode]}
          icon={
            typeof icon === 'string' ? resolvePixelIcon(icon).name : undefined
          }
          disabled={disabled ?? false}
          onPress={noop}
          style={style as never}
        >
          {children}
        </PixelButton>
      )}
    </GestureDetector>
  );
}
