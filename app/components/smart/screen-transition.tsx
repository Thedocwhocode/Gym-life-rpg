import FxStage from '@/components/presentation/fx/FxStage';
import {
  createTransitionRunner,
  TRANSITION_SPEED,
  TRANSITIONS,
  type TransitionKind,
} from '@/components/presentation/fx/transitions';
import { useEffectsMode } from '@/hooks/useEffectsMode';
import { FREEZE_MOTION } from '@/utils/motion';
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';

type Run = (kind: TransitionKind, action: () => void) => void;

// Sem provider (testes, telas fora das abas): navega direto.
const TransitionContext = createContext<Run>((_, action) => action());

/** `run('combat', () => push('/session'))`: cobre a tela, navega coberta e revela (F9, design-spec D.7). */
export function useScreenTransition() {
  return useContext(TransitionContext);
}

/** Overlay das transições acima das abas. Só roda com efeitos completos (desliga com reduced motion). */
export function ScreenTransitionProvider({ children }: PropsWithChildren) {
  const enabled = useEffectsMode() === 'complete' && !FREEZE_MOTION;
  const [state, setState] = useState<{
    kind: TransitionKind | undefined;
    n: number;
  }>({
    kind: undefined,
    n: 0,
  });
  const runner = useRef(
    createTransitionRunner((kind) =>
      setState((s) => ({ kind, n: kind ? s.n + 1 : s.n })),
    ),
  ).current;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const run = useMemo<Run>(
    () => (kind, action) => runner.run(kind, action, enabledRef.current),
    [runner],
  );

  return (
    <TransitionContext.Provider value={run}>
      {children}
      {state.kind && (
        <View
          testID="screen-transition"
          style={[StyleSheet.absoluteFill, { zIndex: 70 }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <FxStage
            fx={TRANSITIONS[state.kind].fx}
            bg="none"
            cover
            repeat={false}
            playKey={state.n}
            speed={TRANSITION_SPEED}
          />
        </View>
      )}
    </TransitionContext.Provider>
  );
}
