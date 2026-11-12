import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FX_IDS } from './registry';
import { createTransitionRunner, TRANSITIONS } from './transitions';

describe('transições de tela', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('todo fx do mapa existe no registry', () => {
    for (const t of Object.values(TRANSITIONS)) expect(FX_IDS).toContain(t.fx);
  });

  it('navega quando a tela está coberta e some no fim, uma vez só', () => {
    const show = vi.fn();
    const action = vi.fn();
    const r = createTransitionRunner(show);
    r.run('tab', action, true);
    r.run('tab', action, true); // toque duplo
    expect(show).toHaveBeenLastCalledWith('tab');
    vi.advanceTimersByTime(499);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); // 1,0 s / speed 2
    expect(action).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(600); // 2,2 s / 2
    expect(show).toHaveBeenLastCalledWith(undefined);
    r.run('ai', action, true); // livre de novo
    vi.advanceTimersByTime(400);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('desligada (efeitos reduzidos/desligados): navega na hora, sem overlay', () => {
    const show = vi.fn();
    const action = vi.fn();
    createTransitionRunner(show).run('combat', action, false);
    expect(action).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
  });

  it('o overlay nunca passa do teto', () => {
    const show = vi.fn();
    createTransitionRunner(show).run('defeat', () => {}, true);
    vi.advanceTimersByTime(1600);
    expect(show).toHaveBeenLastCalledWith(undefined);
  });
});
