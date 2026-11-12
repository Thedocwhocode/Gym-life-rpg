import { useEffectsMode } from '@/hooks/useEffectsMode';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

/** Scanlines: 1 px de branco a 2,5% a cada 3 px sobre a tela inteira (design-spec §A.6). Some com "Efeitos: Desligado". */
export default function Scanlines() {
  const mode = useEffectsMode();
  if (mode === 'off') return null;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="scan" width={3} height={3} patternUnits="userSpaceOnUse">
            <Rect
              x={0}
              y={0}
              width={3}
              height={1}
              fill="#ffffff"
              fillOpacity={0.025}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#scan)" />
      </Svg>
    </View>
  );
}
