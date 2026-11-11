import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import type { Session } from '@/models/session-models';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { planDiffAfterPersist } from './helpers';

const bp = (name: string, sets: number) =>
  SessionBlueprint.fromPOJO({
    name,
    notes: '',
    exercises: [
      {
        type: 'WeightedExerciseBlueprint' as const,
        name: 'Supino',
        sets,
        repsPerSet: 10,
        weightIncreaseOnSuccess: new BigNumber(0),
        restBetweenSets: {
          minRest: Duration.ofMinutes(1),
          maxRest: Duration.ofMinutes(2),
          failureRest: Duration.ofMinutes(3),
        },
        supersetWithNext: false,
        notes: '',
        link: '',
      },
    ],
  } as never);

const program = { sessions: [bp('A', 3)] } as unknown as ProgramBlueprint;
const session = (b: SessionBlueprint) => ({ blueprint: b }) as Session;

describe('planDiffAfterPersist (T5)', () => {
  it('treino que mudou o plano propõe o diff', () => {
    expect(
      planDiffAfterPersist('workoutSession', session(bp('A', 4)), program),
    ).toMatchObject({
      type: 'diff',
      sessionIndex: 0,
    });
    expect(
      planDiffAfterPersist('workoutSession', session(bp('Z', 1)), program),
    ).toMatchObject({
      type: 'add',
    });
  });

  it('treino igual ao plano não propõe nada', () => {
    expect(
      planDiffAfterPersist('workoutSession', session(bp('A', 3)), program),
    ).toBeUndefined();
  });

  it('editar o histórico ou o feed nunca abre o diálogo', () => {
    expect(
      planDiffAfterPersist('historySession', session(bp('A', 4)), program),
    ).toBeUndefined();
    expect(
      planDiffAfterPersist('feedSession', session(bp('Z', 1)), program),
    ).toBeUndefined();
  });
});
