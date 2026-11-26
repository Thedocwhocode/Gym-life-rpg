import { describe, expect, it, vi } from 'vitest';
import { sound, soundForLabel } from './sound';

describe('som', () => {
  it('escolhe o som pelo papel do botão', () => {
    expect(soundForLabel('Painel', true)).toBe('ui_tab');
    expect(soundForLabel('Desistir', false)).toBe('ui_cancel');
    expect(soundForLabel('Pular pausa', false)).toBe('ui_cancel');
    expect(soundForLabel('Iniciar foco', false)).toBe('ui_confirm');
    expect(soundForLabel('Save', false)).toBe('ui_confirm');
    expect(soundForLabel('Mais flexões', false)).toBe('ui_tap');
  });

  it('grava os ajustes e avisa quem escuta', () => {
    const f = vi.fn();
    const off = sound.subscribe(f);
    sound.setPrefs({ enabled: false, volume: 'high' });
    expect(f).toHaveBeenCalledWith({ enabled: false, volume: 'high' });
    expect(sound.prefs).toEqual({ enabled: false, volume: 'high' });
    expect(JSON.parse(localStorage.getItem('gl.sound') ?? '{}')).toEqual({
      enabled: false,
      volume: 'high',
    });
    off();
    sound.setPrefs({ enabled: true, volume: 'mid' });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('não toca nada antes do primeiro gesto', () => {
    const spy = vi.fn();
    vi.stubGlobal('AudioContext', spy);
    sound.play('ui_tap');
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
