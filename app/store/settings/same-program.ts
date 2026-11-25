import type {
  ProgramBlueprintPOJO,
  SessionBlueprint,
} from '@/models/blueprint-models';

// Backup antigo sem programa ativo: reaproveita o programa igual já restaurado, senão cada restauração duplica.
export function findProgramWithSessions(
  saved: Readonly<Record<string, ProgramBlueprintPOJO>>,
  sessions: readonly SessionBlueprint[],
): string | undefined {
  if (!sessions.length) {
    return undefined;
  }
  return Object.entries(saved).find(
    ([, p]) =>
      p.sessions.length === sessions.length &&
      sessions.every((b, i) => b.equals(p.sessions[i])),
  )?.[0];
}
