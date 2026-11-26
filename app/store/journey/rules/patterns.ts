import {
  weightsFor,
  type AttrKey,
  type ExerciseTraits,
} from '@/store/journey/rules/attributes';

/** Padrões de movimento do design v1.2 (RpgRules.jsx). O nome mostrado vem do i18n `rpg.pattern.<k>`. */
export const PATTERNS = [
  'JO',
  'QD',
  'EP',
  'PX',
  'IS',
  'CO',
  'OL',
  'PL',
  'CA',
  'MO',
] as const;
export type PatternKey = (typeof PATTERNS)[number];

/** Atributos que um exercício pode dar (INT vem só do estudo). */
export const BODY_ATTRS = ['STR', 'AGI', 'END', 'VIT'] as const;

// Categoria manda; senão, o músculo principal (`target` do catálogo openGym).
const BY_CATEGORY: [RegExp, PatternKey][] = [
  [/olympic/, 'OL'],
  [/plyometric/, 'PL'],
  [/cardio|combat/, 'CA'],
  [/stretch|mobility|yoga|pilates|rehab/, 'MO'],
];
const BY_MUSCLE: Record<string, PatternKey> = {
  quads: 'JO',
  quadriceps: 'JO',
  adductors: 'JO',
  abductors: 'JO',
  glutes: 'QD',
  hamstrings: 'QD',
  'lower back': 'QD',
  pectorals: 'EP',
  chest: 'EP',
  delts: 'EP',
  shoulders: 'EP',
  lats: 'PX',
  'upper back': 'PX',
  'middle back': 'PX',
  traps: 'PX',
  abs: 'CO',
  abdominals: 'CO',
  obliques: 'CO',
  spine: 'CO',
  'hip flexors': 'CO',
  'serratus anterior': 'CO',
  'cardiovascular system': 'CA',
};

export function patternFor(ex: ExerciseTraits): PatternKey {
  const cat = ex.category?.toLowerCase() ?? '';
  const byCat = BY_CATEGORY.find(([re]) => re.test(cat));
  if (byCat) return byCat[1];
  // bíceps, tríceps, antebraço, panturrilha, pescoço…: isolamento
  return BY_MUSCLE[ex.muscles?.[0]?.toLowerCase() ?? ''] ?? 'IS';
}

/** O atributo que mais ganha com o exercício (desempate na ordem STR, AGI, END, VIT). */
export function dominantAttr(ex: ExerciseTraits): AttrKey {
  const w = weightsFor(ex);
  return BODY_ATTRS.reduce((best, k) =>
    (w[k] ?? 0) > (w[best] ?? 0) ? k : best,
  );
}

/** Minúsculas sem acento, para buscar "supino" em "Supino" e "flexao" em "Flexão". */
export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

export interface PickerEntry {
  key: string;
  name: string;
  pattern: PatternKey;
  attr: AttrKey;
  /** Texto já normalizado onde a busca procura (nomes e músculos). */
  hay: string;
}

export function pickerEntry(
  key: string,
  names: string[],
  ex: ExerciseTraits,
): PickerEntry {
  return {
    key,
    name: names[0] ?? key,
    pattern: patternFor(ex),
    attr: dominantAttr(ex),
    hay: norm([...names, ...(ex.muscles ?? [])].join(' ')),
  };
}

export function filterEntries<T extends PickerEntry>(
  entries: readonly T[],
  {
    q,
    pattern,
    attr,
  }: {
    q: string;
    pattern?: PatternKey | undefined;
    attr?: AttrKey | undefined;
  },
): T[] {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return entries.filter(
    (e) =>
      (!pattern || e.pattern === pattern) &&
      (!attr || e.attr === attr) &&
      words.every((w) => e.hay.includes(w)),
  );
}
