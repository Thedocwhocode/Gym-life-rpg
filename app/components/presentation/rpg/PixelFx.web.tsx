import type { StyleProp, ViewStyle } from 'react-native';
import type { PixelFxAsset } from './pixel-fx-assets';

// ponytail: no effects on web; Skia web needs LoadSkiaWeb + canvaskit.wasm, wire it up if web ever ships.
export default function PixelFx(_props: {
  fx: PixelFxAsset;
  scale?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return null;
}
