import * as Sentry from '@sentry/react-native';
import { Component, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { StageSpec } from './engine';
import FxSurface from './FxSurface';

export interface FxStageProps extends StageSpec {
  /** Escala inteira: mantém o pixel quadrado. */
  scale?: number;
  /** Ocupa a largura do pai, mantendo a proporção. */
  fill?: boolean;
  /** Cobre o pai (absoluto), cortando nas laterais. */
  cover?: boolean;
  /** Segura o quadro atual (pose de guarda no combate). */
  hold?: boolean;
  /** Mudar o valor reinicia o efeito. */
  playKey?: string | number;
  paused?: boolean;
  speed?: number;
  onDone?: () => void;
  onHit?: (hit: unknown) => void;
  label?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Um efeito quebrado some e vai para o Sentry; a tela em volta segue (PLANO C6). */
class FxBoundary extends Component<
  { fx: string; onDone?: (() => void) | undefined; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    Sentry.withScope((scope) => {
      scope.setTag('fx', this.props.fx);
      Sentry.captureException(error);
    });
    this.props.onDone?.(); // efeito quebrado conta como encerrado
  }

  override componentDidUpdate(prev: { fx: string }) {
    if (prev.fx !== this.props.fx && this.state.failed)
      this.setState({ failed: false });
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Player pixelfx ao vivo: palco escuro, escala inteira, pausa fora de foco, quadro parado com movimento reduzido. */
export default function FxStage(props: FxStageProps) {
  return (
    <FxBoundary fx={props.fx} onDone={props.onDone}>
      <FxSurface {...props} />
    </FxBoundary>
  );
}
