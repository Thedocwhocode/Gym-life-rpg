import { createSelector } from '@reduxjs/toolkit';
import { LocalDate } from '@js-joda/core';
import type { RootState } from '@/store/store';
import { selectSessions } from '@/store/stored-sessions';
import { selectChoices } from '@/store/choices';
import { selectProgress } from '@/store/rpg';
import { valueAt } from './rules/dated';
import { bestiaryState, type Encounter } from './rules/bestiary';
import { chronicleFor, showChronicle } from './rules/chronicle';
import { combatExercises, enemiesFor } from './rules/combat';
import { dungeonClears } from './rules/dungeon';
import { deriveEnergy, restRecommended } from './rules/energy';
import { equippedSkill } from './rules/skills';

/** Nomes dos treinos do plano ativo, em ordem (os nós da Masmorra). */
export const selectPlanWorkouts = createSelector(
  [(s: RootState) => s.program.savedPrograms[s.program.activeProgramId]],
  (p) => (p?.sessions ?? []).map((b) => b.name),
);

/**
 * Tudo que as telas da Jornada mostram, derivado das sessões + escolhas (nada gravado).
 * O "hoje" é o mesmo de `selectProgress` (state.app.today).
 */
export const selectJourney = createSelector(
  [
    selectSessions,
    selectChoices,
    selectProgress,
    selectPlanWorkouts,
    (s: RootState) => s.app.today,
  ],
  (sessions, choices, progress, workouts, todayStr) => {
    const today = LocalDate.parse(todayStr);
    const days = sessions.map((s) => s.date);
    const learnedAt = (d: LocalDate) =>
      new Set(
        (choices.skillsLearned ?? [])
          .filter((l) => l.since <= d.toString())
          .map((l) => l.value),
      );
    const skillAt = (d: LocalDate) =>
      equippedSkill(
        valueAt(choices.skillEquipped, d),
        valueAt(choices.classHistory, d),
        learnedAt(d),
      );
    const energy = deriveEnergy(days, today, (d) =>
      skillAt(d) === 'respiro' ? 1 : 0,
    );

    const encounters: Encounter[] = sessions.flatMap((s) =>
      enemiesFor(combatExercises(s), s.isFreeform).map((e) => ({
        monster: e.monster.id,
        defeated: e.defeated,
      })),
    );
    const clears = dungeonClears(
      sessions.map((s) => ({ date: s.date, workout: s.blueprint.name })),
      workouts,
    );
    const beasts = bestiaryState(encounters, clears.total);
    const learned = learnedAt(today);
    // ponytail: meta da semana passada aproximada pela meta atual (o tier raramente muda).
    const goal =
      progress.quests.find((q) => q.type === 'workouts_this_week')?.target ?? 3;
    const chronicle = chronicleFor({
      today,
      sessionDays: days,
      missionsByWeek: progress.missionsByWeek,
      xpByWeek: progress.xpByWeek,
      clearsByWeek: clears.byWeek,
      missed: progress.hearts.missed,
      learned: choices.skillsLearned,
      goal,
    });

    return {
      today,
      energy,
      restRecommended: restRecommended(energy),
      hearts: progress.hearts,
      statuses: progress.statuses,
      stats: { ...progress.stats, level: progress.level },
      rpgClass: choices.rpgClass,
      learned,
      equipped: skillAt(today),
      beasts: beasts.state,
      drops: beasts.drops,
      itemsEquipped: valueAt(choices.itemsEquipped, today) ?? [],
      clears,
      chronicle:
        chronicle && showChronicle(chronicle, today, choices.chronicleSeenWeek)
          ? chronicle
          : undefined,
      trainingDays: choices.trainingDays?.at(-1)?.value ?? [],
    };
  },
);

export type Journey = ReturnType<typeof selectJourney>;
