import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText, type Palette } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type TagTone =
  | 'accent'
  | 'success'
  | 'danger'
  | 'reward'
  | 'muted'
  | 'str'
  | 'dex'
  | 'con'
  | 'sta';

const SIZE = { sm: 11, md: 13, lg: 15 } as const;

export function tagColor(p: Palette, tone: TagTone): string {
  switch (tone) {
    case 'accent':
      return accentText(p);
    case 'success':
      return p.success;
    case 'danger':
      return p.dangerStrong;
    case 'reward':
      return p.reward;
    case 'str':
      return p.attrStr;
    case 'dex':
      return p.attrDex;
    case 'con':
      return p.attrCon;
    case 'sta':
      return p.attrSta;
    default:
      return p.text2;
  }
}

export interface TagProps {
  children: ReactNode;
  tone?: TagTone | undefined;
  /** Cor própria, no lugar de `tone`. */
  color?: string | undefined;
  brackets?: boolean | undefined;
  size?: keyof typeof SIZE | undefined;
  testID?: string | undefined;
}

/** Valor inline `[ 120 KG ]` ou `+50 XP`. */
export default function Tag({
  children,
  tone = 'accent',
  color,
  brackets = true,
  size = 'md',
  testID,
}: TagProps) {
  const { palette } = useAppTheme();
  const fontSize = SIZE[size];
  const tint = color ?? tagColor(palette, tone);
  const bracket = {
    fontFamily: fontFamily.mono,
    fontSize,
    color: palette.text3,
  } as const;
  return (
    <View testID={testID} style={{ flexDirection: 'row', gap: fontSize * 0.6 }}>
      {brackets ? <Text style={bracket}>[</Text> : null}
      <Text
        style={{
          fontFamily: fontFamily.monoBold,
          fontSize,
          color: tint,
          textTransform: 'uppercase',
          fontVariant: ['tabular-nums'],
        }}
      >
        {children}
      </Text>
      {brackets ? <Text style={bracket}>]</Text> : null}
    </View>
  );
}
