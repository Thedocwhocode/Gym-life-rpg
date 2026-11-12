import type { FxId } from '@/components/presentation/fx/registry';
import type { AttrKey } from '@/store/rpg/derive';

// design-spec §D.5. O HP daqui é só lore (D5: no combate, HP = séries).

export interface Beast {
  id: string;
  fx: FxId;
  hp: number;
  weak: AttrKey | 'INT';
  /** Item de `items.ts` que cai na 1ª derrota (D7). */
  drop: string;
  /** Monstro do combate (combat.ts) que conta como este; o guardião é o chefe de masmorra (DR22). */
  combat?: string;
  boss?: 'weekly' | 'dungeon';
}

export const BESTIARY: readonly Beast[] = [
  {
    id: 'gosma',
    fx: 'critters/slime',
    hp: 3,
    weak: 'STR',
    drop: 'botas-couro',
    combat: 'slime',
  },
  {
    id: 'morcego',
    fx: 'critters/bat',
    hp: 4,
    weak: 'CON',
    drop: 'capuz-noite',
    combat: 'bat',
  },
  {
    id: 'serpente',
    fx: 'critters/snake',
    hp: 4,
    weak: 'DEX',
    drop: 'cinto-escamas',
    combat: 'snake',
  },
  {
    id: 'espectro',
    fx: 'critters/ghost',
    hp: 5,
    weak: 'STA',
    drop: 'manto-palido',
    combat: 'ghost',
  },
  {
    id: 'olho',
    fx: 'critters/eyeball',
    hp: 5,
    weak: 'CON',
    drop: 'amuleto-coragem',
    combat: 'eyeball',
  },
  {
    id: 'fatuo',
    fx: 'critters/wisp',
    hp: 4,
    weak: 'INT',
    drop: 'vela-foco',
    combat: 'wisp',
  },
  {
    id: 'caveira',
    fx: 'critters/flying-skull',
    hp: 6,
    weak: 'STR',
    drop: 'elmo-chamuscado',
    combat: 'flying-skull',
    boss: 'weekly',
  },
  {
    id: 'guardiao',
    fx: 'spawn/summon-rise',
    hp: 8,
    weak: 'STR',
    drop: 'espada-ferro-frio',
    boss: 'dungeon',
  },
];

export type BeastState = 'unknown' | 'seen' | 'defeated';

/** Inimigo de uma sessão salva, no formato de `combat.ts` (`monster.id`, `defeated`). */
export interface Encounter {
  monster: string;
  defeated: boolean;
}

/** Estado de cada entrada + itens que já caíram. `dungeonsCleared` vem de dungeon.ts. */
export function bestiaryState(
  encounters: Iterable<Encounter>,
  dungeonsCleared: number,
): { state: Record<string, BeastState>; drops: string[] } {
  const state: Record<string, BeastState> = {};
  for (const b of BESTIARY) state[b.id] = 'unknown';
  if (dungeonsCleared > 0) state['guardiao'] = 'defeated';
  for (const e of encounters) {
    const b = BESTIARY.find((x) => x.combat === e.monster);
    if (!b) continue;
    if (e.defeated) state[b.id] = 'defeated';
    else if (state[b.id] === 'unknown') state[b.id] = 'seen';
  }
  return {
    state,
    drops: BESTIARY.filter((b) => state[b.id] === 'defeated').map(
      (b) => b.drop,
    ),
  };
}
