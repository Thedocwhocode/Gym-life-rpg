import type { RpgClass } from '@/store/choices';
import type { FxId } from '@/components/presentation/fx/registry';
import type { Bonus } from './multipliers';

// Catálogo do design-spec §D.4. D6: destrava, aprende, equipa e troca o golpe animado.
// Efeito numérico só onde a projeção implementa (`bonus`, `streakShield`, `restBoost`);
// o resto mostra o efeito com "em breve" (DR11: nada decorativo).

export type School = 'aco' | 'vento' | 'luz' | 'arcano';

export type Req =
  | { kind: 'class'; cls: RpgClass }
  | { kind: 'missions' | 'weekSets' | 'level' | 'streak'; n: number }
  | { kind: 'sessionCardioMin' | 'weekCardioMin' | 'weekKm'; n: number }
  | { kind: 'goalWeeks' | 'weeks3x'; n: number }
  | { kind: 'deadliftPr' | 'comeback' }
  /** Depende de dado que o app ainda não registra (peso corporal, pomodoro). */
  | { kind: 'soon' };

export interface Skill {
  id: string;
  school: School;
  tier: 1 | 2 | 3 | 4;
  fx: FxId;
  req: Req;
  bonus?: Bonus;
  /** Égide: protege o streak 1×/semana. */
  streakShield?: boolean;
  /** Respiro: dia de descanso devolve +1 de Energia. */
  restBoost?: boolean;
}

export const SKILLS: readonly Skill[] = [
  {
    id: 'corte',
    school: 'aco',
    tier: 1,
    fx: 'melee/sword-slash',
    req: { kind: 'class', cls: 'warrior' },
    bonus: { kind: 'strength', pct: 10 },
  },
  {
    id: 'cruzado',
    school: 'aco',
    tier: 2,
    fx: 'melee/double-slash',
    req: { kind: 'missions', n: 10 },
  },
  {
    id: 'talho',
    school: 'aco',
    tier: 2,
    fx: 'melee/heavy-cleave',
    req: { kind: 'weekSets', n: 20 },
  },
  {
    id: 'martelo',
    school: 'aco',
    tier: 3,
    fx: 'melee/hammer-smash',
    req: { kind: 'deadliftPr' },
  },
  {
    id: 'colosso',
    school: 'aco',
    tier: 3,
    fx: 'moves/ground-pound',
    req: { kind: 'soon' },
  },
  {
    id: 'combo',
    school: 'aco',
    tier: 4,
    fx: 'moves/sword-combo',
    req: { kind: 'level', n: 10 },
  },
  {
    id: 'estocada',
    school: 'vento',
    tier: 1,
    fx: 'melee/thrust',
    req: { kind: 'class', cls: 'scout' },
    bonus: { kind: 'cardio', pct: 15 },
  },
  {
    id: 'adagas',
    school: 'vento',
    tier: 2,
    fx: 'melee/dagger-flurry',
    req: { kind: 'sessionCardioMin', n: 30 },
  },
  {
    id: 'giro',
    school: 'vento',
    tier: 2,
    fx: 'melee/spin-slash',
    req: { kind: 'streak', n: 7 },
  },
  {
    id: 'investida',
    school: 'vento',
    tier: 3,
    fx: 'moves/dash-strike',
    req: { kind: 'weekKm', n: 5 },
  },
  {
    id: 'flecha',
    school: 'vento',
    tier: 4,
    fx: 'moves/arrow-shot',
    req: { kind: 'weekCardioMin', n: 100 },
  },
  {
    id: 'respiro',
    school: 'luz',
    tier: 1,
    fx: 'holy/heal',
    req: { kind: 'class', cls: 'paladin' },
    restBoost: true,
  },
  {
    id: 'egide',
    school: 'luz',
    tier: 2,
    fx: 'holy/divine-shield',
    req: { kind: 'goalWeeks', n: 4 },
    streakShield: true,
  },
  {
    id: 'bencao',
    school: 'luz',
    tier: 2,
    fx: 'holy/blessing',
    req: { kind: 'weeks3x', n: 4 },
  },
  {
    id: 'smite',
    school: 'luz',
    tier: 3,
    fx: 'moves/holy-smite',
    req: { kind: 'missions', n: 50 },
  },
  {
    id: 'retorno',
    school: 'luz',
    tier: 4,
    fx: 'holy/resurrection',
    req: { kind: 'comeback' },
  },
  {
    id: 'foco',
    school: 'arcano',
    tier: 1,
    fx: 'arcane/spell-charge',
    req: { kind: 'soon' },
  },
  {
    id: 'misseis',
    school: 'arcano',
    tier: 2,
    fx: 'arcane/arcane-missiles',
    req: { kind: 'soon' },
  },
  {
    id: 'circulo',
    school: 'arcano',
    tier: 3,
    fx: 'arcane/magic-circle-cast',
    req: { kind: 'soon' },
  },
  {
    id: 'tempo',
    school: 'arcano',
    tier: 4,
    fx: 'arcane/time-stop',
    req: { kind: 'soon' },
  },
];

