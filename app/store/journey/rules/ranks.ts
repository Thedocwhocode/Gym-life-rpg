/**
 * Ranks E → S do Sistema (design v1.2, RpgRules.jsx). Cada rank pede um nível mínimo e uma prova
 * ("Dungeon de Promoção"). Tudo sai de valores que só sobem (nível máximo, semanas na meta, PRs,
 * missões diárias), então o rank nunca se perde e não precisa ser gravado.
 */
export type RankId = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankFacts {
  /** Maior nível já alcançado. */
  level: number;
  /** Semanas em que a meta de treinos foi batida (não precisam ser seguidas). */
  goalWeeks: number;
  prs: number;
  /** Missões diárias cumpridas por completo. */
  dailies: number;
}

export type RankGate = Partial<RankFacts> & { level: number };

// shortcut: o design pede também "chefe de programa" no B e "≥ 80% das diárias em 1 ano" no S;
// aqui o S conta 292 diárias (80% de 365) e o chefe fica para quando houver dungeon de programa.
export const RANKS: readonly { id: RankId; gate: RankGate }[] = [
  { id: 'E', gate: { level: 1 } },
  { id: 'D', gate: { level: 10, goalWeeks: 4 } },
  { id: 'C', gate: { level: 20, prs: 3 } },
  { id: 'B', gate: { level: 35, goalWeeks: 12 } },
  { id: 'A', gate: { level: 50, goalWeeks: 26, prs: 10 } },
  { id: 'S', gate: { level: 70, dailies: 292 } },
];

const GATE_KEYS = ['level', 'goalWeeks', 'prs', 'dailies'] as const;

/** O que falta para passar no portão (vazio = passou). */
export function missingFor(gate: RankGate, f: RankFacts) {
  return GATE_KEYS.filter((k) => f[k] < (gate[k] ?? 0)).map((k) => ({
    key: k,
    have: f[k],
    need: gate[k]!,
  }));
}

/** Rank atual: os portões passam em ordem, sem pular. */
export function rankFor(f: RankFacts): RankId {
  let cur: RankId = 'E';
  for (const r of RANKS) {
    if (missingFor(r.gate, f).length) break;
    cur = r.id;
  }
  return cur;
}

export function nextRank(f: RankFacts) {
  const i = RANKS.findIndex((r) => r.id === rankFor(f));
  const next = RANKS[i + 1];
  return next && { id: next.id, missing: missingFor(next.gate, f) };
}
