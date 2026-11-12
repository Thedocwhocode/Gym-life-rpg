import { useAppTheme } from '@/hooks/useAppTheme';
import type { Palette } from '@/theme/palettes';
import { motion, pixelStep, steps as stepScale } from '@/theme/tokens';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type PixelTone =
  | 'default'
  | 'raised'
  | 'sunken'
  | 'accent'
  | 'danger'
  | 'success';

export function toneColors(
  p: Palette,
  tone: PixelTone,
): { border: string; fill: string } {
  switch (tone) {
    case 'raised':
      return { border: p.line2, fill: p.surface2 };
    case 'sunken':
      return { border: p.line1, fill: p.bgSunken };
    case 'accent':
      return { border: p.accent, fill: p.accentWash };
    case 'danger':
      return { border: p.danger, fill: p.dangerWash };
    case 'success':
      return { border: p.success, fill: p.successWash };
    default:
      return { border: p.line1, fill: p.surface1 };
  }
}

export interface PixelBoxProps {
  tone?: PixelTone | undefined;
  /** Degraus nos cantos: 1 controles, 2 cards/botões (padrão), 3 diálogos. */
  steps?: number | undefined;
  /** Espessura da borda em px. */
  px?: number | undefined;
  /** Sombra dura de 4 px, sem blur. */
  shadow?: boolean | undefined;
  /** Brilho dourado: só para recompensa. */
  glow?: boolean | undefined;
  /** Afunda o rosto sobre a sombra (botões). */
  pressed?: boolean | undefined;
  /** Cor do fundo atrás da caixa; os cantos recortados a repetem. */
  bg?: string | undefined;
  borderColor?: string | undefined;
  fillColor?: string | undefined;
  padding?: number | undefined;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  testID?: string | undefined;
  children?: ReactNode;
}

const CORNERS = [
  { top: 0, left: 0 },
  { top: 0, right: 0 },
  { bottom: 0, left: 0 },
  { bottom: 0, right: 0 },
] as const;

/** Cantos em degrau: `steps` retângulos por canto, cada um um degrau mais curto. */
function CornerCuts({
  steps,
  px,
  color,
}: {
  steps: number;
  px: number;
  color: string;
}) {
  const rows = Array.from({ length: steps }, (_, i) => i);
  return (
    <>
      {CORNERS.map((corner, c) =>
        rows.map((i) => {
          const vertical = 'top' in corner ? 'top' : 'bottom';
          return (
            <View
              key={`${c}-${i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                ...corner,
                [vertical]: i * px,
                width: px * (steps - i),
                height: px,
                backgroundColor: color,
              }}
            />
          );
        }),
      )}
    </>
  );
}

export default function PixelBox({
  tone = 'default',
  steps = stepScale.card,
  px = pixelStep,
  shadow = false,
  glow = false,
  pressed = false,
  bg,
  borderColor,
  fillColor,
  padding = 12,
  style,
  innerStyle,
  testID,
  children,
}: PixelBoxProps) {
  const { palette, colors, fixed } = useAppTheme();
  const toned = toneColors(palette, tone);
  const behind = bg ?? colors.background;
  const lift = shadow ? motion.hardShadow : 0;

  const face = (
    <View>
      <View
        style={[
          {
            borderWidth: px,
            borderColor: borderColor ?? toned.border,
            backgroundColor: fillColor ?? toned.fill,
            padding,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
      <CornerCuts steps={steps} px={px} color={behind} />
    </View>
  );

  return (
    <View testID={testID} style={[{ paddingBottom: lift }, style]}>
      {shadow ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: lift,
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        />
      ) : null}
      <View style={{ transform: [{ translateY: pressed ? lift : 0 }] }}>
        {glow ? (
          <View
            style={{
              padding: 2,
              backgroundColor: fixed.glowReward,
              borderWidth: 1,
              borderColor: fixed.glowRewardEdge,
            }}
          >
            {face}
          </View>
        ) : (
          face
        )}
      </View>
    </View>
  );
}
