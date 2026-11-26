import { useAppSelector } from '@/store';
import { deriveAttributes, sessionFacts } from '@/store/rpg/derive';
import { selectExercises, selectSessions } from '@/store/stored-sessions';
import { LocalDate } from '@js-joda/core';
import { useMemo } from 'react';

export function useHeroAttributes() {
  const sessions = useAppSelector(selectSessions);
  const exercises = useAppSelector(selectExercises);
  return useMemo(() => {
    // Músculos e categoria vêm da biblioteca do usuário, casada pelo nome do exercício.
    const byName = new Map(
      Object.values(exercises).map((e) => [e.name.toLowerCase(), e]),
    );
    const traits = (name: string) => byName.get(name.toLowerCase());
    return deriveAttributes(
      sessions.map((s) => sessionFacts(s, traits)),
      LocalDate.now(),
    );
  }, [sessions, exercises]);
}

/** "+4" quando entrou algo na semana; nada caso contrário. */
export function weekDelta(week: number): string | undefined {
  return week > 0 ? `+${week}` : undefined;
}
