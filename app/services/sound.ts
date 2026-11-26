/**
 * Som do GymLife RPG (design v1.2, só web). Cada efeito tem um substituto sintetizado em Web Audio
 * (onda quadrada, mesmo papel e duração); quando o mp3 gerado no ElevenLabs entra em
 * `assets/sound/sfx/`, ele passa a tocar no lugar. Tudo fica mudo até o primeiro gesto do usuário
 * (política dos navegadores).
 */

type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine';
/** [freq inicial, freq final, duração s, forma, volume] por nota. */
type Note = readonly [number, number, number, Wave, number];
type Channel = 'ui' | 'sfx';

const SOUNDS = {
  ui_tap: { ch: 'ui', synth: [[1320, 1320, 0.04, 'square', 0.25]] },
  ui_confirm: {
    ch: 'ui',
    synth: [
      [880, 880, 0.06, 'square', 0.3],
      [1320, 1320, 0.1, 'square', 0.3],
    ],
  },
  ui_cancel: {
    ch: 'ui',
    synth: [
      [440, 440, 0.06, 'square', 0.3],
      [294, 294, 0.1, 'square', 0.3],
    ],
  },
  ui_tab: { ch: 'ui', synth: [[700, 1400, 0.05, 'triangle', 0.25]] },
  hit_set: {
    ch: 'sfx',
    synth: [
      [1800, 200, 0.08, 'sawtooth', 0.35],
      [120, 60, 0.12, 'square', 0.4],
    ],
  },
  monster_faint: { ch: 'sfx', synth: [[880, 110, 0.45, 'square', 0.3]] },
  level_up: {
    ch: 'sfx',
    synth: [
      [523, 523, 0.12, 'square', 0.3],
      [659, 659, 0.12, 'square', 0.3],
      [784, 784, 0.12, 'square', 0.3],
      [1047, 1047, 0.5, 'square', 0.35],
    ],
  },
  quest_complete: {
    ch: 'sfx',
    synth: [
      [784, 784, 0.1, 'square', 0.3],
      [988, 988, 0.1, 'square', 0.3],
      [1175, 1175, 0.4, 'square', 0.3],
    ],
  },
  heart_lost: {
    ch: 'sfx',
    synth: [
      [494, 494, 0.15, 'square', 0.25],
      [440, 440, 0.15, 'square', 0.25],
      [370, 370, 0.35, 'square', 0.25],
    ],
  },
  system_notice: {
    ch: 'sfx',
    synth: [
      [1568, 1568, 0.08, 'sine', 0.25],
      [2093, 2093, 0.3, 'sine', 0.2],
    ],
  },
} as const satisfies Record<string, { ch: Channel; synth: readonly Note[] }>;

export type SoundId = keyof typeof SOUNDS;

/**
 * mp3 por id. Para ligar um arquivo: `ui_tap: require('@/assets/sound/sfx/ui_tap.mp3')`.
 * shortcut: música (bgm_overworld/bgm_battle) fica de fora até os loops entrarem no repo; ela
 * não tem substituto sintetizado de propósito (silêncio é melhor que um loop pobre).
 */
const FILES: Partial<Record<SoundId, string>> = {};

/** UI 6 dB abaixo do combate, como no design. */
const CHANNEL_GAIN: Record<Channel, number> = { ui: 0.5, sfx: 1 };
export const SOUND_VOLUMES = { low: 0.35, mid: 0.7, high: 1 } as const;
export type SoundVolume = keyof typeof SOUND_VOLUMES;

export interface SoundPrefs {
  enabled: boolean;
  volume: SoundVolume;
}
const KEY = 'gl.sound';
const DEFAULT: SoundPrefs = { enabled: true, volume: 'mid' };

function load(): SoundPrefs {
  try {
    const raw: unknown = JSON.parse(
      globalThis.localStorage?.getItem(KEY) ?? 'null',
    );
    const o = (raw ?? {}) as Partial<SoundPrefs>;
    return {
      enabled: typeof o.enabled === 'boolean' ? o.enabled : DEFAULT.enabled,
      volume: o.volume && o.volume in SOUND_VOLUMES ? o.volume : DEFAULT.volume,
    };
  } catch {
    return DEFAULT;
  }
}

// O tsconfig do RN não traz os tipos DOM: só o pedaço da Web Audio que usamos (como share-card.web.ts).
interface Param {
  setValueAtTime(v: number, t: number): void;
  exponentialRampToValueAtTime(v: number, t: number): void;
}
interface AudioNodeLike {
  connect(n: AudioNodeLike): AudioNodeLike;
}
interface Ctx {
  state: string;
  currentTime: number;
  destination: AudioNodeLike;
  resume(): Promise<void>;
  createOscillator(): AudioNodeLike & {
    type: Wave;
    frequency: Param;
    start(t: number): void;
    stop(t: number): void;
  };
  createGain(): AudioNodeLike & { gain: Param };
}
const web = globalThis as unknown as {
  AudioContext?: new () => Ctx;
  webkitAudioContext?: new () => Ctx;
  Audio?: new (src: string) => { volume: number; play(): Promise<void> };
};

let prefs = load();
let unlocked = false;
let audio: Ctx | undefined;
const listeners = new Set<(p: SoundPrefs) => void>();

function context(): Ctx | undefined {
  if (!audio) {
    const C = web.AudioContext ?? web.webkitAudioContext;
    if (!C) return undefined;
    audio = new C();
  }
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}

const gain = (ch: Channel) => SOUND_VOLUMES[prefs.volume] * CHANNEL_GAIN[ch];

function synth(notes: readonly Note[], ch: Channel) {
  const c = context();
  if (!c) return;
  let t = c.currentTime + 0.01;
  for (const [f0, f1, d, wave, v] of notes) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d);
    g.gain.setValueAtTime(v * gain(ch), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + d + 0.02);
    t += d;
  }
}

export const sound = {
  /** Destrava o áudio no primeiro gesto (o SoundProvider chama). */
  unlock() {
    if (unlocked) return;
    unlocked = true;
    context();
  },
  play(id: SoundId) {
    if (!unlocked || !prefs.enabled) return;
    const s = SOUNDS[id];
    const src = FILES[id];
    if (!src || !web.Audio) return synth(s.synth, s.ch);
    const a = new web.Audio(src);
    a.volume = Math.min(1, gain(s.ch));
    a.play().catch(() => synth(s.synth, s.ch));
  },
  get prefs() {
    return prefs;
  },
  setPrefs(next: SoundPrefs) {
    prefs = next;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(next));
    } catch {
      // armazenamento bloqueado (aba privada): o ajuste vale só nesta sessão
    }
    listeners.forEach((f) => f(next));
  },
  subscribe(f: (p: SoundPrefs) => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};

const LABEL_SOUNDS: [RegExp, SoundId][] = [
  [
    /cancel|voltar|fechar|close|pular|skip|sair|descartar|desistir|give up/i,
    'ui_cancel',
  ],
  [
    /confirmar|confirm|salvar|save|come[cç]ar|start|iniciar|aceitar|concluir|finalizar|finish|continuar|continue|equipar|equip|resgatar|claim|entrar|criar|create|importar|import|ok$/i,
    'ui_confirm',
  ],
];

/** Qual som um elemento clicado toca: aba > texto/rótulo do botão > toque neutro. */
export function soundForLabel(label: string, isTab: boolean): SoundId {
  if (isTab) return 'ui_tab';
  for (const [re, id] of LABEL_SOUNDS) if (re.test(label)) return id;
  return 'ui_tap';
}
