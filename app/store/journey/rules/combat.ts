import {
  RecordedWeightedExercise,
  type Session,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import type { FxId } from '@/components/presentation/fx/registry';

// Regras puras do combate da sessão (D5 + DR21). Nada aqui guarda estado: o placar sai da sessão.

export interface Monster {
  id: string;
  fx: FxId;
  /** Golpe do herói contra este monstro. */
  attack: FxId;
}

// ponytail: 7 critters do pixelfx; o bestiário da F6 troca a lista sem mudar as regras.
export const MONSTERS: readonly Monster[] = [
  { id: 'slime', fx: 'critters/slime', attack: 'melee/hammer-smash' },
  { id: 'snake', fx: 'critters/snake', attack: 'melee/heavy-cleave' },
  { id: 'bat', fx: 'critters/bat', attack: 'melee/sword-slash' },
  { id: 'eyeball', fx: 'critters/eyeball', attack: 'melee/thrust' },
  { id: 'ghost', fx: 'critters/ghost', attack: 'melee/spin-slash' },
  { id: 'wisp', fx: 'critters/wisp', attack: 'melee/dagger-flurry' },
];
export const BOSS: Monster = {
  id: 'flying-skull',
  fx: 'critters/flying-skull',
  attack: 'melee/double-slash',
};

/** Exercício visto pelo combate: séries com reps (undefined = não marcada) ou cardio feito/não. */
export type CombatExercise =
  | { name: string; sets: readonly (number | undefined)[] }
  | { name: string; cardioDone: boolean };

export interface Enemy {
  index: number;
  name: string;
  monster: Monster;
  boss: boolean;
  maxHp: number;
  hp: number;
  defeated: boolean;
}

/** Hash estável (djb2) do nome normalizado: o mesmo exercício sempre traz o mesmo monstro. */
export function pickMonster(name: string): Monster {
  const key = name.trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < key.length; i++)
    h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  return MONSTERS[Math.abs(h) % MONSTERS.length];
}

/** HP = séries; reps > 0 tira 1 HP, reps = 0 é esquiva e série não marcada não conta. Cardio = 1 HP. */
export function enemiesFor(
  exercises: readonly CombatExercise[],
  freeform: boolean,
): Enemy[] {
  return exercises.map((ex, index) => {
    const boss = !freeform && index === exercises.length - 1;
    const [maxHp, hits] =
      'sets' in ex
        ? [
            ex.sets.length,
            ex.sets.filter((r) => r !== undefined && r > 0).length,
          ]
        : [1, ex.cardioDone ? 1 : 0];
    const hp = Math.max(0, maxHp - hits);
    return {
      index,
      name: ex.name,
      monster: boss ? BOSS : pickMonster(ex.name),
      boss,
      maxHp,
      hp,
      defeated: maxHp > 0 && hp === 0,
    };
  });
}

export function combatExercises(session: Session): CombatExercise[] {
  return session.recordedExercises.map((ex) =>
    ex instanceof RecordedWeightedExercise
      ? {
          name: ex.blueprint.name,
          sets: ex.potentialSets.map((s) => s.set?.repsCompleted),
        }
      : { name: ex.blueprint.name, cardioDone: ex.isComplete },
  );
}

export type Strike = 'hit' | 'dodge' | 'undo' | 'none';

/** O que a troca de reps de uma série significa no combate. */
export function classifyStrike(
  before: number | undefined,
  after: number | undefined,
): Strike {
  if (after === undefined) return before === undefined ? 'none' : 'undo';
  if (after === 0) return before === 0 ? 'none' : 'dodge';
  return before !== undefined && before > 0 ? 'none' : 'hit';
}

/** Golpes acertados na sessão inteira; o combo toca a cada 3. */
export function hitCount(exercises: readonly CombatExercise[]): number {
  return exercises.reduce(
    (n, ex) =>
      n +
      ('sets' in ex
        ? ex.sets.filter((r) => r !== undefined && r > 0).length
        : 0),
    0,
  );
}

export const COMBO_EVERY = 3;
export const isCombo = (hits: number) => hits > 0 && hits % COMBO_EVERY === 0;

/** PR só quando supera o melhor peso já registrado; primeira vez e empate não contam. */
export function isPr(weight: Weight, best: Weight | undefined): boolean {
  if (!best) return false;
  return weight
    .convertTo('kilograms')
    .value.isGreaterThan(best.convertTo('kilograms').value);
}

/** Melhor peso com reps > 0 de cada exercício, em kg, pela chave normalizada. */
export function bestWeights(
  exercises: Iterable<{
    key: string;
    sets: Iterable<{ reps?: number | undefined; weight: Weight }>;
  }>,
): Map<string, Weight> {
  const best = new Map<string, Weight>();
  for (const ex of exercises)
    for (const s of ex.sets) {
      if (!s.reps) continue;
      const kg = s.weight.convertTo('kilograms');
      const cur = best.get(ex.key);
      if (!cur || kg.value.isGreaterThan(cur.value)) best.set(ex.key, kg);
    }
  return best;
}

export interface NextStrike {
  exerciseIndex: number;
  setIndex: number;
  reps: number;
  weight: Weight;
}

/** A série que o CTA "Golpear" grava: primeira não marcada do próximo exercício com peso. */
export function nextStrike(session: Session): NextStrike | undefined {
  const ex = session.nextExercise;
  if (!(ex instanceof RecordedWeightedExercise)) return undefined;
  const setIndex = ex.potentialSets.findIndex((s) => s.set === undefined);
  if (setIndex < 0) return undefined;
  return {
    exerciseIndex: session.recordedExercises.indexOf(ex),
    setIndex,
    reps: ex.blueprint.repsPerSet,
    weight: ex.potentialSets[setIndex].weight,
  };
}

export type RewardPage = 'mission' | 'levelup' | 'loot' | 'dungeon';

/**
 * Fila do RewardDialog (DR3): Missão → Level up → Espólio, no máximo 3 páginas.
 * Masmorra limpa (DR22) ocupa o lugar do Espólio e lista as conquistas dentro dela.
 */
export function rewardPages(
  levelUp: boolean,
  lootCount: number,
  dungeon = false,
): RewardPage[] {
  return [
    'mission',
    ...(levelUp ? (['levelup'] as const) : []),
    ...(dungeon
      ? (['dungeon'] as const)
      : lootCount > 0
        ? (['loot'] as const)
        : []),
  ];
}

/** Campos do cartão E2 (DR24, C8): lista fechada, sem peso, localização nem nome. */
export interface ShareCardFields {
  level: number;
  title: string;
  workout: string;
  xp: number;
  boss: string | undefined;
}

export function shareCardFields(input: ShareCardFields): ShareCardFields {
  const { level, title, workout, xp, boss } = input;
  return { level, title, workout, xp, boss };
}
