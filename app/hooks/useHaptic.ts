import {
  triggerClickHaptic,
  triggerSlowRiseHaptic,
} from '@/modules/native-crypto/src/ReactNativeHapticsModule';
import { useAppSelector } from '@/store';
import { useCallback } from 'react';

/** E1: clique na série; subida lenta no PR, no chefe derrotado e no level up. Respeita o switch "Vibração". */
export function useHaptic() {
  const enabled = useAppSelector((s) => s.settings.haptics);
  return useCallback(
    (kind: 'click' | 'rise') => {
      if (!enabled) return;
      if (kind === 'click') triggerClickHaptic();
      else triggerSlowRiseHaptic();
    },
    [enabled],
  );
}
