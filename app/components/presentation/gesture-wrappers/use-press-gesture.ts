import { useLayoutEffect, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';

/**
 * Tap (+ long press) que sempre chama o onPress/disabled atuais. O GestureDetector pode ficar
 * com os callbacks do primeiro render (visto no web dentro de Portal: o assistente de boas-vindas
 * travava na página 2 porque o "Próximo" via sempre currentPage = 0), então lemos de um ref.
 */
export function usePressGesture(
  onPress: (() => void) | undefined,
  onLongPress: (() => void) | undefined,
  disabled: boolean | undefined,
) {
  const latest = useRef({ onPress, onLongPress, disabled });
  useLayoutEffect(() => {
    latest.current = { onPress, onLongPress, disabled };
  });
  const hasLongPress = onLongPress !== undefined;
  return useMemo(() => {
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onStart(() => {
        const l = latest.current;
        if (!l.disabled) l.onPress?.();
      });
    if (!hasLongPress) return Gesture.Race(tap);
    const longPress = Gesture.LongPress()
      .runOnJS(true)
      .onStart(() => {
        const l = latest.current;
        if (!l.disabled) l.onLongPress?.();
      });
    return Gesture.Race(tap, longPress);
  }, [hasLongPress]);
}
