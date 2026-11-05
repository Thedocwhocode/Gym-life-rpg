import { useAppSelector } from '@/store';
import type { EffectsMode } from '@/store/settings';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Modo de efeitos efetivo (DR20): a escolha do usuário; sem escolha, parte da
 * preferência de movimento reduzido do sistema.
 */
export function useEffectsMode(): EffectsMode {
  const chosen = useAppSelector((state) => state.settings.effectsMode);
  const systemReduced = useReducedMotion();
  return chosen ?? (systemReduced ? 'reduced' : 'complete');
}
