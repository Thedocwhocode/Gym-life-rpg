import { describe, expect, it, vi } from 'vitest';
import type { PreferenceService } from '@/services/preference-service';

const platform = vi.hoisted(() => ({ OS: 'android' }));
vi.mock('react-native', () => ({ Platform: platform }));
const devTools = vi.hoisted(() => vi.fn());
vi.mock('@tolgee/react', async (orig) => {
  const real = await orig<typeof import('@tolgee/react')>();
  devTools.mockImplementation(real.DevTools);
  return { ...real, DevTools: devTools };
});

const prefs = {
  getPreferredLanguage: () => Promise.resolve('pt'),
} as unknown as PreferenceService;

describe('getTolgee', () => {
  // No nativo o observer in-context deixa caracteres de largura zero em todo texto (visto no TalkBack).
  it('não liga o DevTools fora da web', async () => {
    const { getTolgee } = await import('@/services/tolgee');
    getTolgee(prefs);
    expect(devTools).not.toHaveBeenCalled();
  });
});
