import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, type } from '@/theme/tokens';
import { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

export interface NumProps {
  children: ReactNode;
  size?: number | undefined;
  color?: string | undefined;
  style?: StyleProp<TextStyle>;
  testID?: string | undefined;
}

/** Número em Space Mono 700 com algarismos tabulares (números a partir de 20 px, design-spec §A.3). */
export default function Num({
  children,
  size = type.stat.fontSize,
  color,
  style,
  testID,
}: NumProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      testID={testID}
      style={[
        {
          fontFamily: fontFamily.monoBold,
          fontSize: size,
          lineHeight: size,
          color: color ?? colors.onSurface,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
