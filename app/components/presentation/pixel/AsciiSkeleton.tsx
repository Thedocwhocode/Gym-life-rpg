import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily } from '@/theme/tokens';
import { useEffect, useState } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const RAMP = ['.', ':', '-', '=', '#', '=', '-', ':'];
const SPIN = ['|', '/', '-', '\\'];

function useTick(ms: number, enabled: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
  return n;
}

/** Só renderiza depois de `ms`: carregamento rápido não pisca esqueleto. */
function useDelayed(ms: number) {
  const [ready, setReady] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const id = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return ready;
}

function line(width: number, tick: number, offset: number) {
  let s = '';
  const head = (tick + offset) % (width + 8);
  for (let i = 0; i < width; i++) {
    const d = head - i;
    s += d >= 0 && d < RAMP.length ? RAMP[d] : '.';
  }
  return s;
}

export type AsciiSkeletonProps = {
  variant?: 'lines' | 'card' | 'list' | 'sheet' | 'spinner';
  lines?: number;
  rows?: number;
  label?: string;
  /** Atraso antes de aparecer (design-spec: 300 ms). */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** Esqueleto de carregamento em ASCII: uma faixa # = - : varre a linha em passos de 90 ms. */
export default function AsciiSkeleton({
  variant = 'lines',
  lines = 3,
  rows = 3,
  label = 'Carregando',
  delay = 300,
  style,
}: AsciiSkeletonProps) {
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const ready = useDelayed(delay);
  const tick = useTick(90, ready && !reduced);
  if (!ready) return null;

  const font = {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 19,
    color: palette.text3,
  };
  const L = (w: number, off: number, color = palette.text3) => (
    <Text style={[font, { color }]}>{line(w, tick, off)}</Text>
  );

  if (variant === 'spinner') {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 24,
          },
          style,
        ]}
      >
        <Text style={[font, { color: palette.accent }]}>
          {SPIN[Math.floor(tick / 2) % 4]}
        </Text>
        <Text
          style={[font, { textTransform: 'uppercase', letterSpacing: 1.4 }]}
        >
          {label}
          {'.'.repeat(Math.floor(tick / 4) % 4)}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[{ gap: variant === 'lines' ? 0 : 12, overflow: 'hidden' }, style]}
    >
      {variant === 'lines' &&
        Array.from({ length: lines }, (_, i) => (
          <View key={i}>{L(i === lines - 1 ? 20 : 34, i * 2)}</View>
        ))}
      {variant === 'card' &&
        Array.from({ length: rows }, (_, k) => (
          <View
            key={k}
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: palette.line1,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          >
            <Text style={font}>
              <Text style={{ color: palette.line2 }}>[ </Text>
              <Text style={{ color: palette.text2 }}>
                {line(14, tick, k * 3)}
              </Text>
              <Text style={{ color: palette.line2 }}> ]</Text>
            </Text>
            {L(30, k * 3 + 2)}
            {L(26, k * 3 + 4)}
            {L(18, k * 3 + 6)}
          </View>
        ))}
      {variant === 'list' &&
        Array.from({ length: rows }, (_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: palette.line1,
            }}
          >
            <Text style={[font, { color: palette.line2 }]}>[##]</Text>
            <View>
              {L(22, i * 3, palette.text2)}
              {L(30, i * 3 + 3)}
            </View>
          </View>
        ))}
      {variant === 'sheet' && (
        <View
          style={{
            borderWidth: 1,
            borderColor: palette.line1,
            padding: 14,
            flexDirection: 'row',
            gap: 14,
          }}
        >
          <Text style={[font, { color: palette.line2 }]}>
            {'+------+\n|      |\n|  ??  |\n|      |\n+------+'}
          </Text>
          <View>
            {[16, 22, 18, 18].map((w, i) => (
              <View key={i}>{L(w, i * 2)}</View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
