import FxStage from '@/components/presentation/fx/FxStage';
import {
  createTransitionRunner,
  TRANSITION_SPEED,
  TRANSITIONS,
} from '@/components/presentation/fx/transitions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** Quanto a tela fica escura antes do dissolve: com ele, ~2,3 s no total. */
export const AWAKEN_DARK_MS = 1200;

/**
 * Abertura do onboarding: a tela começa apagada e clareia num dissolve de blocos do pixelfx.
 * `onAwake` dispara quando os blocos cobrem a tela (aí a janela do Sistema monta por baixo).
 * Só timers, como a transição de tela; nunca bloqueia toque (pointerEvents none).
 */
export default function AwakenOverlay({ onAwake }: { onAwake: () => void }) {
  const { palette } = useAppTheme();
  const [dark, setDark] = useState(true);
  const [fx, setFx] = useState(false);
  useEffect(() => {
    let alive = true;
    const runner = createTransitionRunner((kind) => alive && setFx(!!kind));
    const id = setTimeout(
      () =>
        runner.run(
          'tab',
          () => {
            if (!alive) return;
            setDark(false);
            onAwake();
          },
          true,
        ),
      AWAKEN_DARK_MS,
    );
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!dark && !fx) return null;
  return (
    <View
      testID="awaken-overlay"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
    >
      {dark && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: palette.bgApp }]}
        />
      )}
      {fx && (
        <FxStage
          fx={TRANSITIONS.tab.fx}
          bg="none"
          cover
          repeat={false}
          playKey={1}
          speed={TRANSITION_SPEED}
        />
      )}
    </View>
  );
}
