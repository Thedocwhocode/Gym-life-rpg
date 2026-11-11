/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// Fronteira com o vendor sem tipos: daqui para fora tudo é tipado.
import * as pixelfx from '@/vendor/pixelfx/src/core/index.js';
import { FX_REGISTRY, type FxId } from './registry';

// Núcleo do FxStage sem plataforma: monta a cena, avança em passo fixo e escreve RGBA.
// O web desenha com putImageData; o nativo vira uma imagem Skia (PLANO §3.6, caminho A).

export type FxPalette = string | readonly string[];
export type FxBg = 'auto' | 'ground' | 'carvao' | 'none';

export interface FxCompanion {
  fx: FxId;
  x?: number | 'target';
  y?: number;
  flip?: boolean;
  palette?: FxPalette;
  options?: Record<string, unknown>;
}

export interface StageSpec {
  fx: FxId;
  /** Efeitos com `act` são encenados pelo boneco padrão; false desliga. */
  act?: boolean;
  target?: boolean;
  body?: boolean;
  palette?: FxPalette | undefined;
  options?: Record<string, unknown> | undefined;
  /** Tamanho em pixels de arte; sem ele vale o do efeito. */
  size?: readonly [number, number] | undefined;
  bg?: FxBg;
  flip?: boolean;
  companions?: readonly FxCompanion[];
  repeat?: boolean;
}

export interface Stage {
  w: number;
  h: number;
  /** Efeito em laço: nunca termina sozinho. */
  loop: boolean;
  /** Duração nominal em segundos (meta do efeito). */
  duration: number;
  /** Avança `dt` segundos em passos de 1/fps; `ended` vale true só no passo em que o efeito termina. */
  advance(dt: number, hold?: boolean): { moved: boolean; ended: boolean };
  /** Quadro parado para movimento reduzido (meio do efeito, onde ele é mais legível). Idempotente. */
  still(): void;
  /** Escreve o quadro atual em `out` (w*h*4) e devolve o tremor [x, y] da cena. */
  render(out: Uint8ClampedArray): readonly [number, number];
}

export const STAGE_BG = '#0b0c0d';

const core: any = pixelfx;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Fundo carvão com piso de pedra nos tons Brasa (troca o "ground" violeta do pixelfx). */
function brasaBackdrop(w: number, h: number, groundY: number) {
  const hex = core.hex;
  const out = new Uint32Array(w * h);
  const top = hex(STAGE_BG),
    low = hex('#121518'),
    edge = hex('#454c52'),
    fl = hex('#252a2e'),
    fd = hex('#1c2023'),
    mo = hex('#121416');
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let c;
      if (y >= groundY) {
        const gy = y - groundY;
        if (gy === 0) c = edge;
        else {
          const off = Math.floor((gy - 1) / 5) % 2 ? 6 : 0;
          c =
            (gy - 1) % 5 === 4 || (x + off) % 12 === 0 ? mo : gy < 3 ? fl : fd;
        }
      } else {
        const t = y / Math.max(1, groundY - 1);
        c = t * 2 + BAYER[((y & 3) << 2) | (x & 3)] / 16 > 1.7 ? low : top;
      }
      out[y * w + x] = c;
    }
  return out;
}

function effect(id: string): any {
  const mod = (FX_REGISTRY as Record<string, unknown>)[id];
  if (!mod) throw new Error(`efeito pixelfx desconhecido: ${id}`);
  return mod;
}

