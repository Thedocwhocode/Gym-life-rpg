import { SHARE_CARD } from '@/components/presentation/rpg/ShareCard';
import html2canvas from 'html2canvas';
import type { RefObject } from 'react';
import type { View } from 'react-native';

type Doc = {
  createElement(tag: 'a'): { href: string; download: string; click(): void };
};

/** Web: no navegador não há folha de compartilhar confiável; baixa o PNG 1080×1350. */
export async function shareCardImage(ref: RefObject<View | null>) {
  // no react-native-web a ref da View é o próprio elemento do DOM
  const node = ref.current as unknown as HTMLElement | null;
  if (!node) throw new Error('cartão não montado');
  const canvas = await html2canvas(node, {
    scale: SHARE_CARD.outW / SHARE_CARD.w,
    backgroundColor: null,
  });
  // ponytail: o tsconfig não carrega a lib "dom" (ela quebra os tipos de Uint8Array no resto do app)
  const doc = (globalThis as unknown as { document: Doc }).document;
  const a = doc.createElement('a');
  a.href = (canvas as unknown as { toDataURL(type: string): string }).toDataURL(
    'image/png',
  );
  a.download = 'gymlife-missao.png';
  a.click();
}
