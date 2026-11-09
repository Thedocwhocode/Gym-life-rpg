import { useAppSelector } from '@/store';
import { deriveAttributes, sessionFacts } from '@/store/rpg/derive';
import { selectSessions } from '@/store/stored-sessions';
import { LocalDate } from '@js-joda/core';
import { useMemo } from 'react';

export function useHeroAttributes() {
  const sessions = useAppSelector(selectSessions);
  return useMemo(
    () => deriveAttributes(sessions.map(sessionFacts), LocalDate.now()),
    [sessions],
  );
}

/** "+4" quando entrou algo na semana; nada caso contrário. */
export function weekDelta(week: number): string | undefined {
  return week > 0 ? `+${week}` : undefined;
}
