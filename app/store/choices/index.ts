import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalDate } from '@js-joda/core';
import { RootState } from '@/store/store';
import { choose, type Dated } from '@/store/journey/rules/dated';
import { equipItem as withItem } from '@/store/journey/rules/items';
import {
  dailyHistory,
  withDailyCount,
  type DailyEntry,
  type DailyItem,
} from '@/store/journey/rules/daily';
import { withStudyMinutes, type StudyEntry } from '@/store/journey/rules/study';
import { withWeather, type WeatherEntry } from '@/store/journey/rules/weather';
import type { WeatherKind } from '@/services/weather';
import { heroLook, heroName, type HeroLook } from './hero';

export type RpgClass = 'warrior' | 'scout' | 'paladin';

/**
 * Escolhas do jogador. Só isso é gravado do lado RPG; o resto é derivado das sessões.
 * Listas `Dated` (§3.7): a projeção usa a escolha vigente no dia de cada sessão.
 */
export interface Choices {
  /** Classe atual (espelho do último item de `classHistory`). */
  rpgClass?: RpgClass;
  classHistory?: Dated<RpgClass>[];
  /** Dias da semana ISO (1 = seg … 7 = dom) em que o herói planeja treinar (D4). */
  trainingDays?: Dated<number[]>[];
  skillEquipped?: Dated<string>[];
  itemsEquipped?: Dated<string[]>[];
  /** Skills aprendidas, com o dia em que foram aprendidas (crônica E4). */
  skillsLearned?: Dated<string>[];
  /** DR11: dia a partir do qual multiplicadores, status e streak protegido valem. */
  multiplicadoresDesde?: string;
  /** DR8: dia a partir do qual os corações contam. */
  coracoesDesde?: string;
  /** Quantos dias perdidos (`hearts.missed`) o herói já viu avisados (DR8). */
  heartsSeenMissed?: number;
  /** Semana ISO em que a crônica E4 já foi vista. */
  chronicleSeenWeek?: string;
  /** DR9: card de boas-vindas da jornada recalculada já visto. */
  journeyIntroSeen?: boolean;
  /** Missão diária do Sistema: o que foi feito em cada dia (journey/rules/daily.ts). */
  dailyLog?: DailyEntry[];
  /** Minutos de foco do pomodoro por dia: viram INT (journey/rules/study.ts). */
  studyLog?: StudyEntry[];
  /** Clima de cada dia (o primeiro lido): modificador de XP daquele dia (journey/rules/weather.ts). */
  weatherLog?: WeatherEntry[];
  /** Nome que o Sistema usa (onboarding); só local, não vai para o feed. */
  heroName?: string;
  /** Pele e cabelo do sprite (onboarding). */
  heroLook?: HeroLook;
}

export interface ChoicesState extends Choices {
  isHydrated: boolean;
}

const initialState: ChoicesState = { isHydrated: false };

// ponytail: o dia sai do relógio no prepare (a action leva a data, o reducer segue puro).
const today = () => LocalDate.now().toString();
const dated = <T>(value: T) => ({ payload: { value, since: today() } });
type DatedAction<T> = PayloadAction<{ value: T; since: string }>;

