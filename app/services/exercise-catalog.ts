import type { ExerciseDescriptor } from '@/store/stored-sessions';

/** Linha de assets/opengym-catalog.json, na ordem de `fields` (gerado por scripts/import-opengym.mjs). */
type CatalogRow = [
  id: string,
  name: string,
  bodyPart: string,
  equipment: string,
  target: string,
  secondaryMuscles: string[],
  category: string,
  instructions: string[],
  namePt: string,
  instructionsPt: string[],
];

export interface CatalogExercise {
  id: string;
  name: string;
  namePt: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  category: string;
  instructions: string[];
  instructionsPt: string[];
  /** Palavras normalizadas dos nomes (inglês + pt-BR), para a busca. */
  words: Set<string>;
  wordsEn: string[];
  wordsPt: string[];
}

/** Chave do exercício do catálogo em `savedExercises`: o id do openGym é permanente. */
export const catalogKey = (id: string) => `og:${id}`;

const STOP = new Set(
  'a o e de da do das dos com na no nas nos em para por pela pelo the with on of and to in'.split(
    ' ',
  ),
);

// Jargão de ficha → palavra do catálogo. "Reto" (supino reto) o catálogo não escreve.
const SAME: Record<string, string> = {
  halteres: 'halter',
  haltere: 'halter',
  frente: 'frontal',
  reto: '',
};

/** Minúsculas, sem acento nem pontuação, sem palavras vazias. */
export function words(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((w) => SAME[w] ?? w)
    .filter((w) => w && !STOP.has(w));
}

export function fromRows(rows: CatalogRow[]): CatalogExercise[] {
  return rows.map(
    ([
      id,
      name,
      bodyPart,
      equipment,
      target,
      secondaryMuscles,
      category,
      instructions,
      namePt,
      instructionsPt,
    ]) => ({
      id,
      name,
      namePt,
      bodyPart,
      equipment,
      target,
      secondaryMuscles,
      category,
      instructions,
      instructionsPt,
      wordsEn: words(name),
      wordsPt: words(namePt),
      words: new Set([...words(name), ...words(namePt)]),
    }),
  );
}

let cache: Promise<CatalogExercise[]> | undefined;
/** Carrega o catálogo uma vez (import dinâmico, como o assets/exercises.json do hydrate). */
export function loadCatalog(): Promise<CatalogExercise[]> {
  cache ??= import('../assets/opengym-catalog.json').then((m) =>
    fromRows((m as unknown as { rows: CatalogRow[] }).rows),
  );
  return cache;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function displayName(e: CatalogExercise, lang: string): string {
  return capitalize(lang.startsWith('pt') && e.namePt ? e.namePt : e.name);
}

export function toDescriptor(
  e: CatalogExercise,
  lang: string,
): ExerciseDescriptor {
  const pt = lang.startsWith('pt') && e.instructionsPt.length > 0;
  return {
    name: displayName(e, lang),
    force: null,
    level: 'beginner',
    mechanic: null,
    equipment: e.equipment,
    category: e.category,
    instructions: (pt ? e.instructionsPt : e.instructions).join('\n'),
    muscles: [e.target, ...e.secondaryMuscles],
  };
}

// Equipamento de academia comum: numa ficha, "supino reto" é com barra antes de ser no landmine.
const COMMON = new Set([
  'barbell',
  'dumbbell',
  'cable',
  'leverage machine',
  'body weight',
  'ez barbell',
]);

/**
 * Os exercícios cujo nome tem todas as palavras de `query`. Primeiro os que acrescentam menos palavras ao que foi
 * buscado, depois equipamento comum, depois id menor (as entradas mais antigas do catálogo são as clássicas).
 * ponytail: varredura linear de ~5.600 conjuntos; um índice invertido se a busca por tecla pesar.
 */
export function search(catalog: CatalogExercise[], query: string, limit = 20) {
  const q = words(query);
  if (!q.length) return [];
  const asked = new Set(q);
  const extra = (ws: string[]) => ws.filter((w) => !asked.has(w)).length;
  return catalog
    .filter((e) => q.every((w) => e.words.has(w)))
    .map((e) => ({
      e,
      key: [
        Math.min(extra(e.wordsEn), extra(e.wordsPt)),
        COMMON.has(e.equipment) ? 0 : 1,
        Number(e.id),
      ],
    }))
    .sort(
      (a, b) =>
        a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.key[2] - b.key[2],
    )
    .slice(0, limit)
    .map((x) => x.e);
}

/** O exercício do catálogo para um nome lido numa ficha, ou undefined. Nunca troca o nome da ficha. */
export function match(catalog: CatalogExercise[], name: string) {
  return search(catalog, name, 1)[0];
}
