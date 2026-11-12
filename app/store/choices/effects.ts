import { addDebouncedEffect, addEffect } from '@/store/store';
import { LocalDate } from '@js-joda/core';
import {
  hydrateChoices,
  initializeChoicesStateSlice,
  PERSISTED_CHOICE_ACTIONS,
} from './index';
import { CHOICES_KEY, loadChoices } from './migrate';

export function applyChoicesEffects() {
  addEffect(
    initializeChoicesStateSlice,
    async (_, { dispatch, extra: { keyValueStore, logger } }) => {
      try {
        dispatch(
          hydrateChoices(
            await loadChoices(keyValueStore, LocalDate.now().toString()),
          ),
        );
      } catch (e) {
        logger.error('Failed to load choices', e);
        dispatch(hydrateChoices({}));
      }
    },
  );

  addDebouncedEffect(
    [...PERSISTED_CHOICE_ACTIONS],
    async (_, { getState, extra: { keyValueStore } }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isHydrated, ...choices } = getState().choices;
      if (!isHydrated) return;
      await keyValueStore.setItem(CHOICES_KEY, JSON.stringify(choices));
    },
    500,
  );
}
