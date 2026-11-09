import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { steps } from '@/theme/tokens';
import { Pressable, View } from 'react-native';

export interface SwitchProps {
  value: boolean;
  onValueChange?: ((value: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  testID?: string | undefined;
}

/** Toggle pixel 48×28 com knob quadrado de 16 px. */
export default function Switch({
  value,
  onValueChange,
  disabled = false,
  label,
  testID,
}: SwitchProps) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled || !onValueChange}
      onPress={() => onValueChange?.(!value)}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <PixelBox
        steps={steps.control}
        padding={0}
        borderColor={value ? palette.accent : palette.line2}
        fillColor={value ? palette.accentWash : palette.bgSunken}
        innerStyle={{ width: 48, height: 28, justifyContent: 'center' }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            marginLeft: value ? 24 : 4,
            backgroundColor: value ? palette.accent : palette.text3,
          }}
        />
      </PixelBox>
    </Pressable>
  );
}
