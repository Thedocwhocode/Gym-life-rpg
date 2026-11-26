import { useAppTheme } from '@/hooks/useAppTheme';
import type { Palette } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type AsciiTone = 'frame' | 'muted' | 'danger' | 'reward';

export function asciiColor(p: Palette, tone: AsciiTone): string {
  switch (tone) {
    case 'muted':
      return p.line2;
    case 'danger':
      return p.dangerStrong;
    case 'reward':
      return p.reward;
    default:
      return p.lineFrame;
  }
}

export interface AsciiFrameProps {
  title?: string | undefined;
  tone?: AsciiTone | undefined;
  /** Precisa ser igual ao fundo atrás da moldura: o título e os ticks mascaram a linha. */
  bg?: string | undefined;
  padding?: number | undefined;
  /** v1.1: nó `+===+` no meio da linha de cima (quando não há título). */
  knots?: boolean | undefined;
  /** v1.1: nó `+===+` também embaixo (vale com `knots`). */
  footer?: boolean | undefined;
  children?: ReactNode;
  testID?: string | undefined;
}

const TICK = 11;
const CORNERS = [
  { top: -TICK / 2, left: -TICK / 2 },
  { top: -TICK / 2, right: -TICK / 2 },
  { bottom: -TICK / 2, left: -TICK / 2 },
  { bottom: -TICK / 2, right: -TICK / 2 },
] as const;

/** Moldura N1: linha de 1 px, ticks `+` nos cantos e `+== TÍTULO ==+` no topo. Use 1 ou 2 por tela. */
export default function AsciiFrame({
  title,
  tone = 'frame',
  bg,
  padding = 16,
  knots = true,
  footer = true,
  children,
  testID,
}: AsciiFrameProps) {
  const { palette, colors } = useAppTheme();
  const color = asciiColor(palette, tone);
  const behind = bg ?? colors.background;
  const glyph = {
    fontFamily: fontFamily.monoBold,
    fontSize: TICK,
    color,
  } as const;
  const knot = (side: 'top' | 'bottom') => (
    <Text
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        glyph,
        {
          position: 'absolute',
          [side]: -TICK / 2,
          alignSelf: 'center',
          lineHeight: TICK,
          paddingHorizontal: 4,
          backgroundColor: behind,
        },
      ]}
    >
      +===+
    </Text>
  );
  const bottomKnot = knots && footer;
  return (
    <View testID={testID} style={{ margin: TICK / 2 }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: color,
          padding,
          paddingTop: padding + 4,
          paddingBottom: bottomKnot ? padding + 4 : padding,
        }}
      >
        {children}
      </View>
      {CORNERS.map((corner, i) => (
        <Text
          key={i}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            glyph,
            {
              position: 'absolute',
              ...corner,
              width: TICK,
              lineHeight: TICK,
              textAlign: 'center',
              backgroundColor: behind,
            },
          ]}
        >
          +
        </Text>
      ))}
      {title ? (
        <Text
          accessibilityLabel={title}
          style={[
            glyph,
            {
              position: 'absolute',
              top: -TICK / 2,
              alignSelf: 'center',
              lineHeight: TICK,
              paddingHorizontal: 4,
              backgroundColor: behind,
              letterSpacing: 1.5,
            },
          ]}
        >
          <Text aria-hidden>+== </Text>
          {title.toUpperCase()}
          <Text aria-hidden> ==+</Text>
        </Text>
      ) : knots ? (
        knot('top')
      ) : null}
      {bottomKnot ? knot('bottom') : null}
    </View>
  );
}
