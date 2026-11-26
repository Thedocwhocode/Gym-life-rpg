import { useAppSelector } from '@/store';
import { selectDailyHistory } from '@/store/choices';
import { DAILY_REWARD } from '@/store/journey/rules/daily';
import { deriveAttributes, sessionFacts } from '@/store/rpg/derive';
import { selectExercises, selectSessions } from '@/store/stored-sessions';
import { LocalDate } from '@js-joda/core';
import { useMemo } from 'react';

export function useHeroAttributes() {
  const sessions = useAppSelector(selectSessions);
  const exercises = useAppSelector(selectExercises);
  const daily = useAppSelector(selectDailyHistory);
  return useMemo(() => {
    // Músculos e categoria vêm da biblioteca do usuário, casada pelo nome do exercício.
    const byName = new Map(
      Object.values(exercises).map((e) => [e.name.toLowerCase(), e]),
    );
    const traits = (name: string) => byName.get(name.toLowerCase());
    // Missão diária cumprida (ou salva pela recuperação): +1 VIT no dia.
    const dailies = [...daily.completed, ...daily.recovered].map((d) => ({
      date: LocalDate.parse(d),
      sets: 0,
      minutes: 0,
      exercises: [],
      attrXp: { VIT: DAILY_REWARD.vit },
    }));
    return deriveAttributes(
      [...sessions.map((s) => sessionFacts(s, traits)), ...dailies],
      LocalDate.now(),
    );
  }, [sessions, exercises, daily]);
}

/** "+4" quando entrou algo na semana; nada caso contrário. */
export function weekDelta(week: number): string | undefined {
  return week > 0 ? `+${week}` : undefined;
}
