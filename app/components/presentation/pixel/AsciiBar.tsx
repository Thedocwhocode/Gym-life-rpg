import {
  barColor,
  type BarTone,
} from '@/components/presentation/pixel/PixelBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily } from '@/theme/tokens';
import { Text } from 'react-native';

export interface AsciiBarProps {
  /** 0..1 */
  value: number;
  cells?: number | undefined;
  tone?: BarTone | undefined;
  label?: string | undefined;
  showPercent?: boolean | undefined;
  fontSize?: number | undefined;
  testID?: string | undefined;
}

/** Barra em texto: `[||||....] 72% XP` (energia usa `#`). Texto puro, fácil de portar. */
export default function AsciiBar({
  value,
  cells = 20,
  tone = 'xp',
  label,
  showPercent = true,
  fontSize = 13,
  testID,
}: AsciiBarProps) {
  const { palette } = useAppTheme();
  const clamped = Math.min(1, Math.max(0, value));
  const filled = Math.round(clamped * cells);
  const full = tone === 'energy' ? '#' : '|';
  const base = { fontFamily: fontFamily.monoBold, fontSize } as const;
  return (
    <Text
      testID={testID}
      accessibilityRole="progressbar"
      // Sem isto o Android lê os colchetes e pontos: "[............] 0% XP".
      accessibilityLabel={`${Math.round(clamped * 100)}%${label ? ` ${label}` : ''}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={base}
    >
      <Text style={{ color: palette.text3 }}>[</Text>
      <Text style={{ color: barColor(palette, tone) }}>
        {full.repeat(filled)}
      </Text>
      <Text style={{ color: palette.text3, opacity: 0.7 }}>
        {'.'.repeat(cells - filled)}
      </Text>
      <Text style={{ color: palette.text3 }}>]</Text>
      {showPercent ? (
        <Text
          style={{ color: palette.text1 }}
        >{` ${Math.round(clamped * 100)}%`}</Text>
      ) : null}
      {label ? (
        <Text style={{ color: palette.text2 }}>{` ${label}`}</Text>
      ) : null}
    </Text>
  );
}
