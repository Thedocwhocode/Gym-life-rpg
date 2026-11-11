import type { AiChatResponse } from '@/models/ai-models';
import { describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '@/store/ai-planner';
import { streamAgentReply } from './stream';

const reply = (message: string) =>
  ({ type: 'messageResponse', message }) as AiChatResponse;

describe('streamAgentReply (TD9/DR7)', () => {
  it('resposta completa termina sem carregar e sem erro', async () => {
    const dispatch = vi.fn<(a: { payload: ChatMessage }) => void>();
    async function* ok() {
      yield reply('Oi');
      yield reply('Oi, herói');
    }
    await streamAgentReply(dispatch, ok(), 'a1', 'quero um plano');
    const last = dispatch.mock.calls.at(-1)![0].payload;
    expect(last).toMatchObject({
      id: 'a1',
      message: 'Oi, herói',
      isLoading: false,
    });
    expect(last.failed).toBeUndefined();
  });

  it('rede caiu no meio: marca falha e guarda o texto para "Tentar"', async () => {
    const dispatch = vi.fn<(a: { payload: ChatMessage }) => void>();
    const onError = vi.fn();
    async function* offline(): AsyncGenerator<AiChatResponse> {
      yield reply('Oi');
      throw new Error('Network request failed');
    }
    await streamAgentReply(
      dispatch,
      offline(),
      'a1',
      'quero um plano',
      onError,
    );
    const last = dispatch.mock.calls.at(-1)![0].payload;
    expect(last).toMatchObject({
      id: 'a1',
      isLoading: false,
      failed: true,
      retryText: 'quero um plano',
    });
    expect(onError).toHaveBeenCalledOnce();
  });
});
