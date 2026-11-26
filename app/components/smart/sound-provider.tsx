import { sound, soundForLabel, type SoundPrefs } from '@/services/sound';
import { useEffect, useSyncExternalStore } from 'react';

/**
 * Uma vez perto da raiz: destrava o áudio no primeiro gesto e dá a cada botão, aba ou link o som
 * do seu papel. Botões com `data-sound="none"` (ou `dataSet={{ sound: 'none' }}` no RN web) tocam
 * o próprio som no evento.
 */
interface El {
  closest?(sel: string): El | null;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  textContent: string | null;
}
type Listener = (e: { target: unknown }) => void;
interface Doc {
  addEventListener(t: string, f: Listener, o?: { once: boolean }): void;
  removeEventListener(t: string, f: Listener): void;
}

export function SoundProvider() {
  useEffect(() => {
    const document = (globalThis as unknown as { document?: Doc }).document;
    if (!document) return;
    const first = () => sound.unlock();
    const onClick: Listener = (e) => {
      const el = (e.target as El | null)?.closest?.(
        'button, [role=button], [role=tab], [role=link], a[href]',
      );
      if (!el || el.getAttribute('aria-disabled') === 'true') return;
      if (el.getAttribute('data-sound') === 'none') return;
      const label = el.getAttribute('aria-label') ?? el.textContent ?? '';
      const isTab =
        el.getAttribute('role') === 'tab' || el.hasAttribute('aria-current');
      sound.play(soundForLabel(label.trim(), isTab));
    };
    document.addEventListener('pointerdown', first, { once: true });
    document.addEventListener('keydown', first, { once: true });
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('pointerdown', first);
      document.removeEventListener('keydown', first);
      document.removeEventListener('click', onClick);
    };
  }, []);
  return null;
}

/** Ajustes de som para a Taverna. */
export function useSoundPrefs(): SoundPrefs {
  return useSyncExternalStore(sound.subscribe, () => sound.prefs);
}
