import {
  AlphaType,
  Canvas,
  ColorType,
  FilterMode,
  Image,
  MipmapMode,
  Skia,
  type SkImage,
} from '@shopify/react-native-skia';
import { useState } from 'react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { STAGE_BG } from './engine';
import type { FxStageProps } from './FxStage';
import { useFxLoop } from './use-fx-loop';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

/** Nativo: o RGBA de cada quadro vira uma imagem Skia (caminho A do PLANO §3.6). */
export default function FxSurface(props: FxStageProps) {
  const { scale = 2, fill, cover, bg, label, testID, style } = props;
  const image = useSharedValue<SkImage | null>(null);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const [box, setBox] = useState<{ w: number; h: number }>();
  const stage = useFxLoop(props, (rgba, shake) => {
    const data = Skia.Data.fromBytes(
      new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength),
    );
    // ponytail: a imagem anterior fica para o GC; dispose() aqui pode correr com o desenho na UI thread.
    image.value = Skia.Image.MakeImage(
      {
        width: stage.w,
        height: stage.h,
        alphaType: AlphaType.Unpremul,
        colorType: ColorType.RGBA_8888,
      },
      data,
      stage.w * 4,
    );
    sx.value = shake[0] * k;
    sy.value = shake[1] * k;
  });

  // fill: k = largura do pai; cover: k = altura do pai, centralizado.
  const k = box
    ? cover
      ? box.h / stage.h
      : fill
        ? box.w / stage.w
        : scale
    : scale;
  const w = stage.w * k;
  const h = stage.h * k;
  const x = cover && box ? (box.w - w) / 2 : 0;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label ?? props.fx}
      testID={testID}
      pointerEvents="none"
      onLayout={
        fill || cover
          ? (e) =>
              setBox({
                w: e.nativeEvent.layout.width,
                h: e.nativeEvent.layout.height,
              })
          : undefined
      }
      style={[
        cover
          ? { position: 'absolute', inset: 0, overflow: 'hidden' }
          : fill
            ? { width: '100%', aspectRatio: stage.w / stage.h }
            : { width: w, height: h },
        { backgroundColor: bg === 'none' ? 'transparent' : STAGE_BG },
        style,
      ]}
    >
      <Canvas
        style={{ position: 'absolute', left: x, top: 0, width: w, height: h }}
      >
        <Image
          image={image}
          x={sx}
          y={sy}
          width={w}
          height={h}
          sampling={NEAREST}
        />
      </Canvas>
    </View>
  );
}
