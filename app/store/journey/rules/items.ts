import type { Bonus } from './multipliers';

// D7: itens vêm dos drops do bestiário (1ª derrota de cada monstro). Só Espada e Botas têm o
// bônus do design-spec §D; os outros são cosméticos. ponytail: drops de conquista quando houver arte.

export type Slot = 'elmo' | 'manto' | 'arma' | 'cinto' | 'botas' | 'reliquia';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  slot: Slot;
  rarity: Rarity;
  bonus?: Bonus;
}

export const SLOTS: readonly Slot[] = [
  'elmo',
  'manto',
  'arma',
  'cinto',
  'botas',
  'reliquia',
];

export const ITEMS: readonly Item[] = [
  {
    id: 'botas-couro',
    slot: 'botas',
    rarity: 'common',
    bonus: { kind: 'cardio', pct: 5 },
  },
  { id: 'capuz-noite', slot: 'elmo', rarity: 'common' },
  { id: 'cinto-escamas', slot: 'cinto', rarity: 'common' },
  { id: 'manto-palido', slot: 'manto', rarity: 'rare' },
  { id: 'amuleto-coragem', slot: 'reliquia', rarity: 'rare' },
  { id: 'vela-foco', slot: 'reliquia', rarity: 'common' },
  { id: 'elmo-chamuscado', slot: 'elmo', rarity: 'rare' },
  {
    id: 'espada-ferro-frio',
    slot: 'arma',
    rarity: 'epic',
    bonus: { kind: 'strength', pct: 5 },
  },
];

/** Equipa `id`, tirando o item do mesmo slot. */
export function equipItem(equipped: readonly string[], id: string): string[] {
  const slot = ITEMS.find((i) => i.id === id)?.slot;
  return [
    ...equipped.filter((x) => ITEMS.find((i) => i.id === x)?.slot !== slot),
    id,
  ];
}
