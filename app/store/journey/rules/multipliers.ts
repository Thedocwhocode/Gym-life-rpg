import type { RpgClass } from '@/store/choices';
import { ITEMS } from './items';
import { SKILLS } from './skills';
import { STATUS_XP, StatusId } from './status';

// DR11: classe + skill + itens + status, SOMADOS, com teto de +50% e piso de −50%.
// Bônus "de força" vale para a sessão inteira quando ela tem ao menos 1 série com peso;
// bônus "de cardio" vale quando ela tem ao menos 1 cardio concluído.

export type BonusKind = 'strength' | 'cardio';
export interface Bonus {
  kind: BonusKind;
  pct: number;
}

export const CLASS_BONUS: Record<RpgClass, Bonus | undefined> = {
  warrior: { kind: 'strength', pct: 10 },
  scout: { kind: 'cardio', pct: 15 },
  paladin: undefined, // streak protegido 1×/semana (derive.ts), não é %
};

export const XP_CAP = { min: -50, max: 50 } as const;

export interface XpSource {
  source: 'class' | 'skill' | 'item' | 'status';
  id: string;
  pct: number;
}

export interface MultiplierInput {
  sets: number;
  cardio: number;
  rpgClass: RpgClass | undefined;
  skill: string | undefined;
  items: readonly string[];
  statuses: readonly StatusId[];
}

const applies = (b: Bonus | undefined, i: MultiplierInput) =>
  !!b && (b.kind === 'strength' ? i.sets > 0 : i.cardio > 0);

/** Fontes que valem para esta sessão, na ordem em que a tela mostra. */
export function xpSources(i: MultiplierInput): XpSource[] {
  const out: XpSource[] = [];
  const cls = i.rpgClass && CLASS_BONUS[i.rpgClass];
  if (cls && applies(cls, i))
    out.push({ source: 'class', id: i.rpgClass!, pct: cls.pct });
  const skill = SKILLS.find((s) => s.id === i.skill)?.bonus;
  if (skill && applies(skill, i))
    out.push({ source: 'skill', id: i.skill!, pct: skill.pct });
  for (const id of i.items) {
    const b = ITEMS.find((x) => x.id === id)?.bonus;
    if (b && applies(b, i)) out.push({ source: 'item', id, pct: b.pct });
  }
  for (const s of i.statuses)
    out.push({ source: 'status', id: s, pct: STATUS_XP[s] });
  return out;
}

export function totalPct(sources: readonly XpSource[]): number {
  const sum = sources.reduce((n, s) => n + s.pct, 0);
  return Math.max(XP_CAP.min, Math.min(XP_CAP.max, sum));
}

export const withPct = (base: number, pct: number) =>
  Math.round((base * (100 + pct)) / 100);
