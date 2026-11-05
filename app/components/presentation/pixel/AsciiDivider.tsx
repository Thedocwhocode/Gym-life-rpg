import {
  asciiColor,
  type AsciiTone,
} from '@/components/presentation/pixel/AsciiFrame';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, type } from '@/theme/tokens';
import { Text, View } from 'react-native';

export interface AsciiDividerProps {
  label?: string | undefined;
  align?: 'center' | 'left' | undefined;
  tone?: AsciiTone | undefined;
  /** Texto à direita, em text-3. */
  meta?: string | undefined;
  testID?: string | undefined;
}

/** Cabeçalho de seção `▸ ROTULO ────` ou nó central. */
export default function AsciiDivider({
  label,
  align = 'left',
  tone = 'frame',
  meta,
  testID,
}: AsciiDividerProps) {
  const { palette } = useAppTheme();
  const line = (
    <View
      style={{ flex: 1, height: 1, backgroundColor: asciiColor(palette, tone) }}
    />
  );
  const labelStyle = {
    fontFamily: fontFamily.monoBold,
    fontSize: type.label.fontSize,
    letterSpacing: type.label.letterSpacing,
    textTransform: 'uppercase',
    color: palette.text2,
  } as const;
  return (
    <View
      testID={testID}
      accessibilityRole="header"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      {label && align === 'left' ? (
        <Text style={labelStyle}>{`▸ ${label}`}</Text>
      ) : null}
      {label && align === 'center' ? line : null}
      {label && align === 'center' ? (
        <Text style={labelStyle}>{label}</Text>
      ) : null}
      {line}
      {meta ? (
        <Text
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 12,
            color: palette.text3,
          }}
        >
          {meta}
        </Text>
      ) : null}
    </View>
  );
}
