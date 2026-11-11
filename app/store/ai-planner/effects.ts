import {
  addMessage,
  ChatMessage,
  initChat,
  initializeAiPlannerStateSlice,
  restartChat,
  retryAgentReply,
  stopAiGenerator,
  updateMessage,
} from '@/store/ai-planner';
import { setIsHydrated } from '@/store/ai-planner';

import { addEffect } from '@/store/store';
import { uuid } from '@/utils/uuid';
import { streamAgentReply } from './stream';

const agentPlaceholder = (id: string): ChatMessage => ({
  from: 'Agent',
  id,
  message: '',
  type: 'messageResponse',
  isLoading: true,
});

export function applyAiPlannerEffects() {
  addEffect(initializeAiPlannerStateSlice, async (_, { dispatch }) => {
    dispatch(setIsHydrated(true));
  });

  addEffect(
    addMessage,
    async (
      { payload: message },
      { dispatch, extra: { aiChatService, logger } },
    ) => {
      if (message.from === 'Agent' || message.type !== 'messageResponse') {
        return;
      }
      const id = uuid();
      dispatch(addMessage(agentPlaceholder(id)));
      await streamAgentReply(
        dispatch,
        aiChatService.sendMessage(message.message),
        id,
        message.message,
        (e) => logger.warn('AI planner reply failed', e),
      );
    },
  );
  addEffect(
    retryAgentReply,
    async ({ payload }, { dispatch, extra: { aiChatService, logger } }) => {
      if (payload.retryText === undefined) {
        dispatch(restartChat());
        return;
      }
      dispatch(updateMessage(agentPlaceholder(payload.id)));
      await streamAgentReply(
        dispatch,
        aiChatService.sendMessage(payload.retryText),
        payload.id,
        payload.retryText,
        (e) => logger.warn('AI planner reply failed', e),
      );
    },
  );
  addEffect(stopAiGenerator, async (_, { extra: { aiChatService } }) => {
    await aiChatService.stopInProgress();
  });

  addEffect(initChat, async (_, { dispatch, getState }) => {
    if (getState().aiPlanner.plannerChat.length) {
      return;
    }
    dispatch(restartChat());
  });

  addEffect(
    restartChat,
    async (_, { dispatch, extra: { aiChatService, logger } }) => {
      const id = uuid();
      dispatch(addMessage(agentPlaceholder(id)));
      await streamAgentReply(
        dispatch,
        (async function* () {
          await aiChatService.restartChat();
          yield* aiChatService.introduce();
        })(),
        id,
        undefined,
        (e) => logger.warn('AI planner intro failed', e),
      );
    },
  );
}
