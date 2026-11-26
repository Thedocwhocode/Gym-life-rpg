import { useAppTheme } from '@/hooks/useAppTheme';
import type { Palette } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type BadgeTone = 'danger' | 'accent' | 'system' | 'muted';

function badgeColors(p: Palette, tone: BadgeTone): [string, string] {
  switch (tone) {
    case 'accent':
      return [p.accent, p.textOnAccent];
    case 'system':
      return [p.system, p.isDark ? p.bgApp : p.surface2];
    case 'muted':
      return [p.surface3, p.text1];
    default:
      return [p.dangerDeep, p.textOnDanger];
  }
}

/** "100" vira "99+" quando passa de `max`. */
export function badgeText(count: number, max = 99): string {
  return count > max ? `${max}+` : String(count);
}

export interface BadgeProps {
  count?: number | undefined;
  max?: number | undefined;
  tone?: BadgeTone | undefined;
  /** Só o ponto, sem número. */
  dot?: boolean | undefined;
  /** Rótulo do leitor de tela; padrão "N pendentes" / "Novidade". */
  label?: string | undefined;
  /** Ícone ou aba onde o selo fica preso no canto. */
  children?: ReactNode;
  testID?: string | undefined;
}

/** v1.2: contador sobre ícone ou aba (missões pendentes, convites). Some com 0. */
export default function Badge({
  count = 0,
  max = 99,
  tone = 'danger',
  dot = false,
  label,
  children,
  testID,
}: BadgeProps) {
  const { palette } = useAppTheme();
  const [bg, fg] = badgeColors(palette, tone);
  const show = dot || count > 0;
  const badge = show ? (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={label ?? (dot ? 'Novidade' : `${count} pendentes`)}
      style={{
        position: children ? 'absolute' : 'relative',
        top: children ? -8 : undefined,
        right: children ? -10 : undefined,
        // +4: o anel de 2 px entra na medida (border-box).
        minWidth: dot ? 12 : 22,
        height: dot ? 12 : 22,
        paddingHorizontal: dot ? 0 : 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        // Anel de 2 px na cor do fundo, separando o selo do ícone.
        borderWidth: 2,
        borderColor: palette.bgApp,
      }}
    >
      {dot ? null : (
        <Text
          style={{
            fontFamily: fontFamily.monoBold,
            fontSize: 10,
            lineHeight: 12,
            color: fg,
            fontVariant: ['tabular-nums'],
          }}
        >
          {badgeText(count, max)}
        </Text>
      )}
    </View>
  ) : null;
  if (!children) return badge;
  return (
    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
      {children}
      {badge}
    </View>
  );
}
