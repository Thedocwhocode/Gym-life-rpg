import {
  pixelIcons,
  type PixelIconName,
} from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  name: PixelIconName;
  size?: number | undefined;
  color?: string | undefined;
  rotate?: number | undefined;
  testID?: string | undefined;
}

/** Pixelarticon numa grade de 24 px; use tamanhos múltiplos de 24 para manter as bordas nítidas. */
export default function Icon({
  name,
  size = 24,
  color,
  rotate = 0,
  testID,
}: IconProps) {
  const { colors } = useAppTheme();
  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={pixelIcons[name]} fill={color ?? colors.onSurface} />
      </Svg>
    </View>
  );
}
