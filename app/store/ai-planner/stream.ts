import type { AiChatResponse } from '@/models/ai-models';
import { updateMessage, type ChatMessage } from '@/store/ai-planner';

type Dispatch = (action: ReturnType<typeof updateMessage>) => unknown;

/**
 * Escreve a resposta do agente no balão `id` conforme chega. Se o stream falhar (offline, 5xx),
 * o balão sai do carregamento marcado `failed`, com `retryText` para o "Tentar" (DR7).
 */
export async function streamAgentReply(
  dispatch: Dispatch,
  stream: AsyncIterable<AiChatResponse>,
  id: string,
  retryText?: string,
  onError?: (e: unknown) => void,
) {
  const base: ChatMessage = {
    from: 'Agent',
    id,
    message: '',
    type: 'messageResponse',
  };
  let latest: AiChatResponse | undefined;
  try {
    for await (const chunk of stream) {
      latest = chunk;
      dispatch(updateMessage({ ...base, ...chunk, isLoading: true }));
    }
    dispatch(updateMessage({ ...base, ...latest, isLoading: false }));
  } catch (e) {
    onError?.(e);
    // Descarta a resposta parcial: meio plano salvo seria dado falso (DR7).
    dispatch(
      updateMessage({
        ...base,
        isLoading: false,
        failed: true,
        retryText,
      }),
    );
  }
}
