import type { FxId } from './registry';

/**
 * Transições de tela (design-spec D.7). `cover`: segundos até cobrir a tela com speed 1;
 * `duration`: duração do efeito no pixelfx. Rodam a `TRANSITION_SPEED`.
 * reward, logout, defeat e boss ficam definidas mas não disparam (como no protótipo).
 */
export const TRANSITIONS = {
  tab: { fx: 'transitions/pixel-dissolve', cover: 1.0, duration: 2.2 },
  combat: { fx: 'transitions/slash-wipe', cover: 0.75, duration: 1.7 },
  back: { fx: 'transitions/iris', cover: 1.0, duration: 2.2 },
  subpage: { fx: 'transitions/blinds', cover: 0.95, duration: 2.0 },
  grimoire: { fx: 'transitions/diamond-wipe', cover: 0.95, duration: 2.0 },
  reward: { fx: 'transitions/star-iris', cover: 1.0, duration: 2.2 },
  logout: { fx: 'transitions/crt-off', cover: 0.9, duration: 2.0 },
  ai: { fx: 'transitions/glitch-wipe', cover: 0.8, duration: 1.8 },
  defeat: { fx: 'transitions/burn-away', cover: 1.4, duration: 3 },
  boss: { fx: 'transitions/shatter-wipe', cover: 1.2, duration: 2.8 },
} as const satisfies Record<
  string,
  { fx: FxId; cover: number; duration: number }
>;

export type TransitionKind = keyof typeof TRANSITIONS;

export const TRANSITION_SPEED = 2;
/** Teto: o overlay nunca fica mais que isso, mesmo se o efeito travar. */
export const TRANSITION_MAX_MS = 1600;

/**
 * Agenda a navegação no instante em que a tela está coberta e some com o overlay no fim.
 * Só timers (nada de onDone/rAF): com a aba oculta o rAF para e a navegação travaria.
 */
export function createTransitionRunner(
  show: (kind: TransitionKind | undefined) => void,
) {
  let busy = false;
  return {
    run(kind: TransitionKind, action: () => void, enabled: boolean) {
      if (!enabled) return action();
      if (busy) return; // toque duplo durante a transição: ignora
      busy = true;
      const t = TRANSITIONS[kind];
      const coverMs = (t.cover / TRANSITION_SPEED) * 1000;
      const endMs = Math.min(
        (t.duration / TRANSITION_SPEED) * 1000,
        TRANSITION_MAX_MS,
      );
      show(kind);
      setTimeout(action, coverMs);
      setTimeout(() => {
        busy = false;
        show(undefined);
      }, endMs);
    },
  };
}
