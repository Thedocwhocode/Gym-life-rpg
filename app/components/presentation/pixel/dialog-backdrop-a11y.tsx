import { ReactNode, useEffect, useSyncExternalStore } from 'react';
import { Platform, View } from 'react-native';

// Contador de módulo, não contexto: o Portal do Paper monta o diálogo no Portal.Host, fora da
// árvore do DialogBackdropA11y, e lá um contexto React não chega.
let open = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const bump = (delta: number) => {
  open += delta;
  listeners.forEach((fn) => fn());
};

/**
 * O Modal do Paper só isola o fundo no iOS (`accessibilityViewIsModal`); no Android o TalkBack
 * continuava andando pela tela de trás. Enquanto houver diálogo aberto, esconde o app (irmão do
 * Portal.Host do Paper, onde o diálogo é montado) da árvore de acessibilidade.
 */
export function DialogBackdropA11y({ children }: { children: ReactNode }) {
  const count = useSyncExternalStore(subscribe, () => open);
  const hide = Platform.OS === 'android' && count > 0;
  return (
    <View
      style={{ flex: 1 }}
      importantForAccessibility={hide ? 'no-hide-descendants' : 'auto'}
    >
      {children}
    </View>
  );
}

/** Conta o diálogo como aberto enquanto `visible`; a limpeza do efeito cobre desmontar aberto. */
export function useHideBehindDialog(visible: boolean) {
  useEffect(() => {
    if (!visible) return;
    bump(1);
    return () => bump(-1);
  }, [visible]);
}
