import {
  createAction,
  createSlice,
  PayloadAction,
  UnknownAction,
} from '@reduxjs/toolkit';
import { LocalDate } from '@js-joda/core';

const initialState: AppState = {
  isHydrated: false,
  canScheduleExactNotifications: false,
  currentSnackbar: undefined,
  today: LocalDate.now().toString(),
};

export type AppState = {
  isHydrated: boolean;
  canScheduleExactNotifications: boolean;
  currentSnackbar: SnackbarDescriptor | undefined;
  /** Dia local (YYYY-MM-DD) da projeção; atualizado quando o app volta ao primeiro plano. */
  today: string;
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setCanScheduleExactNotifications(state, action: PayloadAction<boolean>) {
      state.canScheduleExactNotifications = action.payload;
    },

    setToday(state, action: PayloadAction<string>) {
      state.today = action.payload;
    },

    setCurrentSnackbar(
      state,
      action: PayloadAction<SnackbarDescriptor | undefined>,
    ) {
      state.currentSnackbar = action.payload;
    },
  },
});

export const requestExactNotificationPermission = createAction<
  boolean | undefined
>('requestExactNotificationPermission');

export const refreshNotificationPermissionStatus = createAction(
  'refreshNotificationPermissionStatus',
);

export const initializeAppStateSlice = createAction('initializeAppStateSlice');

export const shareString = createAction<{ title: string; value: string }>(
  'shareString',
);

export type SnackbarDescriptor = {
  /** Tom do toast: erro usa danger-wash; o padrão é neutro/sucesso. */
  tone?: 'success' | 'error';
} & (
  | {
      text: string;
      action?: undefined;
      dispatchAction?: undefined;
    }
  | {
      text: string;
      action: string;
      dispatchAction: UnknownAction | UnknownAction[];
    }
);
export const showSnackbar = createAction<
  SnackbarDescriptor & { duration?: number }
>('snackBarWithAction');

export const {
  setIsHydrated,
  setCanScheduleExactNotifications,
  setCurrentSnackbar,
  setToday,
} = appSlice.actions;

export default appSlice.reducer;
