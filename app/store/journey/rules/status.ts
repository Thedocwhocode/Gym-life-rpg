// Status do design-spec §D.2. Cada status é função do histórico ANTERIOR ao momento avaliado.

export type StatusId = 'exhausted' | 'cursed' | 'rusty' | 'rage' | 'momentum';

/** % de XP de cada status (DR11: a mesma tabela alimenta o XP e a Tag da tela). */
export const STATUS_XP: Record<StatusId, number> = {
  exhausted: -50,
  cursed: -25,
  rusty: -15,
  rage: 20,
  momentum: 10,
};

export const STATUS_FX = {
  exhausted: 'status/sleep',
  cursed: 'status/cursed',
  rusty: 'status/slowed',
  rage: 'status/rage',
  momentum: 'status/haste',
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
  if (ctx.exhausted) out.push('exhausted');
  if (ctx.weeksBelowGoal >= STATUS_RULES.cursedWeeks && !ctx.goalMetThisWeek)
    out.push('cursed');
  if ((ctx.daysSinceLast ?? 0) >= STATUS_RULES.rustyDays) out.push('rusty');
  if (ctx.prThisWeek) out.push('rage');
  if (ctx.streak >= STATUS_RULES.hasteStreak) out.push('momentum');
  return out;
}

export const isDebuff = (s: StatusId) => STATUS_XP[s] < 0;
