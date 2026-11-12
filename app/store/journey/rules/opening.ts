// F6: no máximo um aviso por abertura do app, nesta ordem (recompensa > coração > crônica > boas-vindas).

export type OpeningOverlay = 'reward' | 'heart' | 'chronicle' | 'intro';

export function openingOverlay(pending: {
  reward: boolean;
  heart: boolean;
  chronicle: boolean;
  intro: boolean;
}): OpeningOverlay | undefined {
  return (['reward', 'heart', 'chronicle', 'intro'] as const).find(
    (k) => pending[k],
  );
}
