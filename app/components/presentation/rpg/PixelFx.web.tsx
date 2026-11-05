import { useEffect, useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import type { PixelFxAsset } from './pixel-fx-assets';
import { frameAt, frameRect, isFinished } from './pixel-fx-frames';
import { FREEZE_MOTION } from '@/utils/motion';

interface PixelFxProps {
  fx: PixelFxAsset;
  /** Whole numbers keep the pixels square. */
  scale?: number;
  style?: StyleProp<ViewStyle>;
}

// ponytail: web player without Skia (CanvasKit is ~7 MB of wasm). The sheet is a plain image
// slid inside a clipped box; image-rendering keeps the pixels square when scaled.
const pixelated = { imageRendering: 'pixelated' } as ViewStyle;

/** Plays a pixelfx sprite sheet once (or forever, for loops). Purely decorative: never takes touches. */
export default function PixelFx({ fx, scale = 2, style }: PixelFxProps) {
  const { sheet } = fx;
  const reduceMotion = useReducedMotion();
  // -1 once a one-shot effect has played out.
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduceMotion || FREEZE_MOTION) return;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      if (isFinished(elapsed, sheet)) return setFrame(-1);
      setFrame(frameAt(elapsed, sheet));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, sheet]);

  if (reduceMotion || frame < 0) return null;

  const [w, h] = sheet.frameSize;
  const rows = Math.ceil(sheet.frames / sheet.columns);
  const { x, y } = frameRect(frame, sheet);

  return (
    <View
      style={[
        {
          width: w * scale,
          height: h * scale,
          overflow: 'hidden',
          pointerEvents: 'none',
        },
        pixelated,
        style,
      ]}
    >
      <Image
        source={fx.image}
        style={{
          position: 'absolute',
          left: -x * scale,
          top: -y * scale,
          width: sheet.columns * w * scale,
          height: rows * h * scale,
        }}
      />
    </View>
  );
}
