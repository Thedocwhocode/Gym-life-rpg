/**
 * Paletas do redesign (docs/redesign/design-spec.md §A). Cada paleta define o
 * mesmo conjunto de chaves; o teste `palettes.spec.ts` garante isso e o
 * contraste mínimo (AA, 4,5:1) dos textos sobre todas as superfícies (DR16/DR17).
 */

export const PALETTE_IDS = ['brasa', 'ferro', 'fosforo', 'pergaminho'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];
export const DEFAULT_PALETTE: PaletteId = 'brasa';

export interface Palette {
  id: PaletteId;
  isDark: boolean;
  bgApp: string;
  bgSunken: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surfaceOverlay: string;
  line1: string;
  line2: string;
  lineFrame: string;
  lineFocus: string;
  text1: string;
  text2: string;
  text3: string;
  textDisabled: string;
  textOnAccent: string;
  /** Texto sobre botão de perigo: o preenchimento é `dangerDeep` (DR17). */
  textOnDanger: string;
  accent: string;
  accentStrong: string;
  accentMuted: string;
  accentWash: string;
  danger: string;
  dangerStrong: string;
  dangerDeep: string;
  dangerWash: string;
  success: string;
  successWash: string;
  reward: string;
  steel: string;
  barXp: string;
  barEnergy: string;
  barHp: string;
  barTrack: string;
  attrStr: string;
  attrDex: string;
  attrCon: string;
  attrSta: string;
}

const brasa: Palette = {
  id: 'brasa',
  isDark: true,
  bgApp: '#0b0c0d',
  bgSunken: '#111315',
  surface1: '#16191b',
  surface2: '#1c2023',
  surface3: '#252a2e',
  surfaceOverlay: 'rgba(6,7,8,0.82)',
  line1: '#31373c',
  line2: '#454c52',
  lineFrame: '#c98a35',
  lineFocus: '#f4c97a',
  text1: '#efe9db',
  text2: '#b3ab99',
  text3: '#9a9282',
  textDisabled: '#635e54',
  textOnAccent: '#0b0c0d',
  textOnDanger: '#efe9db',
  accent: '#e6a94f',
  accentStrong: '#f4c97a',
  accentMuted: '#7a5322',
  accentWash: '#2e2111',
  danger: '#cc4a3a',
  dangerStrong: '#e0705f',
  dangerDeep: '#a8342a',
  dangerWash: '#2a110f',
  success: '#86a95c',
  successWash: '#1a2214',
  reward: '#e8c15a',
  steel: '#9aa3ab',
  barXp: '#e6a94f',
  barEnergy: '#86a95c',
  barHp: '#cc4a3a',
  barTrack: '#252a2e',
  attrStr: '#d8683f',
  attrDex: '#b3b85a',
  attrCon: '#cf4a44',
  attrSta: '#5fae6e',
};

const ferro: Palette = {
  id: 'ferro',
  isDark: true,
  bgApp: '#0c0c0c',
  bgSunken: '#111111',
  surface1: '#161616',
  surface2: '#1d1d1d',
  surface3: '#262626',
  surfaceOverlay: 'rgba(6,7,8,0.82)',
  line1: '#333333',
  line2: '#4a4a4a',
  lineFrame: '#8c877d',
  lineFocus: '#efe9db',
  text1: '#efe9db',
  text2: '#aaa499',
  text3: '#9a958b',
  textDisabled: '#635e54',
  textOnAccent: '#0b0c0d',
  textOnDanger: '#efe9db',
  accent: '#efe9db',
  accentStrong: '#ffffff',
  accentMuted: '#4a4741',
  accentWash: '#1f1e1b',
  danger: '#c2362b',
  dangerStrong: '#ea6a5c',
  dangerDeep: '#8f241c',
  dangerWash: '#2a100d',
  success: '#c9c3b5',
  successWash: '#1a2214',
  reward: '#efe9db',
  steel: '#9aa3ab',
  barXp: '#efe9db',
  barEnergy: '#8c877d',
  barHp: '#c2362b',
  barTrack: '#262626',
  attrStr: '#c9c3b5',
  attrDex: '#a8a397',
  attrCon: '#de5446',
  attrSta: '#8c877d',
};

