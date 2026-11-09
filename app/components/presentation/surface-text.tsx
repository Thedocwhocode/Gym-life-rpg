import {
  ColorChoice,
  font,
  FontChoice,
  useAppTheme,
} from '@/hooks/useAppTheme';
import { fontFamily } from '@/theme/tokens';
import { Text, TextProps, TextStyle } from 'react-native';

interface SurfaceTextProps extends TextProps {
  color?: ColorChoice;
  font?: FontChoice;
  weight?: TextStyle['fontWeight'];
}

export function SurfaceText(props: SurfaceTextProps) {
  const { colors } = useAppTheme();
  const { style, weight, ...rest } = props;
  const fontChoice = props.font ?? 'text-base';
  return (
    <Text
      {...rest}
      style={[
        {
          color: colors[props.color ?? 'onSurface'],
          // Corpo do redesign é Space Mono; o peso escolhe a variante carregada.
          fontFamily: isBold(weight) ? fontFamily.monoBold : fontFamily.mono,
        },
        font[fontChoice],
        style,
      ]}
    />
  );
}

const isBold = (w: TextStyle['fontWeight']) =>
  w === 'bold' || (w !== undefined && Number(w) >= 600);
