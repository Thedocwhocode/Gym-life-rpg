import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Palette } from '@/theme/palettes';
import type { AttrKey } from '@/store/rpg/derive';
import { fontFamily, TITLE_MAX_SCALE, type } from '@/theme/tokens';
import { Text, View } from 'react-native';

export const ATTRIBUTES: Record<
  AttrKey,
  { icon: PixelIconName; color: (p: Palette) => string }
> = {
  STR: { icon: 'human-handsup', color: (p) => p.attrStr },
  DEX: { icon: 'speed-fast', color: (p) => p.attrDex },
  CON: { icon: 'heart', color: (p) => p.attrCon },
  STA: { icon: 'battery-full', color: (p) => p.attrSta },
};

export interface AttributeStatProps {
  attr: AttrKey;
  value: string;
  /** Ex.: "+4"; aparece em verde. */
  delta?: string | undefined;
  label?: string | undefined;
  subtitle?: string | undefined;
  variant?: 'card' | 'inline' | undefined;
}

/** Atributo estilo D&D: `inline` na ficha, `card` na grade do Painel. */
export default function AttributeStat({
  attr,
  value,
  delta,
  label,
  subtitle,
  variant = 'card',
}: AttributeStatProps) {
  const { palette } = useAppTheme();
  const a = ATTRIBUTES[attr];
  const color = a.color(palette);
  const abbr = {
    fontFamily: fontFamily.displayBold,
    fontSize: 15,
    lineHeight: 16,
    color,
    letterSpacing: 0.6,
  } as const;

  if (variant === 'inline') {
    return (
      <View
        testID={`attr-${attr}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          flex: 1,
          minWidth: 0,
        }}
      >
        <Icon name={a.icon} size={24} color={color} />
        <View style={{ minWidth: 0 }}>
          <Text maxFontSizeMultiplier={TITLE_MAX_SCALE} style={abbr}>
            {attr}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamily.monoBold,
              fontSize: 11,
              color: palette.text2,
            }}
          >
            {value}
            {delta ? (
              <Text style={{ color: palette.success }}> {delta}</Text>
            ) : null}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <PixelBox
      testID={`attr-card-${attr}`}
      padding={12}
      style={{ flex: 1, minWidth: 0 }}
      innerStyle={{ gap: 8, minHeight: 92 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name={a.icon} size={24} color={color} />
        <Text maxFontSizeMultiplier={TITLE_MAX_SCALE} style={abbr}>
          {attr}
        </Text>
        {delta ? (
          <Text
            style={{
              marginLeft: 'auto',
              fontFamily: fontFamily.monoBold,
              fontSize: 11,
              color: palette.success,
            }}
          >
            {delta}
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          fontFamily: fontFamily.monoBold,
          fontSize: 26,
          lineHeight: 28,
          color: palette.text1,
        }}
      >
        {value}
      </Text>
      <View style={{ gap: 2 }}>
        {label ? (
          <Text style={{ ...type.small, color: palette.text2 }}>{label}</Text>
        ) : null}
        {subtitle ? (
          <Text style={{ ...type.micro, color: palette.text3 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </PixelBox>
  );
}
