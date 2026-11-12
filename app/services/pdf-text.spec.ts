import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { extractPdfText } from './pdf-text';

// Fixtures sintéticas (geradas por script), não são fichas reais.
const fixture = (name: string) =>
  new Uint8Array(readFileSync(join(__dirname, 'test-assets/pdf', name)));

describe('extractPdfText', () => {
  it('lê o texto de todas as páginas, avisando página a página', async () => {
    const onPage = vi.fn();
    const out = await extractPdfText(fixture('ficha-sintetica.pdf'), onPage);
    expect(out.pages).toBe(2);
    expect(out.text).toContain('Supino reto 4x10 40kg');
    expect(out.text).toContain('Leg press 3x12 120kg');
    expect(onPage).toHaveBeenNthCalledWith(1, 1, 2);
    expect(onPage).toHaveBeenNthCalledWith(2, 2, 2);
  });

  it('PDF só com imagem/desenho volta sem texto', async () => {
    const out = await extractPdfText(fixture('escaneado-sintetico.pdf'));
    expect(out).toEqual({ pages: 1, text: '' });
  });

  it('arquivo que não é PDF falha', async () => {
    await expect(
      extractPdfText(new TextEncoder().encode('não sou pdf')),
    ).rejects.toThrow();
  });
});
