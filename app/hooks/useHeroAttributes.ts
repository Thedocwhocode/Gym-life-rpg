import { useAppSelector } from '@/store';
import {
  selectDailyHistory,
  selectStudyLog,
  selectWeatherLog,
} from '@/store/choices';
import { DAILY_REWARD } from '@/store/journey/rules/daily';
import { studyFacts } from '@/store/journey/rules/study';
import { weatherOn, withWeatherAttrs } from '@/store/journey/rules/weather';
import { deriveAttributes, sessionFacts } from '@/store/rpg/derive';
import { selectExercises, selectSessions } from '@/store/stored-sessions';
import { LocalDate } from '@js-joda/core';
import { useMemo } from 'react';

export function useHeroAttributes() {
  const sessions = useAppSelector(selectSessions);
  const exercises = useAppSelector(selectExercises);
  const daily = useAppSelector(selectDailyHistory);
  const study = useAppSelector(selectStudyLog);
  const weather = useAppSelector(selectWeatherLog);
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
      [
        // Neve dá END, ventania dá AGI no dia em que caiu.
        ...sessions.map((s) => {
          const f = sessionFacts(s, traits);
          const kind = weatherOn(weather, f.date.toString());
          return f.attrXp && kind
            ? { ...f, attrXp: withWeatherAttrs(f.attrXp, kind) }
            : f;
        }),
        ...dailies,
        // INT: minutos de foco do pomodoro de estudo.
        ...studyFacts(study ?? []),
      ],
      LocalDate.now(),
    );
  }, [sessions, exercises, daily, study, weather]);
}

/** "+4" quando entrou algo na semana; nada caso contrário. */
export function weekDelta(week: number): string | undefined {
  return week > 0 ? `+${week}` : undefined;
}
