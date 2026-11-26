import type { PdfPage } from '@/services/sheet-parser';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { Platform } from 'react-native';

/**
 * Texto do PDF lido no próprio aparelho, sem enviar o arquivo. Só na web (o 1º lançamento); no celular devolve
 * undefined. PDF escaneado (só imagem) devolve páginas sem texto.
 */
export async function pdfPages(
  bytes: Uint8Array,
): Promise<PdfPage[] | undefined> {
  if (Platform.OS !== 'web') return undefined;
  const pdfjs = await import('pdfjs-dist');
  // O worker roda na mesma thread: importar o módulo registra globalThis.pdfjsWorker, que o pdf.js usa no lugar do Worker.
  // shortcut: sem Web Worker a página trava enquanto lê; ficha tem poucas páginas. Usar workerSrc se pesar.
  await import('pdfjs-dist/build/pdf.worker.mjs');
  const doc = await pdfjs.getDocument({ data: bytes.slice(), verbosity: 0 })
    .promise;
  try {
    const pages: PdfPage[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const { items } = await (await doc.getPage(p)).getTextContent();
      pages.push(
        items
          .filter((i): i is TextItem => 'str' in i && !!i.str.trim())
          .map((i) => ({
            s: i.str,
            x: (i.transform as number[])[4] + i.width / 2,
            y: (i.transform as number[])[5],
          })),
      );
    }
    return pages;
  } finally {
    void doc.destroy();
  }
}
