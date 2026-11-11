// Status do design-spec §D.2. Cada status é função do histórico ANTERIOR ao momento avaliado.

export type StatusId = 'exausto' | 'amaldicoado' | 'lento' | 'furia' | 'pressa';

/** % de XP de cada status (DR11: a mesma tabela alimenta o XP e a Tag da tela). */
export const STATUS_XP: Record<StatusId, number> = {
  exausto: -50,
  amaldicoado: -25,
  lento: -15,
  furia: 20,
  pressa: 10,
};

export const STATUS_FX = {
  exausto: 'status/sleep',
  amaldicoado: 'status/cursed',
  lento: 'status/slowed',
  furia: 'status/rage',
  pressa: 'status/haste',
} as const;

export const STATUS_RULES = {
  /** Enferrujado: dias sem treinar. */
  rustyDays: 7,
  /** Amaldiçoado: semanas seguidas abaixo da meta. */
  cursedWeeks: 2,
  /** Embalo: streak mínimo. */
  hasteStreak: 5,
} as const;

export interface StatusContext {
  exhausted: boolean;
  /** Dias desde a última missão (undefined = nunca treinou). */
  daysSinceLast: number | undefined;
  prThisWeek: boolean;
  streak: number;
  /** Semanas completas seguidas, logo antes da atual, abaixo da meta de missões. */
  weeksBelowGoal: number;
  /** A semana atual já bateu a meta (cura o Amaldiçoado). */
  goalMetThisWeek: boolean;
}

/** Debuffs primeiro, do mais grave ao mais leve; depois os buffs. */
export function activeStatuses(ctx: StatusContext): StatusId[] {
  const out: StatusId[] = [];
  if (ctx.exhausted) out.push('exausto');
  if (ctx.weeksBelowGoal >= STATUS_RULES.cursedWeeks && !ctx.goalMetThisWeek)
    out.push('amaldicoado');
  if ((ctx.daysSinceLast ?? 0) >= STATUS_RULES.rustyDays) out.push('lento');
  if (ctx.prThisWeek) out.push('furia');
  if (ctx.streak >= STATUS_RULES.hasteStreak) out.push('pressa');
  return out;
}

export const isDebuff = (s: StatusId) => STATUS_XP[s] < 0;
