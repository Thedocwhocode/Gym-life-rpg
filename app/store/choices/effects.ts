import { addDebouncedEffect, addEffect } from '@/store/store';
import {
  acceptAiDataNotice,
  hydrateChoices,
  initializeChoicesStateSlice,
  setRpgClass,
} from './index';
import { CHOICES_KEY, loadChoices } from './migrate';

export function applyChoicesEffects() {
  addEffect(
    initializeChoicesStateSlice,
    async (_, { dispatch, extra: { keyValueStore, logger } }) => {
      try {
        dispatch(hydrateChoices(await loadChoices(keyValueStore)));
      } catch (e) {
        logger.error('Failed to load choices', e);
        dispatch(hydrateChoices({}));
      }
    },
  );

  addDebouncedEffect(
    [setRpgClass, acceptAiDataNotice],
    async (_, { getState, extra: { keyValueStore } }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isHydrated, ...choices } = getState().choices;
      if (!isHydrated) return;
      await keyValueStore.setItem(CHOICES_KEY, JSON.stringify(choices));
    },
    500,
  );
}
