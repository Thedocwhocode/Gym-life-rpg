import type { AiWorkoutPlan } from '@/models/ai-models';
import type { PickedFile } from '@/services/file-picker-service';
import { Logger } from '@/services/logger';
import { pdfPages } from '@/services/pdf-text';
import { parseSheet } from '@/services/sheet-parser';

/**
 * Importar ficha (F10, revista em 2026-11-25): o texto do PDF é lido no próprio aparelho e tabulado sem IA
 * (`readLocal`); o arquivo não sai dele. Só transcreve; não cria plano.
 */
export const PDF_MAX_BYTES = 10 * 1024 * 1024;

export type PdfImportEvent =
  | { type: 'opened'; name: string; bytes: number }
  | { type: 'sending' }
  | { type: 'plan'; workouts: number };

export type PdfImportError = 'too_big' | 'not_pdf' | 'no_plan' | 'unsupported';

export type PdfImportResult =
  | { status: 'ok'; plan: AiWorkoutPlan }
  | { status: 'error'; reason: PdfImportError };

export interface PdfImportDeps {
  /** Lê a ficha; devolve o plano ou o motivo da falha. */
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