export const SCHOOLS: readonly School[] = ['aco', 'vento', 'luz', 'arcano'];

export const STARTER: Record<RpgClass, string> = {
  warrior: 'corte',
  scout: 'estocada',
  paladin: 'respiro',
};

/** Efeito que a projeção aplica de fato; os outros aparecem como "em breve". */
export const hasEffect = (s: Skill) =>
  !!s.bonus || !!s.streakShield || !!s.restBoost;

/** Máximos do histórico que os requisitos olham (saem do fold de derive.ts). */
export interface SkillStats {
  missions: number;
  level: number;
  maxStreak: number;
  maxWeekSets: number;
  maxSessionCardioMin: number;
  maxWeekCardioMin: number;
  maxWeekKm: number;
  maxGoalWeeks: number;
  maxWeeks3x: number;
  deadliftPr: boolean;
  comeback: boolean;
}

export const EMPTY_STATS: SkillStats = {
  missions: 0,
  level: 1,
  maxStreak: 0,
  maxWeekSets: 0,
  maxSessionCardioMin: 0,
  maxWeekCardioMin: 0,
  maxWeekKm: 0,
  maxGoalWeeks: 0,
  maxWeeks3x: 0,
  deadliftPr: false,
  comeback: false,
};

const STAT: Record<string, keyof SkillStats> = {
  missions: 'missions',
  level: 'level',
  streak: 'maxStreak',
  weekSets: 'maxWeekSets',
  sessionCardioMin: 'maxSessionCardioMin',
  weekCardioMin: 'maxWeekCardioMin',
  weekKm: 'maxWeekKm',
  goalWeeks: 'maxGoalWeeks',
  weeks3x: 'maxWeeks3x',
};

/** Progresso do requisito: valor atual, alvo e fração 0..1. */
export function reqProgress(
  req: Req,
  stats: SkillStats,
  rpgClass: RpgClass | undefined,
): { value: number; target: number; ratio: number } {
  const of = (value: number, target: number) => ({
    value: Math.min(value, target),
    target,
    ratio: Math.min(1, target ? value / target : 0),
  });
  switch (req.kind) {
    case 'class':
      return of(rpgClass === req.cls ? 1 : 0, 1);
    case 'deadliftPr':
    case 'comeback':
      return of(stats[req.kind] ? 1 : 0, 1);
    case 'soon':
      return of(0, 1);
    default:
      return of(Number(stats[STAT[req.kind]]), req.n);
  }
}

export type SkillState = 'locked' | 'available' | 'learned' | 'equipped';

export function skillState(
  skill: Skill,
  ctx: {
    stats: SkillStats;
    rpgClass: RpgClass | undefined;
    learned: ReadonlySet<string>;
    equipped: string | undefined;
  },
): SkillState {
  const starter = ctx.rpgClass && STARTER[ctx.rpgClass] === skill.id;
  if (ctx.equipped === skill.id && (starter || ctx.learned.has(skill.id)))
    return 'equipped';
  if (starter || ctx.learned.has(skill.id)) return 'learned';
  if (skill.req.kind === 'class') return 'locked';
  return reqProgress(skill.req, ctx.stats, ctx.rpgClass).ratio >= 1
    ? 'available'
    : 'locked';
}

/** Skill equipada no dia: a escolha datada, ou a inicial da classe. */
export function equippedSkill(
  chosen: string | undefined,
  rpgClass: RpgClass | undefined,
): string | undefined {
  return chosen ?? (rpgClass ? STARTER[rpgClass] : undefined);
}
