import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type } from '@/theme/tokens';
import { Text, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

export interface PortraitProps {
  label: string;
  width?: number | undefined;
  height?: number | undefined;
}

/** Espaço do retrato: listras + legenda até o sprite existir (DR12). */
export default function Portrait({
  label,
  width = 96,
  height = 120,
}: PortraitProps) {
  const { palette } = useAppTheme();
  return (
    <PixelBox tone="sunken" padding={0} style={{ width, height }}>
      <View style={{ width: width - 4, height: height - 4 }}>
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <Pattern
              id="portrait-stripes"
              width={12}
              height={12}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <Rect width={6} height={12} fill={palette.surface2} />
              <Rect x={6} width={6} height={12} fill={palette.bgSunken} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#portrait-stripes)" />
        </Svg>
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 6 }}>
          <Text
            style={{
              ...type.micro,
              alignSelf: 'center',
              textAlign: 'center',
              color: palette.text3,
              backgroundColor: palette.bgSunken,
              paddingHorizontal: 4,
              paddingVertical: 2,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </PixelBox>
  );
}
