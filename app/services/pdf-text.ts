export interface PdfText {
  pages: number;
  text: string;
}

type PdfJs = typeof import('pdfjs-dist/legacy/build/pdf.js');

/**
 * pdf.js 3.x, build legacy, sem worker (o "worker falso" roda na mesma thread).
 * Import dinâmico: se o módulo não carregar num motor JS, só a importação de PDF falha, não o app.
 */
async function loadPdfJs(): Promise<PdfJs> {
  const g = globalThis as { pdfjsWorker?: unknown };
  // @ts-expect-error o pacote não publica tipos para o worker
  g.pdfjsWorker ??= await import('pdfjs-dist/legacy/build/pdf.worker.js');
  return import('pdfjs-dist/legacy/build/pdf.js');
}

/** Extrai o texto de cada página, no aparelho. O arquivo nunca sai daqui. */
export async function extractPdfText(
  bytes: Uint8Array,
  onPage?: (page: number, total: number) => void,
): Promise<PdfText> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({
    data: bytes.slice(), // o pdf.js transfere o buffer; preserva o original
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  }).promise;
  try {
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      pages.push(
        content.items
          .map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : ''))
          .join('')
          .replace(/[ \t]+\n/g, '\n')
          .trim(),
      );
      onPage?.(i, doc.numPages);
    }
    return { pages: doc.numPages, text: pages.join('\n\n').trim() };
  } finally {
    await doc.destroy();
  }
}