const fosforo: Palette = {
  id: 'fosforo',
  isDark: true,
  bgApp: '#0a0907',
  bgSunken: '#0e0c09',
  surface1: '#13110c',
  surface2: '#1a1710',
  surface3: '#241f15',
  surfaceOverlay: 'rgba(6,7,8,0.82)',
  line1: '#3a3021',
  line2: '#574629',
  lineFrame: '#b9832f',
  lineFocus: '#ffd38a',
  text1: '#ffc46b',
  text2: '#c9944a',
  text3: '#b08848',
  textDisabled: '#635e54',
  textOnAccent: '#0b0c0d',
  textOnDanger: '#efe9db',
  accent: '#ffb547',
  accentStrong: '#ffd38a',
  accentMuted: '#6b4c1e',
  accentWash: '#2a1f0e',
  danger: '#e2513c',
  dangerStrong: '#ff7a63',
  dangerDeep: '#a8342a',
  dangerWash: '#2c120d',
  success: '#d8c06a',
  successWash: '#1a2214',
  reward: '#ffd38a',
  steel: '#9aa3ab',
  barXp: '#ffb547',
  barEnergy: '#d8c06a',
  barHp: '#e2513c',
  barTrack: '#241f15',
  attrStr: '#e2793f',
  attrDex: '#d8c06a',
  attrCon: '#e2513c',
  attrSta: '#b8b04a',
};

const pergaminho: Palette = {
  id: 'pergaminho',
  isDark: false,
  bgApp: '#e6dcc5',
  bgSunken: '#ddd1b6',
  surface1: '#efe7d4',
  surface2: '#f5efe1',
  surface3: '#d8cbad',
  surfaceOverlay: 'rgba(42,33,24,0.55)',
  line1: '#c2b393',
  line2: '#a39273',
  lineFrame: '#8a5a1c',
  lineFocus: '#5e3a0e',
  text1: '#2a2118',
  text2: '#54473a',
  text3: '#5a4e40',
  textDisabled: '#a89a85',
  textOnAccent: '#f5efe1',
  textOnDanger: '#efe9db',
  accent: '#94591a',
  accentStrong: '#6e3f0d',
  accentMuted: '#c9a671',
  accentWash: '#e8d6b0',
  danger: '#9a2c21',
  dangerStrong: '#7a1f17',
  dangerDeep: '#6b1f1a',
  dangerWash: '#ecd0c4',
  success: '#4f6d2c',
  successWash: '#dbe0c2',
  reward: '#94591a',
  steel: '#5d6670',
  barXp: '#94591a',
  barEnergy: '#4f6d2c',
  barHp: '#9a2c21',
  barTrack: '#d3c4a3',
  attrStr: '#a5431f',
  attrDex: '#6e7124',
  attrCon: '#9a2c21',
  attrSta: '#2f6e3c',
};

export const palettes: Record<PaletteId, Palette> = {
  brasa,
  ferro,
  fosforo,
  pergaminho,
};

/** Cor de texto de acento: no Pergaminho o acento claro não passa em AA, então usa `accentStrong` (DR17). */
export function accentText(p: Palette): string {
  return p.isDark ? p.accent : p.accentStrong;
}

export function isPaletteId(value: unknown): value is PaletteId {
  return (PALETTE_IDS as readonly string[]).includes(value as string);
}

/** Cores que não mudam com a paleta (DR16): palco de FX e brilhos âmbar. */
export const fixedColors = {
  fxStage: '#0b0c0d',
  glowReward: 'rgba(244,201,122,0.35)',
  glowRewardEdge: 'rgba(244,201,122,0.6)',
  glowText: 'rgba(244,201,122,0.45)',
  glowDanger: 'rgba(204,74,58,0.35)',
  glowBoss: 'rgba(204,74,58,0.5)',
} as const;
