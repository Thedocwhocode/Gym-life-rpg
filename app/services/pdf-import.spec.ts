import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AiWorkoutPlan } from '@/models/ai-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { describe, expect, it, vi } from 'vitest';
import {
  importPdf,
  PDF_MAX_BYTES,
  readLocal,
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

const deps = (read: PdfImportDeps['read']): PdfImportDeps => ({ read });
const file = (bytes: Uint8Array = pdfBytes()) => ({ name: 'ficha.pdf', bytes });

describe('importPdf', () => {
  it('fluxo feliz: eventos na ordem e o plano lido', async () => {
    const events: string[] = [];
    const read = vi.fn(async () => plan([session('A', 2), session('B', 1)]));
    const out = await importPdf(file(), deps(read), (e) => events.push(e.type));
    expect(out.status === 'ok' && out.plan.sessions).toHaveLength(2);
    expect(events).toEqual(['opened', 'sending', 'plan']);
    expect(read).toHaveBeenCalledWith(file().bytes);
  });

  it('recusa acima de 10 MB e arquivo sem %PDF- sem chamar o leitor', async () => {
    const read = vi.fn();
    expect(await importPdf(file(pdfBytes(PDF_MAX_BYTES)), deps(read))).toEqual({
      status: 'error',
      reason: 'too_big',
    });
    expect(
      await importPdf(file(new TextEncoder().encode('oi')), deps(read)),
    ).toEqual({ status: 'error', reason: 'not_pdf' });
    expect(read).not.toHaveBeenCalled();
  });

  it('repassa o motivo do leitor', async () => {
    expect(
      await importPdf(
        file(),
        deps(async () => 'unsupported'),
      ),
    ).toEqual({ status: 'error', reason: 'unsupported' });
  });

  it('plano sem exercícios ou leitor que falha → no_plan', async () => {
    const empty = deps(async () => plan([session('A', 0)]));
    expect(await importPdf(file(), empty)).toMatchObject({ reason: 'no_plan' });
    const crash = deps(async () => {
      throw new Error('rede');
    });
    expect(await importPdf(file(), crash)).toMatchObject({ reason: 'no_plan' });
  });
});

describe('readLocal', () => {
  it('aparelho que não lê PDF → unsupported', async () => {
    expect(await readLocal(pdfBytes(), async () => undefined)).toBe(
      'unsupported',
    );
  });

  it('texto sem treino → no_plan; com treino → plano', async () => {
    expect(await readLocal(pdfBytes(), async () => [[]])).toBe('no_plan');
    const out = await readLocal(pdfBytes(), async () => [
      [
        { s: 'Treino A', x: 50, y: 800 },
        { s: 'Supino reto', x: 50, y: 780 },
        { s: '4x10', x: 200, y: 780 },
      ],
    ]);
    if (typeof out === 'string') throw new Error(out);
    expect(out.sessions[0].exercises[0].name).toBe('Supino reto');
  });
});

describe('fixtures', () => {
  it.each([
    'ficha-sintetica.pdf',
    'escaneado-sintetico.pdf',
    'ficha-real-anonimizada.pdf',
    'ficha-real-2-anonimizada.pdf',
    'planilha-semanas-sintetica.pdf',
  ])(
    '%s chega ao leitor (escaneado não é mais recusado no aparelho)',
    async (name) => {
      const bytes = new Uint8Array(
        readFileSync(join(__dirname, 'test-assets/pdf', name)),
      );
      const read = vi.fn(async () => plan([session('A', 1)]));
      expect(await importPdf({ name, bytes }, deps(read))).toMatchObject({
        status: 'ok',
      });
      expect(read).toHaveBeenCalledOnce();
    },
  );
});