const choicesSlice = createSlice({
  name: 'choices',
  initialState,
  reducers: {
    hydrateChoices(_, action: PayloadAction<Choices>) {
      return { ...action.payload, isHydrated: true };
    },
    /** Restore de backup: troca tudo e grava (hydrate só carrega do disco). */
    restoreChoices(_, action: PayloadAction<Choices>) {
      return { ...action.payload, isHydrated: true };
    },
    setRpgClass: {
      reducer(state, { payload }: DatedAction<RpgClass>) {
        state.rpgClass = payload.value;
        state.classHistory = choose(
          state.classHistory,
          payload.since,
          payload.value,
        );
      },
      prepare: (cls: RpgClass) => dated(cls),
    },
    setTrainingDays: {
      reducer(state, { payload }: DatedAction<number[]>) {
        state.trainingDays = choose(
          state.trainingDays,
          payload.since,
          [...new Set(payload.value)]
            .filter((d) => d >= 1 && d <= 7)
            .sort((a, b) => a - b),
        );
      },
      prepare: (days: number[]) => dated(days),
    },
    equipSkill: {
      reducer(state, { payload }: DatedAction<string>) {
        state.skillEquipped = choose(
          state.skillEquipped,
          payload.since,
          payload.value,
        );
      },
      prepare: (id: string) => dated(id),
    },
    learnSkill: {
      reducer(state, { payload }: DatedAction<string>) {
        if (state.skillsLearned?.some((s) => s.value === payload.value)) return;
        state.skillsLearned = [
          ...(state.skillsLearned ?? []),
          { since: payload.since, value: payload.value },
        ];
      },
      prepare: (id: string) => dated(id),
    },
    equipItem: {
      reducer(state, { payload }: DatedAction<string>) {
        const cur = state.itemsEquipped?.at(-1)?.value ?? [];
        state.itemsEquipped = choose(
          state.itemsEquipped,
          payload.since,
          withItem(cur, payload.value),
        );
      },
      prepare: (id: string) => dated(id),
    },
    unequipItem: {
      reducer(state, { payload }: DatedAction<string>) {
        const cur = state.itemsEquipped?.at(-1)?.value ?? [];
        state.itemsEquipped = choose(
          state.itemsEquipped,
          payload.since,
          cur.filter((i) => i !== payload.value),
        );
      },
      prepare: (id: string) => dated(id),
    },
    markHeartsSeen(state, action: PayloadAction<number>) {
      state.heartsSeenMissed = action.payload;
    },
    markChronicleSeen(state, action: PayloadAction<string>) {
      state.chronicleSeenWeek = action.payload;
    },
    markJourneyIntroSeen(state) {
      state.journeyIntroSeen = true;
    },
    /** Contador da missão diária; `recovery` grava na Quest de Recuperação do dia. */
    setDailyCount(
      state,
      {
        payload,
      }: PayloadAction<{
        date: string;
        item: DailyItem;
        value: number;
        recovery?: boolean;
      }>,
    ) {
      state.dailyLog = withDailyCount(
        state.dailyLog ?? [],
        payload.date,
        payload.item,
        payload.value,
        payload.recovery,
      );
    },
    /** Bloco de foco concluído no pomodoro de estudo. */
    addStudyMinutes(
      state,
      { payload }: PayloadAction<{ date: string; minutes: number }>,
    ) {
      state.studyLog = withStudyMinutes(
        state.studyLog ?? [],
        payload.date,
        payload.minutes,
      );
    },
    /** Clima lido no banner; o primeiro do dia vale para o XP do dia. */
    recordWeather(
      state,
      { payload }: PayloadAction<{ date: string; kind: WeatherKind }>,
    ) {
      if (state.weatherLog?.some((e) => e.date === payload.date)) return;
      state.weatherLog = withWeather(
        state.weatherLog ?? [],
        payload.date,
        payload.kind,
      );
    },
    /** Nome inválido (vazio, só espaços, > 16) é ignorado: quem chama valida antes. */
    setHeroName(state, { payload }: PayloadAction<string>) {
      const name = heroName(payload);
      if (name) state.heroName = name;
    },
    setHeroLook(state, { payload }: PayloadAction<HeroLook>) {
      const look = heroLook(payload);
      if (look) state.heroLook = look;
    },
    initializeChoicesStateSlice() {},
  },
});

export const {
  hydrateChoices,
  restoreChoices,
  setRpgClass,
  setTrainingDays,
  equipSkill,
  learnSkill,
  equipItem,
  unequipItem,
  markHeartsSeen,
  markChronicleSeen,
  markJourneyIntroSeen,
  setDailyCount,
  addStudyMinutes,
  recordWeather,
  setHeroName,
  setHeroLook,
  initializeChoicesStateSlice,
} = choicesSlice.actions;

/** Actions que mudam o que é gravado (o effect de debounce escuta todas). */
export const PERSISTED_CHOICE_ACTIONS = [
  restoreChoices,
  setRpgClass,
  setTrainingDays,
  equipSkill,
  learnSkill,
  equipItem,
  unequipItem,
  markHeartsSeen,
  markChronicleSeen,
  markJourneyIntroSeen,
  setDailyCount,
  addStudyMinutes,
  recordWeather,
  setHeroName,
  setHeroLook,
] as const;

export const choicesReducer = choicesSlice.reducer;

export const selectChoices = (state: RootState) => state.choices;
export const selectRpgClass = (state: RootState) => state.choices.rpgClass;
export const selectHeroName = (state: RootState) => state.choices.heroName;
export const selectHeroLook = (state: RootState) => state.choices.heroLook;
export const selectDailyLog = (state: RootState) => state.choices.dailyLog;
export const selectStudyLog = (state: RootState) => state.choices.studyLog;
export const selectWeatherLog = (state: RootState) => state.choices.weatherLog;
export const selectDailyHistory = createSelector([selectDailyLog], (log) =>
  dailyHistory(log ?? []),
);

const parseDay = (s: string | undefined) =>
  s ? LocalDate.parse(s) : undefined;

/** O que a projeção (`deriveProgress`) precisa das escolhas. */
export const selectJourneyContext = createSelector(
  [selectChoices, selectDailyHistory],
  (c, daily) => ({
    classHistory: c.classHistory,
    skillEquipped: c.skillEquipped,
    skillsLearned: c.skillsLearned,
    itemsEquipped: c.itemsEquipped,
    trainingDays: c.trainingDays,
    multipliersSince: parseDay(c.multiplicadoresDesde),
    heartsSince: parseDay(c.coracoesDesde),
    dailyCompleted: daily.completed,
    weatherLog: c.weatherLog,
  }),
);
