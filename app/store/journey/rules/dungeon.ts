import { LocalDate } from '@js-joda/core';
import { weekKey } from '@/store/rpg/derive';

// DR22: os nós são os treinos do plano ativo; o último é o chefe de masmorra.
// Uma "masmorra limpa" = uma sessão do último treino do ciclo (plano com 2+ treinos; com um só,
// toda sessão viraria masmorra limpa).

export type NodeState = 'done' | 'current' | 'open' | 'boss';

export interface DungeonNode {
  name: string;
  state: NodeState;
  boss: boolean;
}

/** `next` = nome do próximo treino sugerido (o mesmo do card "Próxima missão"). */
export function dungeonNodes(
  workouts: readonly string[],
  next: string | undefined,
): DungeonNode[] {
  const cur = next === undefined ? -1 : workouts.indexOf(next);
  const last = workouts.length - 1;
  return workouts.map((name, i) => ({
    name,
    boss: i === last,
    state:
      i === cur
        ? 'current'
        : cur >= 0 && i < cur
          ? 'done'
          : i === last
            ? 'boss'
            : 'open',
  }));
}

/** Masmorras limpas por semana ISO, contando as sessões do último treino do plano. */
export function dungeonClears(
  sessions: readonly { date: LocalDate; workout: string }[],
  workouts: readonly string[],
): { total: number; byWeek: Record<string, number> } {
  const boss = workouts.at(-1);
  const byWeek: Record<string, number> = {};
  let total = 0;
  if (boss === undefined || workouts.length < 2) return { total, byWeek };
  for (const s of sessions) {
    if (s.workout !== boss) continue;
    total++;
    const k = weekKey(s.date);
    byWeek[k] = (byWeek[k] ?? 0) + 1;
  }
  return { total, byWeek };
}
