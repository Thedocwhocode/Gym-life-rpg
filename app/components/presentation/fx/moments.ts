import { toFxText } from './engine';
import type { FxId } from './registry';

/** Qual efeito responde a qual momento do app. Os textos chegam traduzidos e viram ASCII (DR14). */
export const UI_MOMENTS = {
  combo: (n: number, label: string) => ({
    fx: 'ui/combo-counter',
    options: { count: n, label: toFxText(label) },
  }),
  /** `weight` já formatado com a unidade ("102,5kg", "225lbs"). */
  pr: (weight: string, label: string) => ({
    fx: 'ui/crit-number',
    options: { label: toFxText(label), text: toFxText(`${weight}!`) },
  }),
  set: (reps: number) => ({
    fx: 'ui/damage-number',
    options: { text: `-${reps}` },
  }),
  xp: () => ({ fx: 'ui/coin-collect', options: {} }),
  achievement: (title: string, text: string) => ({
    fx: 'ui/achievement',
    options: { title: toFxText(title), text: toFxText(text) },
  }),
  heartLost: () => ({ fx: 'ui/heart-lost', options: {} }),
  bossHit: (from: number, to: number) => ({
    fx: 'ui/health-bar-hit',
    options: { from, to },
  }),
  countdown: () => ({ fx: 'ui/countdown', options: {} }),
  alert: () => ({ fx: 'ui/exclamation', options: {} }),
  confetti: () => ({ fx: 'ui/confetti', options: {} }),
  quest: (text: string) => ({
    fx: 'ui/quest-complete',
    options: { text: toFxText(text) },
  }),
  levelUp: () => ({ fx: 'ui/level-up', options: {} }),
} satisfies Record<
  string,
  (...args: never[]) => { fx: FxId; options: Record<string, unknown> }
>;
