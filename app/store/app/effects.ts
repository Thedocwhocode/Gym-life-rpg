import {
  initializeAppStateSlice,
  refreshNotificationPermissionStatus,
  requestExactNotificationPermission,
  setCanScheduleExactNotifications,
  setCurrentSnackbar,
  setIsHydrated,
  setToday,
  shareString,
  showSnackbar,
} from '@/store/app';
import { addEffect } from '@/store/store';
import { sleep } from '@/utils/sleep';
import { LocalDate } from '@js-joda/core';
import { AppState } from 'react-native';

export function applyAppEffects() {
  addEffect(
    initializeAppStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { notificationService } },
    ) => {
      cancelActiveListeners();

      const canScheduleExactAlarm =
        await notificationService.canScheduleExactNotifications();
      dispatch(setCanScheduleExactNotifications(canScheduleExactAlarm));

      dispatch(setIsHydrated(true));
    },
  );

  // Virar o dia com o app em segundo plano: a projeção (corações, status, crônica) recalcula.
  addEffect(initializeAppStateSlice, (_, { dispatch, getState }) => {
    AppState.addEventListener('change', (s) => {
      const today = LocalDate.now().toString();
      if (s === 'active' && getState().app.today !== today)
        dispatch(setToday(today));
    });
  });

  addEffect(
    refreshNotificationPermissionStatus,
    async (_, { dispatch, extra: { notificationService } }) => {
      const result = await notificationService.canScheduleExactNotifications();
      dispatch(setCanScheduleExactNotifications(result));
    },
  );

  addEffect(
    requestExactNotificationPermission,
    async (action, { dispatch, extra: { notificationService } }) => {
      const result =
        await notificationService.requestScheduleExactNotificationPermission(
          action.payload,
        );
      dispatch(setCanScheduleExactNotifications(result));
    },
  );

  addEffect(showSnackbar, async (action, { dispatch, getState }) => {
    dispatch(setCurrentSnackbar(action.payload));
    await sleep(action.payload.duration ?? 4000);
    if (getState().app.currentSnackbar === action.payload) {
      dispatch(setCurrentSnackbar(undefined));
    }
  });

  addEffect(shareString, async (action, { extra: { stringSharer } }) => {
    await stringSharer.share(action.payload.value, action.payload.title);
  });
}
