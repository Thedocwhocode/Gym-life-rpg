import { useEffect, useState } from 'react';
import { View, type DimensionValue } from 'react-native';
import FxStage from './FxStage';
import type { FxId } from './registry';

interface FxBurstProps {
  fx: FxId;
  options?: Record<string, unknown>;
  /** Mudar o valor dispara de novo. */
  playKey?: string | number;
  scale?: number;
  /** Centro do efeito dentro do pai posicionado. */
  x?: DimensionValue;
  y?: DimensionValue;
  speed?: number;
  label?: string;
  onDone?: () => void;
}

/** Momento pixelfx único por cima da UI (combo, dano, conquista…); some sozinho no fim. */
export default function FxBurst({
  fx,
  options,
  playKey = 0,
  scale = 2,
  x = '50%',
  y = '40%',
  speed,
  label,
  onDone,
}: FxBurstProps) {
  const [live, setLive] = useState(true);
  useEffect(() => setLive(true), [playKey]);
  if (!live) return null;
  return (
    // ponto de tamanho zero: o palco fica centrado em (x, y) sem depender de translate em %
    <View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        zIndex: 45,
      }}
    >
      <FxStage
        key={String(playKey)}
        fx={fx}
        options={options}
        bg="none"
        repeat={false}
        scale={scale}
        {...(speed ? { speed } : {})}
        label={label ?? fx}
        onDone={() => {
          setLive(false);
          onDone?.();
        }}
      />
    </View>
  );
}
