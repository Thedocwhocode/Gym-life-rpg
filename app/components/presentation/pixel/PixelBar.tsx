import { useAppTheme } from '@/hooks/useAppTheme';
import type { Palette } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { Text, View } from 'react-native';

export type BarTone = 'xp' | 'energy' | 'hp' | 'muted' | 'reward';

export function barColor(p: Palette, tone: BarTone): string {
  switch (tone) {
    case 'energy':
      return p.barEnergy;
    case 'hp':
      return p.barHp;
    case 'reward':
      return p.reward;
    case 'muted':
      return p.line2;
    default:
      return p.barXp;
  }
}

export interface PixelBarProps {
  /** 0..1 */
  value: number;
  segments?: number | undefined;
  tone?: BarTone | undefined;
  height?: number | undefined;
  gap?: number | undefined;
  label?: string | undefined;
  testID?: string | undefined;
}

/** Barra sólida segmentada: o preenchimento encaixa em segmentos inteiros. */
export default function PixelBar({
  value,
  segments = 20,
  tone = 'xp',
  height = 10,
  gap = 2,
  label,
  testID,
}: PixelBarProps) {
  const { palette } = useAppTheme();
  const clamped = Math.min(1, Math.max(0, value));
  const filled = Math.round(clamped * segments);
  const color = barColor(palette, tone);
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ gap: 4 }}
    >
      {label ? (
        <Text
          style={{
            fontFamily: fontFamily.monoBold,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: palette.text2,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap }}>
        {Array.from({ length: segments }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height,
              backgroundColor: i < filled ? color : palette.barTrack,
              // Brilho interno: luz em cima, sombra embaixo (só nos segmentos cheios).
              borderTopWidth: i < filled ? 1 : 0,
              borderTopColor: 'rgba(255,255,255,0.22)',
              borderBottomWidth: i < filled ? 2 : 0,
              borderBottomColor: 'rgba(0,0,0,0.25)',
            }}
          />
        ))}
      </View>
    </View>
  );
}
