import { describe, expect, it, vi } from 'vitest';

// Só a função pura interessa aqui; o componente puxa react-native e o tema.
vi.mock('react-native', () => ({ Text: 'Text', View: 'View' }));
vi.mock('@/hooks/useAppTheme', () => ({ useAppTheme: () => ({}) }));

const { badgeText } = await import('./Badge');

describe('badgeText', () => {
  it('mostra o número até o máximo e "max+" acima dele', () => {
    expect(badgeText(7)).toBe('7');
    expect(badgeText(99)).toBe('99');
    expect(badgeText(100)).toBe('99+');
    expect(badgeText(12, 9)).toBe('9+');
  });
});
