import { addEffect } from '@/store/store';
import { sessionRewarded } from './index';
import { deriveProgress, diffProjection, sessionFacts } from './derive';
import { addStoredSession, selectSessions } from '@/store/stored-sessions';
import { LocalDate } from '@js-joda/core';
import type { RootState } from '@/store/store';

const project = (state: RootState, today: LocalDate) =>
  deriveProgress(selectSessions(state).map(sessionFacts), today);

/**
 * Nada do RPG é gravado: a projeção sai das sessões. Aqui só se compara antes/depois de
 * uma sessão nova para abrir a tela de recompensa e o level up (restaurar backup usa
 * setStoredSessions e não passa por aqui).
 */
export function applyRpgEffects() {
  addEffect(
    addStoredSession,
    (action, { dispatch, originalState, stateAfterReduce }) => {
      const today = LocalDate.now();
      const isNew = !selectSessions(originalState).some(
        (s) => s.id === action.payload.id,
      );
      if (!isNew) return;
      dispatch(
        sessionRewarded({
          ...diffProjection(
            project(originalState, today),
            project(stateAfterReduce, today),
          ),
          sessionId: action.payload.id,
        }),
      );
    },
  );
}
