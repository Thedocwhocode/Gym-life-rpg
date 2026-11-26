/**
 * Ganho de atributo por exercício (design v1.2, RpgRules.jsx): força por série, tempo pelo MET, e o XP do exercício
 * dividido entre STR/AGI/END/VIT pelos músculos ou pela categoria. INT vem só do modo estudo.
 * Puro: quem chama passa a descrição do exercício (biblioteca do usuário) e o peso corporal.
 */
export type AttrKey = 'STR' | 'AGI' | 'END' | 'VIT' | 'INT';

export const ATTR_ORDER: readonly AttrKey[] = [
  'STR',
  'AGI',
  'END',
  'VIT',
  'INT',
];

export type AttrWeights = Partial<Record<AttrKey, number>>;

/** O que a regra precisa saber do exercício (subconjunto de ExerciseDescriptor). */
export interface ExerciseTraits {
  category?: string | undefined;
  /** Primeiro = músculo principal; os demais, secundários. */
  muscles?: readonly string[] | undefined;
  mechanic?: string | null | undefined;
  equipment?: string | null | undefined;
}

// Músculos do catálogo openGym e da biblioteca herdada (free-exercise-db). O que não está aqui é STR.
const MUSCLE_ATTR: Record<string, AttrKey> = {
  calves: 'AGI',
  adductors: 'AGI',
  abductors: 'AGI',
  shins: 'AGI',
  abs: 'VIT',
  abdominals: 'VIT',
  obliques: 'VIT',
  neck: 'VIT',
  spine: 'VIT',
  'hip flexors': 'VIT',
  'serratus anterior': 'VIT',
  'levator scapulae': 'VIT',
  'cardiovascular system': 'END',
};

// Categoria tem prioridade sobre o músculo (CATEGORY_WEIGHTS do design).
const CATEGORY: [RegExp, AttrWeights][] = [
  [/olympic/, { STR: 0.6, AGI: 0.4 }],
  [/plyometric/, { AGI: 0.7, STR: 0.3 }],
  [/combat/, { AGI: 0.5, END: 0.5 }],
  [/cardio/, { END: 0.8, AGI: 0.2 }],
  [/stretch|mobility|yoga|pilates|rehab/, { VIT: 1 }],
];

/** Pesos do exercício: categoria, senão músculos (principal 1,0, secundários 0,5, normalizado), senão STR. */
export function weightsFor(ex: ExerciseTraits | undefined): AttrWeights {
  const cat = ex?.category?.toLowerCase() ?? '';
  const byCategory = CATEGORY.find(([re]) => re.test(cat));
  if (byCategory) return byCategory[1];
  const muscles = ex?.muscles ?? [];
  if (!muscles.length) return { STR: 1 };
  const raw: AttrWeights = {};
  muscles.forEach((m, i) => {
    const k = MUSCLE_ATTR[m.toLowerCase()] ?? 'STR';
    raw[k] = (raw[k] ?? 0) + (i === 0 ? 1 : 0.5);
  });
  const sum = Object.values(raw).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v / sum]),
  ) as AttrWeights;
}

/** Força: 2 × reps × carga relativa × (0,7 se isolado). Carga relativa = (kg + PC × fração) / PC. Teto 40. */
export function xpForSet(
  reps: number,
  kg: number,
  bodyweight = 80,
  bwFraction = 0,
  isolated = false,
): number {
  const rel = (kg + bodyweight * bwFraction) / Math.max(bodyweight, 1);
  return Math.min(40, Math.round(2 * reps * rel * (isolated ? 0.7 : 1)));
}

/** Tempo: minutos × MET × 0,25. */
export function xpForMinutes(minutes: number, met = 5): number {
  return Math.round(minutes * met * 0.25);
}

/** Divide o XP pelos pesos; o último leva o resto, para a soma bater. */
export function distributeXp(xp: number, weights: AttrWeights): AttrWeights {
  const keys = Object.keys(weights) as AttrKey[];
  let given = 0;
  return Object.fromEntries(
    keys.map((k, i) => {
      const v =
        i === keys.length - 1 ? xp - given : Math.round(xp * weights[k]!);
      given += v;
      return [k, v];
    }),
  ) as AttrWeights;
}

// shortcut: MET por categoria e fração do peso corporal fixa; o design tem por exercício, trocar quando o
// catálogo trouxer esses campos.
export function metFor(ex: ExerciseTraits | undefined): number {
  const cat = ex?.category?.toLowerCase() ?? '';
  if (/cardio|combat|plyometric/.test(cat)) return 7;
  if (/stretch|mobility|yoga|pilates|rehab/.test(cat)) return 2.5;
  return 4;
}

export function bodyweightFraction(ex: ExerciseTraits | undefined): number {
  return /body/.test(ex?.equipment?.toLowerCase() ?? '') ? 0.6 : 0;
}

export const isIsolated = (ex: ExerciseTraits | undefined) =>
  /isolat/.test(ex?.mechanic?.toLowerCase() ?? '');

/** Soma b em a, sem mutar. */
export function addAttrs(a: AttrWeights, b: AttrWeights): AttrWeights {
  const out = { ...a };
  for (const [k, v] of Object.entries(b) as [AttrKey, number][]) {
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}
