import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

export type RpgClass = 'warrior' | 'scout' | 'paladin';

/** Escolhas do jogador. Só isso é gravado do lado RPG; o resto é derivado das sessões. */
export interface Choices {
  rpgClass?: RpgClass;
  /** Aviso LGPD do Planejador IA / PDF aceito (aparece só antes do 1º envio). */
  aiDataNoticeAccepted?: boolean;
}

export interface ChoicesState extends Choices {
  isHydrated: boolean;
}

const initialState: ChoicesState = { isHydrated: false };

const choicesSlice = createSlice({
  name: 'choices',
  initialState,
  reducers: {
    hydrateChoices(_, action: PayloadAction<Choices>) {
      return { ...action.payload, isHydrated: true };
    },
    setRpgClass(state, action: PayloadAction<RpgClass>) {
      state.rpgClass = action.payload;
    },
    acceptAiDataNotice(state) {
      state.aiDataNoticeAccepted = true;
    },
    initializeChoicesStateSlice() {},
  },
});

export const {
  hydrateChoices,
  setRpgClass,
  acceptAiDataNotice,
  initializeChoicesStateSlice,
} = choicesSlice.actions;

export const choicesReducer = choicesSlice.reducer;

export const selectRpgClass = (state: RootState) => state.choices.rpgClass;
export const selectAiDataNoticeAccepted = (state: RootState) =>
  !!state.choices.aiDataNoticeAccepted;
