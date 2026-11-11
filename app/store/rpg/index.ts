import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalDate } from '@js-joda/core';
import { selectSessions } from '@/store/stored-sessions';
import {
  deriveProgress,
  ProjectionDiff,
  sessionFacts,
  titleForLevel,
  xpProgress,
} from '@/store/rpg/derive';

export {
  levelFromXp,
  titleForLevel,
  xpForLevel,
  xpProgress,
  type Quest,
} from '@/store/rpg/derive';
export type { RpgClass } from '@/store/choices';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    name: 'Primeira Missão',
    description: 'Complete seu primeiro treino',
    icon: 'star',
  },
  {
    id: 'consistency',
    name: 'Consistência',
    description: '3 treinos em uma semana',
    icon: 'localFireDepartment',
  },
  {
    id: 'five_streak',
    name: 'Semana Perfeita',
    description: 'Treine 5 dias seguidos',
    icon: 'bolt',
  },
  {
    id: 'ten_workouts',
    name: 'Veterano',
    description: 'Complete 10 treinos',
    icon: 'militaryTech',
  },
  {
    id: 'fifty_workouts',
    name: 'Guerreiro',
    description: 'Complete 50 treinos',
    icon: 'shield',
  },
  {
    id: 'hundred_workouts',
    name: 'Centurião',
    description: '100 treinos completos',
    icon: 'workspacePremium',
  },
  {
    id: 'heavy_lift',
    name: 'Força Bruta',
    description: 'Levante 100 em uma série',
    icon: 'fitnessCenter',
  },
  {
    id: 'level_5',
    name: 'Em Ascensão',
    description: 'Alcance o nível 5',
    icon: 'trendingUp',
  },
  {
    id: 'level_10',
    name: 'Veterano de Ferro',
    description: 'Alcance o nível 10',
    icon: 'diamond',
  },
];

/** Só estado de tela (nada é gravado): XP, nível, quests e conquistas vêm de `derive.ts`. */
export interface RpgState {
  pendingLevelUp: boolean;
  levelUpNewLevel?: number;
  lastSessionReward?: {
    xpGained: number;
    newAchievementIds: string[];
    /** SessÃ£o que gerou a recompensa (cartÃ£o E2). */
    sessionId?: string;
  };
}

const initialState: RpgState = { pendingLevelUp: false };

const rpgSlice = createSlice({
  name: 'rpg',
  initialState,
  reducers: {
    sessionRewarded(
      state,
      action: PayloadAction<ProjectionDiff & { sessionId?: string }>,
    ) {
      const { xpGained, newAchievementIds, newLevel, sessionId } =
        action.payload;
      state.lastSessionReward = {
        xpGained,
        newAchievementIds,
        ...(sessionId ? { sessionId } : {}),
      };
      if (newLevel !== undefined) {
        state.pendingLevelUp = true;
        state.levelUpNewLevel = newLevel;
      }
    },
    clearLevelUp(state) {
      state.pendingLevelUp = false;
      delete state.levelUpNewLevel;
    },
    clearSessionReward(state) {
      delete state.lastSessionReward;
    },
  },
});

export const { sessionRewarded, clearLevelUp, clearSessionReward } =
  rpgSlice.actions;

export const rpgReducer = rpgSlice.reducer;

// ponytail: LocalDate.now() no seletor só recalcula quando as sessões mudam; virar a meia-noite
// com o app aberto mantém a projeção de ontem até a próxima mudança (igual a useHeroAttributes).
export const selectProgress = createSelector([selectSessions], (sessions) =>
  deriveProgress(sessions.map(sessionFacts), LocalDate.now()),
);
export const selectRpgLevel = createSelector([selectProgress], (p) => p.level);
export const selectRpgTitle = createSelector([selectRpgLevel], titleForLevel);
export const selectXpProgress = createSelector([selectProgress], (p) =>
  xpProgress(p.xp),
);
export const selectAllAchievements = createSelector([selectProgress], (p) =>
  ACHIEVEMENTS.map((def) => ({ ...def, unlockedAt: p.achievements[def.id] })),
);
export const selectActiveQuests = createSelector(
  [selectProgress],
  (p) => p.quests,
);
