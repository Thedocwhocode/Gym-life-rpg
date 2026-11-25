import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import { SessionBlueprint } from '@/models/blueprint-models';
import { defaultSessionBlueprint } from '@/models/test-data';
import { findProgramWithSessions } from '@/store/settings/same-program';

const program = (sessions = [defaultSessionBlueprint]) => ({
  type: 'ProgramBlueprint' as const,
  name: 'Meu programa',
  sessions: sessions.map((s) => s.toPOJO()),
  lastEdited: LocalDate.now(),
});

describe('restaurar backup sem programa ativo', () => {
  it('reaproveita o programa já restaurado com as mesmas sessões', () => {
    expect(
      findProgramWithSessions({ a: program() }, [defaultSessionBlueprint]),
    ).toBe('a');
  });

  it('sessões diferentes ou lista vazia criam programa novo', () => {
    const other = SessionBlueprint.fromPOJO({
      ...defaultSessionBlueprint.toPOJO(),
      name: 'Outro treino',
    });
    expect(findProgramWithSessions({ a: program() }, [other])).toBeUndefined();
    expect(findProgramWithSessions({ a: program([]) }, [])).toBeUndefined();
  });
});