export function createStage(
  spec: StageSpec,
  onHit?: (hit: unknown) => void,
): Stage {
  const {
    act,
    target = true,
    body = true,
    palette,
    options,
    size,
    bg = 'auto',
    flip = false,
    companions = [],
    repeat = true,
  } = spec;
  const mod = effect(spec.fx);
  const comps = companions.map((c) => effect(c.fx));
  const meta = { fps: 30, loop: false, duration: 1, ...mod.meta };
  const useAct = act !== false && !!mod.act;

  let w: number, h: number, ox: number, oy: number;
  if (useAct) {
    const b = { ...core.actBounds(mod) };
    b.y1 = Math.min(b.y1, 14);
    w = b.x1 - b.x0;
    h = b.y1 - b.y0;
    ox = -b.x0;
    oy = -b.y0;
  } else {
    [w, h] = meta.size;
    [ox, oy] = meta.origin;
  }
  if (size) {
    const [W, H] = size;
    ox += Math.floor((W - w) / 2);
    oy += useAct ? H - h : Math.floor((H - h) / 2);
    w = W;
    h = H;
  }

  const pal = (p: FxPalette) => (typeof p === 'string' ? core.PAL[p] : p);
  const tx = useAct
    ? ((mod.act.target || (mod.act.targets || [])[0] || {}).x ?? 66)
    : 0;
  const frame = core.createFrame(w, h);
  const bgKind =
    bg === 'auto' ? (useAct || meta.bg === 'ground' ? 'ground' : 'carvao') : bg;
  const bgBuf =
    bgKind === 'none'
      ? null
      : brasaBackdrop(w, h, bgKind === 'ground' ? oy : h);
  const opts = {
    x: ox,
    y: oy,
    flip,
    ...(palette ? { palette: pal(palette) } : {}),
    ...options,
  };
  const make = () => {
    const inst = (useAct ? core.createAct : core.createFx)(mod, opts);
    if (useAct && onHit) inst.onHit = onHit;
    return inst;
  };
  let inst = make();
  const others = comps.map((m, i) => {
    const c = companions[i];
    const cx = c.x === 'target' ? (flip ? -tx : tx) : (c.x ?? 0);
    return core.createFx(m, {
      x: ox + cx,
      y: oy + (c.y ?? 0),
      flip: c.flip ?? (c.x === 'target' ? !flip : false),
      ...(c.palette ? { palette: pal(c.palette) } : {}),
      ...c.options,
    });
  });

  const step = 1 / meta.fps;
  let acc = 0,
    wait = 0,
    endedOnce = false;
  const finished = () =>
    useAct ? inst.done() : !meta.loop && inst.t >= meta.duration;

  return {
    w,
    h,
    loop: !!meta.loop,
    duration: meta.duration,
    advance(dt, hold = false) {
      acc += Math.min(dt, 0.1);
      let moved = false,
        ended = false;
      while (acc >= step) {
        acc -= step;
        if (!hold) {
          if (finished()) {
            if (!endedOnce) endedOnce = ended = true;
            if (repeat && (wait += step) > 0.6) {
              inst = make();
              wait = 0;
              endedOnce = false;
            }
          } else inst.update(step);
        }
        others.forEach((o) => o.update(step));
        moved = true;
      }
      return { moved, ended };
    },
    still() {
      inst = make();
      inst.update(meta.loop ? 0.5 : meta.duration * 0.45);
    },
    render(out) {
      core.clearFrame(frame);
      others.forEach((o) => o.draw(frame, 'back'));
      if (useAct) inst.draw(frame, { body, target });
      else {
        inst.draw(frame, 'back');
        if (meta.actor && body) {
          const tt = meta.loop
            ? inst.t % meta.duration
            : Math.min(inst.t, meta.duration);
          core.drawActor(
            core.painterFor(frame).place(ox, oy, flip),
            inst.options.actor ?? core.stockActor(),
            core.actorAlphaOf(mod, tt, inst.options),
          );
        }
        inst.draw(frame, 'front');
      }
      others.forEach((o) => o.draw(frame, 'front'));
      core.composite(frame, out, bgBuf);
      return useAct ? inst.shake : [0, 0];
    },
  };
}

/** A fonte do pixelfx só tem ASCII: tira acentos e põe em caixa alta (DR14). */
export function toFxText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '')
    .toUpperCase();
}

/**
 * Pior janela de 1 s em flashes/s (DR19). Flash = par de variações de ≥ 10% na luminância média
 * do palco entre quadros seguidos. Medido em 2026-11-10: o pior dos 68 efeitos dá 1/s (ui/countdown).
 */
export function flashesPerSecond(luma: readonly number[], fps = 30): number {
  let worst = 0;
  for (let a = 0; a + fps <= luma.length; a++) {
    let swings = 0;
    for (let i = a + 1; i < a + fps; i++)
      if (Math.abs(luma[i] - luma[i - 1]) >= 0.1) swings++;
    worst = Math.max(worst, swings / 2);
  }
  return worst;
}
