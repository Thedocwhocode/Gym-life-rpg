import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, size, TITLE_MAX_SCALE } from '@/theme/tokens';
import { useState } from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';

export interface FabProps {
  icon?: PixelIconName | undefined;
  label: string;
  onPress?: (() => void) | undefined;
  /** Posicionamento é do chamador (canto inferior direito, 16 px das bordas). */
  style?: StyleProp<ViewStyle>;
  testID?: string | undefined;
}

/** Ação flutuante com rótulo: borda accent, fundo surface-2, afunda 4 px. */
export default function Fab({
  icon = 'plus',
  label,
  onPress,
  style,
  testID,
}: FabProps) {
  const { palette } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{ alignSelf: 'flex-start' }, style]}
    >
      <PixelBox
        shadow
        pressed={pressed}
        padding={0}
        borderColor={palette.accent}
        fillColor={palette.surface2}
        innerStyle={{
          minHeight: size.hitMin,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
        }}
      >
        <Icon name={icon} size={24} color={palette.accent} />
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          style={{
            fontFamily: fontFamily.display,
            fontSize: 15,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: palette.text1,
          }}
        >
          {label}
        </Text>
      </PixelBox>
    </Pressable>
  );
}
