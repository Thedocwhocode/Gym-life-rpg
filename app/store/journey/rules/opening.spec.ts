import { describe, expect, it } from 'vitest';
import { openingOverlay } from './opening';

const none = { reward: false, heart: false, chronicle: false, intro: false };

describe('openingOverlay', () => {
  it('um aviso só, pela prioridade recompensa > coração > crônica > boas-vindas', () => {
    expect(openingOverlay(none)).toBeUndefined();
    expect(openingOverlay({ ...none, intro: true })).toBe('intro');
    expect(openingOverlay({ ...none, intro: true, chronicle: true })).toBe(
      'chronicle',
    );
    expect(
      openingOverlay({ ...none, intro: true, chronicle: true, heart: true }),
    ).toBe('heart');
    expect(
      openingOverlay({
        reward: true,
        heart: true,
        chronicle: true,
        intro: true,
      }),
    ).toBe('reward');
  });
});
