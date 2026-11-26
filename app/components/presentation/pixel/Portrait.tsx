import {
  HERO_SIZE,
  heroPixels,
  type HeroLook,
} from '@/components/presentation/pixel/hero-sprite';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { tagColor, type TagTone } from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RpgClass } from '@/store/choices';
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const CLASS_TONE: Record<RpgClass, TagTone> = {
  warrior: 'str',
  scout: 'agi',
  paladin: 'vit',
};

export interface PortraitProps {
  /** Sem classe, o herói fica com a túnica original do pixelfx. */
  rpgClass?: RpgClass | undefined;
  width?: number | undefined;
  height?: number | undefined;
  /** Pele e cabelo do criador de sprite; sem ele, o visual original. */
  look?: HeroLook | undefined;
}

/**
 * Retrato do herói: quadro parado do pixelfx na cor da classe (DR12).
 * Decorativo: quem usa já mostra nome e classe em texto ao lado.
 */
export default function Portrait({
  rpgClass,
  width = 96,
  height = 120,
  look,
}: PortraitProps) {
  const { palette } = useAppTheme();
  const tunic = rpgClass ? tagColor(palette, CLASS_TONE[rpgClass]) : undefined;
  const pixels = useMemo(
    () => heroPixels(tunic, look),
    [tunic, look?.skin, look?.hair], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // Escala inteira, para o pixel não borrar; 16 px de folga dentro da moldura.
  const scale = Math.max(
    1,
    Math.floor(
      Math.min((width - 16) / HERO_SIZE.w, (height - 16) / HERO_SIZE.h),
    ),
  );
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <PixelBox
        tone="sunken"
        padding={0}
        style={{ width, height }}
        innerStyle={{
          width: width - 4,
          height: height - 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={HERO_SIZE.w * scale} height={HERO_SIZE.h * scale}>
          {pixels.map((p) => (
            <Rect
              key={`${p.x}-${p.y}`}
              x={p.x * scale}
              y={p.y * scale}
              width={scale}
              height={scale}
              fill={p.color}
            />
          ))}
        </Svg>
      </PixelBox>
    </View>
  );
}
