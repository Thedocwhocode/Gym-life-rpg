import {
  Canvas,
  FilterMode,
  Group,
  Image,
  MipmapMode,
  rect,
  useImage,
} from '@shopify/react-native-skia';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import type { PixelFxAsset } from './pixel-fx-assets';
import { frameAt, frameRect, isFinished } from './pixel-fx-frames';
import { FREEZE_MOTION } from '@/utils/motion';

interface PixelFxProps {
  fx: PixelFxAsset;
  /** Whole numbers keep the pixels square. */
  scale?: number;
  style?: StyleProp<ViewStyle>;
}

/** Plays a pixelfx sprite sheet once (or forever, for loops). Purely decorative: never takes touches. */
export default function PixelFx({ fx, scale = 2, style }: PixelFxProps) {
  const { sheet } = fx;
  const image = useImage(fx.image as Parameters<typeof useImage>[0]);
  const reduceMotion = useReducedMotion();
  const elapsed = useSharedValue(0);

  useFrameCallback((info) => {
    elapsed.value = info.timeSinceFirstFrame;
  }, !reduceMotion && !FREEZE_MOTION);

  const [w, h] = sheet.frameSize;
  const rows = Math.ceil(sheet.frames / sheet.columns);
  const x = useDerivedValue(
    () => -frameRect(frameAt(elapsed.value, sheet), sheet).x,
  );
  const y = useDerivedValue(
    () => -frameRect(frameAt(elapsed.value, sheet), sheet).y,
  );
  const opacity = useDerivedValue(() =>
    isFinished(elapsed.value, sheet) ? 0 : 1,
  );

  if (reduceMotion || !image) return null;

  return (
    <Canvas
      pointerEvents="none"
      style={[{ width: w * scale, height: h * scale }, style]}
    >
      <Group transform={[{ scale }]} clip={rect(0, 0, w, h)} opacity={opacity}>
        <Image
          image={image}
          x={x}
          y={y}
          width={sheet.columns * w}
          height={rows * h}
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
        />
      </Group>
    </Canvas>
  );
}
