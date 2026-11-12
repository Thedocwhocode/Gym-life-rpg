import { useRef } from 'react';
import { View } from 'react-native';
import { STAGE_BG } from './engine';
import type { FxStageProps } from './FxStage';
import { useFxLoop } from './use-fx-loop';

// O app não carrega os tipos do DOM (types/dom.slim.d.ts): só o pedaço do canvas que usamos.
interface Canvas2D {
  width: number;
  height: number;
  getContext(kind: '2d'): {
    createImageData(w: number, h: number): { data: Uint8ClampedArray };
    putImageData(img: unknown, x: number, y: number): void;
    clearRect(x: number, y: number, w: number, h: number): void;
  } | null;
}

/** Web: canvas 2D + putImageData, o ambiente original do pixelfx (sem os ~7 MB do CanvasKit). */
export default function FxSurface(props: FxStageProps) {
  const { scale = 2, fill, cover, bg, label, testID, style } = props;
  const ref = useRef<Canvas2D | null>(null);
  const stage = useFxLoop(props, (rgba, [sx, sy]) => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    if (cv.width !== stage.w || cv.height !== stage.h) {
      cv.width = stage.w;
      cv.height = stage.h;
    }
    const img = ctx.createImageData(stage.w, stage.h);
    img.data.set(rgba);
    if (sx || sy) ctx.clearRect(0, 0, stage.w, stage.h);
    ctx.putImageData(img, sx, sy);
  });

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label ?? props.fx}
      testID={testID}
      pointerEvents="none"
      style={[
        cover
          ? { position: 'absolute', inset: 0, overflow: 'hidden' }
          : fill
            ? { width: '100%' }
            : { width: stage.w * scale, height: stage.h * scale },
        { backgroundColor: bg === 'none' ? 'transparent' : STAGE_BG },
        style,
      ]}
    >
      <canvas
        ref={(el) => {
          ref.current = el as unknown as Canvas2D | null;
        }}
        width={stage.w}
        height={stage.h}
        style={
          cover
            ? {
                imageRendering: 'pixelated',
                position: 'absolute',
                top: 0,
                left: '50%',
                height: '100%',
                width: 'auto',
                transform: 'translateX(-50%)',
              }
            : {
                imageRendering: 'pixelated',
                display: 'block',
                width: '100%',
                height: fill ? 'auto' : '100%',
              }
        }
      />
    </View>
  );
}
