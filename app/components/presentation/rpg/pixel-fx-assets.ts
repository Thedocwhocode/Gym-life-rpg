import type { ImageSourcePropType } from 'react-native';
import type { PixelFxSheet } from './pixel-fx-frames';
import levelUp from '@/assets/fx/level-up.json';
import confetti from '@/assets/fx/confetti.json';
import xpOrb from '@/assets/fx/xp-orb.json';
import powerStar from '@/assets/fx/power-star.json';

export interface PixelFxAsset {
  image: ImageSourcePropType;
  sheet: PixelFxSheet;
}

// Regenerate with `npm run fx:sheets` (scripts/fx-sheets.mjs).
export const PIXEL_FX = {
  levelUp: {
    image: require('@/assets/fx/level-up.png') as ImageSourcePropType,
    sheet: levelUp as PixelFxSheet,
  },
  confetti: {
    image: require('@/assets/fx/confetti.png') as ImageSourcePropType,
    sheet: confetti as PixelFxSheet,
  },
  xpOrb: {
    image: require('@/assets/fx/xp-orb.png') as ImageSourcePropType,
    sheet: xpOrb as PixelFxSheet,
  },
  powerStar: {
    image: require('@/assets/fx/power-star.png') as ImageSourcePropType,
    sheet: powerStar as PixelFxSheet,
  },
} satisfies Record<string, PixelFxAsset>;
