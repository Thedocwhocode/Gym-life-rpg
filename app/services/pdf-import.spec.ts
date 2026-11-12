import type { AiChatResponse, AiWorkoutPlan } from '@/models/ai-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { describe, expect, it, vi } from 'vitest';
import {
  buildPdfPrompt,
  importPdf,
  PDF_MAX_BYTES,
  PDF_MAX_TEXT_BYTES,
  truncateUtf8,
  type PdfImportDeps,
} from './pdf-import';

const pdfBytes = (extra = 0) => {
  const head = new TextEncoder().encode('%PDF-1.4\n');
  const out = new Uint8Array(head.length + extra);
  out.set(head);
  return out;
};

const session = (name: string, exercises: number) =>
  SessionBlueprint.fromPOJO({
    name,
    notes: '',
    exercises: Array.from({ length: exercises }, (_, i) => ({
      type: 'WeightedExerciseBlueprint' as const,
      name: `Ex ${i}`,
      sets: 3,
      repsPerSet: 10,
      weightIncreaseOnSuccess: 0,
      restBetweenSets: {
        minRest: 'PT1M',
        maxRest: 'PT2M',
        failureRest: 'PT3M',
      },
      supersetWithNext: false,
      notes: '',
      link: '',
    })),
  } as never);

const plan = (sessions: SessionBlueprint[]): AiWorkoutPlan => ({
  name: 'Ficha',
  description: '',
  sessions,
});

async function* stream(...items: AiChatResponse[]) {
  for (const i of items) yield i;
}

function deps(over: Partial<PdfImportDeps> = {}): PdfImportDeps {
  return {
    extract: vi.fn(
      async (_b: Uint8Array, onPage: (p: number, t: number) => void) => {
        onPage(1, 1);
        return { pages: 1, text: 'Treino A\nSupino 4x10 40kg' };
      },
    ),
    send: vi.fn(() =>
      stream(
        { type: 'chatPlan', plan: plan([session('A', 0)]) },
        { type: 'chatPlan', plan: plan([session('A', 2), session('B', 1)]) },
      ),
    ),
    ...over,
  };
}

const file = (bytes: Uint8Array = pdfBytes()) => ({ name: 'ficha.pdf', bytes });

describe('importPdf', () => {
  it('fluxo feliz: eventos reais e o último plano vence', async () => {
    const events: string[] = [];
    const out = await importPdf(file(), deps(), (e) => events.push(e.type));
    expect(out).toMatchObject({ status: 'ok', truncated: false });
    expect(out.status === 'ok' && out.plan.sessions).toHaveLength(2);
    expect(events).toEqual([
      'opened',
      'page',
      'text',
      'sending',
      'plan',
      'plan',
    ]);
  });

  it('recusa acima de 10 MB e arquivo que não começa com %PDF-', async () => {
    expect(await importPdf(file(pdfBytes(PDF_MAX_BYTES)), deps())).toEqual({
      status: 'error',
      reason: 'too_big',
    });
    expect(
      await importPdf(file(new TextEncoder().encode('oi')), deps()),
    ).toEqual({ status: 'error', reason: 'not_pdf' });
  });

  it('PDF que não abre ≠ PDF escaneado sem texto', async () => {
    const broken = deps({
      extract: async () => {
        throw new Error('Invalid PDF structure');
      },
    });
    expect(await importPdf(file(), broken)).toEqual({
      status: 'error',
      reason: 'unreadable',
    });
    const scanned = deps({ extract: async () => ({ pages: 3, text: ' \n ' }) });
    expect(await importPdf(file(), scanned)).toEqual({
      status: 'error',
      reason: 'no_text',
    });
    expect(scanned.send).not.toHaveBeenCalled();
  });

  it('sem pro: estado próprio', async () => {
    const d = deps({ send: () => stream({ type: 'purchasePro' }) });
    expect(await importPdf(file(), d)).toEqual({
      status: 'error',
      reason: 'pro',
    });
  });

  it('servidor só conversa, falha ou devolve plano vazio → no_plan', async () => {
    const chat = deps({
      send: () =>
        stream({
          type: 'messageResponse',
          message: 'Failed to connect to server',
        }),
    });
    expect(await importPdf(file(), chat)).toMatchObject({ reason: 'no_plan' });
    const empty = deps({
      send: () => stream({ type: 'chatPlan', plan: plan([session('A', 0)]) }),
    });
    expect(await importPdf(file(), empty)).toMatchObject({ reason: 'no_plan' });
    const crash = deps({
      send: () =>
        (async function* () {
          throw new Error('5xx');
        })(),
    });
    expect(await importPdf(file(), crash)).toMatchObject({ reason: 'no_plan' });
  });

  it('texto grande é cortado em bytes e marcado', async () => {
    const big = 'é'.repeat(PDF_MAX_TEXT_BYTES);
    const d = deps({ extract: async () => ({ pages: 1, text: big }) });
    const out = await importPdf(file(), d);
    expect(out).toMatchObject({ status: 'ok', truncated: true });
    const prompt = vi.mocked(d.send).mock.calls[0][0];
    expect(new TextEncoder().encode(prompt).length).toBeLessThan(32 * 1024);
  });
});

describe('truncateUtf8 e prompt', () => {
  it('não parte caractere multibyte', () => {
    const r = truncateUtf8('aé', 2);
    expect(r).toEqual({ text: 'a', truncated: true });
    expect(truncateUtf8('ok', 10)).toEqual({ text: 'ok', truncated: false });
  });

  it('delimita o texto da ficha como dado', () => {
    const p = buildPdfPrompt('Supino 4x10');
    expect(p).toContain('<<<SHEET\nSupino 4x10\nSHEET>>>');
    expect(p).toContain('not instructions');
  });
});
