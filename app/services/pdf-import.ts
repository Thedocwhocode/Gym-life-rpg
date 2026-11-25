import type { AiWorkoutPlan } from '@/models/ai-models';
import {
  CardioTarget,
  ExerciseBlueprint,
  ExerciseBlueprintPOJO,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { apiBaseUrl } from '@/services/api-consts';
import type { PickedFile } from '@/services/file-picker-service';
import { Logger } from '@/services/logger';
import { pdfPages } from '@/services/pdf-text';
import { parseSheet, sheetText } from '@/services/sheet-parser';
import { parseDuration } from '@/utils/format-date';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { match } from 'ts-pattern';

/**
 * Importar ficha (F10, D11; revisto em 2026-11-25): por padrão o texto do PDF é lido no próprio aparelho e
 * tabulado sem IA (`readLocal`). Só se o usuário pedir, e com o backend configurado, o texto vai ao leitor
 * por IA (`readAi`). Os dois só transcrevem; não criam plano.
 */
export const PDF_MAX_BYTES = 10 * 1024 * 1024;
/** Teto do texto enviado ao leitor por IA; o mesmo de `AiSheetController.MaxChars`. */
export const SHEET_MAX_CHARS = 100_000;
/** Consentimento do aviso LGPD, só neste aparelho e só antes da leitura por IA. v4: só o texto vai, à Groq. */
export const PDF_CONSENT_KEY = 'pdf-import-consent-v4';

export type PdfImportEvent =
  | { type: 'opened'; name: string; bytes: number }
  | { type: 'sending' }
  | { type: 'plan'; workouts: number };

export type PdfImportError =
  | 'too_big'
  | 'not_pdf'
  | 'pro'
  | 'rate_limited'
  | 'no_plan'
  | 'unsupported';

export type PdfImportResult =
  | { status: 'ok'; plan: AiWorkoutPlan }
  | { status: 'error'; reason: PdfImportError };

export interface PdfImportDeps {
  /** Envia o PDF ao leitor de fichas; devolve o plano ou o motivo da falha. */
  read(bytes: Uint8Array): Promise<AiWorkoutPlan | PdfImportError>;
}

const isPdf = (b: Uint8Array) =>
  b.length >= 5 &&
  String.fromCharCode(b[0], b[1], b[2], b[3], b[4]) === '%PDF-';

const usable = (p: AiWorkoutPlan) =>
  p.sessions.some((s) => s.exercises.length > 0);

export async function importPdf(
  file: PickedFile,
  deps: PdfImportDeps,
  onEvent: (e: PdfImportEvent) => void = () => {},
): Promise<PdfImportResult> {
  if (file.bytes.length > PDF_MAX_BYTES)
    return { status: 'error', reason: 'too_big' };
  if (!isPdf(file.bytes)) return { status: 'error', reason: 'not_pdf' };
  onEvent({ type: 'opened', name: file.name, bytes: file.bytes.length });
  onEvent({ type: 'sending' });

  const out = await deps.read(file.bytes).catch((e: unknown) => {
    new Logger().error('Falha ao ler a ficha em PDF', e);
    return 'no_plan' as const;
  });
  if (typeof out === 'string') return { status: 'error', reason: out };
  if (!usable(out)) return { status: 'error', reason: 'no_plan' };
  onEvent({ type: 'plan', workouts: out.sessions.length });
  return { status: 'ok', plan: out };
}

/** Leitor sem IA: o PDF não sai do aparelho. `unsupported` onde o aparelho não lê PDF (por ora, fora da web). */
export async function readLocal(
  bytes: Uint8Array,
  pages: typeof pdfPages = pdfPages,
): Promise<AiWorkoutPlan | PdfImportError> {
  const read = await pages(bytes);
  if (!read) return 'unsupported';
  return parseSheet(read) ?? 'no_plan';
}

/**
 * Leitor por IA: só o texto sai do aparelho (o serviço OpenAI-compatível não lê PDF), então ficha escaneada
 * continua sem leitura.
 */
export async function readAi(
  bytes: Uint8Array,
  proToken: string | undefined,
  pages: typeof pdfPages = pdfPages,
  fetchImpl: typeof fetch = fetch,
): Promise<AiWorkoutPlan | PdfImportError> {
  const read = await pages(bytes);
  if (!read) return 'unsupported';
  const text = sheetText(read);
  if (!text) return 'no_plan';
  if (text.length > SHEET_MAX_CHARS) return 'too_big';
  return readSheet(text, proToken, fetchImpl);
}

/** `POST /ai/sheet` com o mesmo cabeçalho de compra pro que o hub do chat usava. 503 = leitor desligado. */
export async function readSheet(
  text: string,
  proToken: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<AiWorkoutPlan | PdfImportError> {
  if (!proToken && !__DEV__) return 'pro';
  const res = await fetchImpl(`${apiBaseUrl}/ai/sheet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Authorization: __DEV__
        ? 'Web test-web-auth-key-12345'
        : `RevenueCat ${proToken}`,
    },
    body: text,
  });
  if (res.status === 401) return 'pro';
  if (res.status === 413) return 'too_big';
  if (res.status === 429) return 'rate_limited';
  if (!res.ok) return 'no_plan';
  return toAiWorkoutPlan((await res.json()) as JsonResponse<AiWorkoutPlan>);
}

export type JsonResponse<T> = T extends string | number | boolean | null
  ? T
  : T extends Duration
    ? string
    : T extends BigNumber
      ? number
      : T extends (infer U)[]
        ? JsonResponse<U>[]
        : T extends object
          ? { [K in keyof T]: JsonResponse<T[K]> }
          : never;

export function toAiWorkoutPlan(
  aiPlan: JsonResponse<AiWorkoutPlan>,
): AiWorkoutPlan {
  return {
    name: aiPlan.name,
    description: aiPlan.description,
    sessions: aiPlan.sessions.map((s) =>
      SessionBlueprint.fromPOJO({
        name: s.name,
        notes: s.notes,
        exercises: s.exercises.map(parseAiExercise),
      }),
    ),
  };
}

function parseAiExercise(
  ex: JsonResponse<ExerciseBlueprint>,
): ExerciseBlueprintPOJO {
  if ('repsPerSet' in ex) {
    return {
      type: 'WeightedExerciseBlueprint',
      name: ex.name,
      link: ex.link,
      notes: ex.notes,
      repsPerSet: ex.repsPerSet,
      sets: ex.sets,
      supersetWithNext: ex.supersetWithNext,
      weightIncreaseOnSuccess: new BigNumber(ex.weightIncreaseOnSuccess),
      restBetweenSets: {
        minRest: parseDuration(ex.restBetweenSets.minRest),
        maxRest: parseDuration(ex.restBetweenSets.maxRest),
        failureRest: parseDuration(ex.restBetweenSets.failureRest),
      },
    };
  }

  return {
    type: 'CardioExerciseBlueprint',
    name: ex.name,
    link: ex.link,
    notes: ex.notes,
    target: match(ex.target)
      .returnType<CardioTarget>()
      .with({ type: 'distance' }, (t) => ({
        type: 'distance',
        value: { value: BigNumber(t.value.value), unit: t.value.unit },
      }))
      .with({ type: 'time' }, (t) => ({
        type: 'time',
        value: parseDuration(t.value),
      }))
      .exhaustive(),
    trackDistance: ex.trackDistance,
    trackIncline: ex.trackIncline,
    trackResistance: ex.trackResistance,
    trackDuration: ex.trackDuration,
  };
}
