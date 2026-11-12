import { SHARE_CARD } from '@/components/presentation/rpg/ShareCard';
import { shareAsync } from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Nativo: captura o cartão em 1080×1350 e abre a folha de compartilhar. */
export async function shareCardImage(ref: RefObject<View | null>) {
  const uri = await captureRef(ref, {
    format: 'png',
    width: SHARE_CARD.outW,
    height: SHARE_CARD.outH,
    result: 'tmpfile',
  });
  await shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'GymLife RPG' });
}
