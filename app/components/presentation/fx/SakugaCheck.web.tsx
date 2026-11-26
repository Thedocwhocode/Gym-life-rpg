import Check from '@/components/presentation/pixel/Check';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEffectsMode } from '@/hooks/useEffectsMode';
import { createElement, useEffect, useRef, useState } from 'react';
import type { SakugaCheckProps } from './SakugaCheck';

// O app não carrega os tipos do DOM: só o pedaço do custom element que usamos.
interface SakugaEl {
  checked: boolean;
  shadowRoot: { appendChild(n: unknown): void } | null;
  addEventListener(t: 'change', f: () => void): void;
  removeEventListener(t: 'change', f: () => void): void;
}
const web = globalThis as unknown as {
  customElements?: { whenDefined(tag: string): Promise<unknown> };
  document: { createElement(tag: 'style'): { textContent: string } };
  SakugaFX?: { P: Record<string, unknown> };
};

const TAG = 'sakuga-checkbox';
let loading: Promise<unknown> | undefined;
const load = () =>
  (loading ??= import('@/vendor/sakuga-vfx/checkbox.js').then(() =>
    web.customElements?.whenDefined(TAG),
  ));
// Pixel honesto: o componente vem com cantos de 9 px.
const SHADOW_CSS = '.box{border-radius:0;width:32px;height:32px}';
const HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

/**
 * Checkbox anime (sakuga-vfx, MIT) na camada "Sistema". Com Efeitos Reduzido/Desligado, ou enquanto o
 * arquivo carrega, fica o checkbox pixel.
 */
export default function SakugaCheck(props: SakugaCheckProps) {
  const { checked, onChange, label, testID } = props;
  const { palette } = useAppTheme();
  const anime = useEffectsMode() === 'complete';
  const [ready, setReady] = useState(false);
  const ref = useRef<SakugaEl | null>(null);

  useEffect(() => {
    if (!anime) return;
    let live = true;
    load()
      .then(() => live && setReady(true))
      .catch(() => {}); // sem o arquivo, fica o pixel
    return () => {
      live = false;
    };
  }, [anime]);

  useEffect(() => {
    const el = ref.current;
    if (!ready || !anime || !el) return;
    if (el.shadowRoot) {
      const st = web.document.createElement('style');
      st.textContent = SHADOW_CSS;
      el.shadowRoot.appendChild(st);
    }
    const f = () => onChange(el.checked);
    el.addEventListener('change', f);
    return () => el.removeEventListener('change', f);
  }, [ready, anime, onChange]);

  useEffect(() => {
    // pelo código não dispara efeito: só o toque do usuário anima
    if (ref.current && ref.current.checked !== checked)
      ref.current.checked = checked;
  }, [checked, ready]);

  useEffect(() => {
    // o canvas de efeitos é um só para a página: tons do Sistema
    if (ready && web.SakugaFX)
      Object.assign(web.SakugaFX.P, {
        fill: palette.text1,
        shade: palette.systemLine,
        line: palette.system,
        accent: palette.systemStrong,
        ink: palette.bgApp,
        sfx: [palette.bgApp, palette.systemStrong],
      });
  }, [ready, palette]);

  if (!anime || !ready) return <Fallback {...props} />;
  return createElement(
    TAG,
    {
      ref,
      'data-testid': testID,
      checked: checked ? '' : undefined,
      style: {
        '--sk-card': palette.surface2,
        '--sk-ink': palette.systemLine,
        '--sk-acc': palette.systemStrong,
        '--sk-tick': palette.system,
        '--sk-bw': '2px',
        '--sk-sh': '0 3px 0 rgba(0,0,0,.55)',
      },
    },
    createElement('span', { style: HIDDEN }, label),
  );
}

function Fallback({ checked, onChange, label, testID }: SakugaCheckProps) {
  return (
    <Check
      kind="checkbox"
      checked={checked}
      onPress={() => onChange(!checked)}
      accessibilityLabel={label}
      testID={testID}
    />
  );
}
