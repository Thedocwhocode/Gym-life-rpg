import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFxLoop } from './use-fx-loop';

const env = vi.hoisted(() => ({ focused: true }));
vi.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: () => ({ remove: () => undefined }),
  },
  Platform: { OS: 'web' },
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => true }));
vi.mock('@react-navigation/native', () => ({
  useIsFocused: () => env.focused,
}));

describe('useFxLoop com movimento reduzido', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('mostra o quadro parado e avisa o fim uma vez, depois da duração', () => {
    const onDone = vi.fn();
    const draw = vi.fn();
    const { rerender } = renderHook(() =>
      useFxLoop({ fx: 'ui/exclamation', repeat: false, onDone }, draw),
    );
    expect(draw).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    // trocar o foco reexecuta o efeito: não pode avisar de novo
    env.focused = false;
    rerender();
    env.focused = true;
    rerender();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('não avisa fim de efeito em laço', () => {
    const onDone = vi.fn();
    renderHook(() => useFxLoop({ fx: 'weather/rain', onDone }, vi.fn()));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onDone).not.toHaveBeenCalled();
  });
});
