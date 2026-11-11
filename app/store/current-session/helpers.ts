import { WeightedExerciseBlueprintPOJO } from '@/models/blueprint-models';
import { RecordedSetPOJO } from '@/models/session-models';
import { OffsetDateTime } from '@js-joda/core';
import { match } from 'ts-pattern';
import { diffSessionBlueprints, type PlanDiff } from '@/models/blueprint-diff';
import type { ProgramBlueprint } from '@/models/blueprint-models';
import { EmptySession, type Session } from '@/models/session-models';
import type { SessionTarget } from '@/store/current-session';

/**
 * Proposta de mudar o plano depois de salvar uma sessão (T5): só ao terminar um treino.
 * Editar o histórico ou uma sessão do feed não abre o diálogo.
 */
export function planDiffAfterPersist(
  target: SessionTarget,
  session: Session,
  program: ProgramBlueprint,
): PlanDiff | undefined {
  if (target !== 'workoutSession') return undefined;
  if (program.sessions.some((x) => x.equals(session.blueprint)))
    return undefined;
  const sameName = program.sessions.find(
    (x) => x.name === session.blueprint.name,
  );
  return sameName
    ? {
        type: 'diff',
        diff: diffSessionBlueprints(sameName, session.blueprint),
        sessionIndex: program.sessions.indexOf(sameName),
      }
    : {
        type: 'add',
        diff: diffSessionBlueprints(EmptySession.blueprint, session.blueprint),
      };
}

export function getCycledRepCount(
  recordedSet: RecordedSetPOJO | undefined,
  exerciseBlueprint: WeightedExerciseBlueprintPOJO,
  time: OffsetDateTime,
): RecordedSetPOJO | undefined {
  return match(recordedSet)
    .returnType<RecordedSetPOJO | undefined>()
    .with(undefined, () => ({
      type: 'RecordedSet',
      completionDateTime: time,
      repsCompleted: exerciseBlueprint.repsPerSet,
    }))
    .with({ repsCompleted: 0 }, () => undefined)
    .otherwise((x) => ({
      ...x,
      repsCompleted: x.repsCompleted - 1,
    }));
}

/** DR9: editar uma sessão do histórico que baixa o nível pede o Toast (sem overlay de level down). */
export function levelDropAfterPersist(
  target: SessionTarget,
  levelBefore: number,
  levelAfter: number,
): number | undefined {
  return target === 'historySession' && levelAfter < levelBefore
    ? levelAfter
    : undefined;
}
