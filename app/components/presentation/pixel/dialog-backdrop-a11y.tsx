import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform, View } from 'react-native';

type Register = () => () => void;
const DialogA11yContext = createContext<Register | undefined>(undefined);

/**
 * O Modal do Paper só isola o fundo no iOS (`accessibilityViewIsModal`); no Android o TalkBack
 * continuava andando pela tela de trás. Enquanto houver diálogo aberto, esconde o app (irmão do
 * Portal.Host do Paper, onde o diálogo é montado) da árvore de acessibilidade.
 */
export function DialogBackdropA11y({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(0);
  const register = useCallback<Register>(() => {
    setOpen((n) => n + 1);
    return () => setOpen((n) => n - 1);
  }, []);
  const hide = Platform.OS === 'android' && open > 0;
  return (
    <DialogA11yContext.Provider value={register}>
      <View
        style={{ flex: 1 }}
        importantForAccessibility={hide ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
    </DialogA11yContext.Provider>
  );
}

/** Conta o diálogo como aberto enquanto `visible`; a limpeza do efeito cobre desmontar aberto. */
export function useHideBehindDialog(visible: boolean) {
  const register = useContext(DialogA11yContext);
  useEffect(
    () => (visible && register ? register() : undefined),
    [visible, register],
  );
}
