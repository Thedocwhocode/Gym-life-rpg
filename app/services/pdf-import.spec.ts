import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AiWorkoutPlan } from '@/models/ai-models';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { Duration, LocalDate } from '@js-joda/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  importPdf,
  PDF_MAX_BYTES,
  readSheet,
  type PdfImportDeps,
} from './pdf-import';

vi.mock('@/services/api-consts', () => ({ apiBaseUrl: 'http://api' }));

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
        deps(async () => 'pro'),
      ),
    ).toEqual({
      status: 'error',
      reason: 'pro',
    });
    expect(
      await importPdf(
        file(),
        deps(async () => 'rate_limited'),
      ),
    ).toEqual({ status: 'error', reason: 'rate_limited' });
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

describe('readSheet', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (status: number, body: unknown = {}) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status }));

  it('sem token fora de dev nem chama a API', async () => {
    vi.stubGlobal('__DEV__', false);
    const f = respond(200);
    expect(await readSheet(pdfBytes(), undefined, f)).toBe('pro');
    expect(f).not.toHaveBeenCalled();
  });

  it('manda o PDF com o cabeçalho da RevenueCat', async () => {
    vi.stubGlobal('__DEV__', false);
    const f = respond(422);
    await readSheet(pdfBytes(), 'user-1', f);
    expect(f).toHaveBeenCalledWith(
      'http://api/ai/sheet',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          Authorization: 'RevenueCat user-1',
        },
      }),
    );
  });

  it.each([
    [401, 'pro'],
    [413, 'too_big'],
    [415, 'not_pdf'],
    [429, 'rate_limited'],
    [422, 'no_plan'],
    [500, 'no_plan'],
  ])('HTTP %i → %s', async (status, reason) => {
    vi.stubGlobal('__DEV__', false);
    expect(await readSheet(pdfBytes(), 'user-1', respond(status))).toBe(reason);
  });

  it('200: converte o JSON da API (descanso "0.00:01:30:")', async () => {
    vi.stubGlobal('__DEV__', true);
    const body = {
      name: 'Ficha hipertrofia',
      description: '',
      sessions: [
        {
          name: 'Treino A',
          notes: '',
          exercises: [
            {
              name: 'Supino reto',
              sets: 4,
              repsPerSet: 10,
              weightIncreaseOnSuccess: 0,
              restBetweenSets: {
                minRest: '0.00:01:30:',
                maxRest: '0.00:02:00:',
                failureRest: '0.00:03:00:',
              },
              supersetWithNext: false,
              notes: '20 kg',
              link: '',
            },
          ],
        },
      ],
    };
    const out = await readSheet(pdfBytes(), undefined, respond(200, body));
    if (typeof out === 'string') throw new Error(out);
    const ex = out.sessions[0].exercises[0];
    expect(ex.name).toBe('Supino reto');
    expect(ex.notes).toBe('20 kg');
    expect(
      'restBetweenSets' in ex &&
        ex.restBetweenSets.minRest.equals(Duration.ofSeconds(90)),
    ).toBe(true);
    // O mesmo caminho do "Salvar plano" da tela (pdf-import.tsx).
    const saved = ProgramBlueprint.fromPOJO({
      lastEdited: LocalDate.now(),
      name: out.name,
      sessions: out.sessions.map((x) => x.toPOJO()),
    });
    expect(saved.sessions[0].exercises[0].name).toBe('Supino reto');
  });
});

describe('fixtures sintéticos', () => {
  it.each(['ficha-sintetica.pdf', 'escaneado-sintetico.pdf'])(
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
