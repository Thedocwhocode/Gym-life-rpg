import { Weight } from '@/models/weight';
import { describe, expect, it } from 'vitest';
import {
  BOSS,
  bestWeights,
  classifyStrike,
  enemiesFor,
  hitCount,
  isCombo,
  isPr,
  MONSTERS,
  pickMonster,
  rewardPages,
  shareCardFields,
} from './combat';

const kg = (n: number) => new Weight(n, 'kilograms');
const lb = (n: number) => new Weight(n, 'pounds');

describe('pickMonster', () => {
  it('é determinístico e ignora caixa e espaços', () => {
    expect(pickMonster('Supino reto')).toBe(pickMonster('  supino RETO '));
    expect(MONSTERS).toContain(pickMonster('Agachamento'));
  });

  it('espalha nomes diferentes por mais de um monstro', () => {
    const names = [
      'Supino',
      'Agachamento',
      'Remada',
      'Terra',
      'Rosca',
      'Desenvolvimento',
    ];
    expect(new Set(names.map((n) => pickMonster(n).id)).size).toBeGreaterThan(
      1,
    );
  });
});

describe('enemiesFor', () => {
  const plan = [
    { name: 'Supino', sets: [10, 0, undefined] },
    { name: 'Esteira', cardioDone: true },
    { name: 'Terra', sets: [5, 5] },
  ];

  it('HP = séries; reps > 0 tira 1, reps = 0 é esquiva, não marcada não conta', () => {
    const [supino] = enemiesFor(plan, false);
    expect(supino).toMatchObject({
      maxHp: 3,
      hp: 2,
      defeated: false,
      boss: false,
    });
  });

  it('cardio feito vale 1 HP e derrota o monstro', () => {
    expect(enemiesFor(plan, false)[1]).toMatchObject({
      maxHp: 1,
      hp: 0,
      defeated: true,
    });
  });

  it('o último exercício é o chefe, exceto no treino livre', () => {
    expect(enemiesFor(plan, false)[2]).toMatchObject({
      boss: true,
      monster: BOSS,
      defeated: true,
    });
    expect(enemiesFor(plan, true).some((e) => e.boss)).toBe(false);
  });

  it('desmarcar a série devolve o HP', () => {
    const [antes] = enemiesFor([{ name: 'A', sets: [8, 8] }], true);
    const [depois] = enemiesFor([{ name: 'A', sets: [8, undefined] }], true);
    expect([antes.hp, depois.hp]).toEqual([0, 1]);
  });
});

describe('classifyStrike', () => {
  it.each([
    [undefined, 10, 'hit'],
    [0, 10, 'hit'],
    [10, 9, 'none'],
    [1, 0, 'dodge'],
    [undefined, 0, 'dodge'],
    [0, undefined, 'undo'],
    [10, undefined, 'undo'],
    [undefined, undefined, 'none'],
  ] as const)('%s → %s = %s', (before, after, strike) => {
    expect(classifyStrike(before, after)).toBe(strike);
  });
});

describe('combo', () => {
  it('conta golpes da sessão e toca a cada 3', () => {
    const hits = hitCount([
      { name: 'A', sets: [10, 0, 8] },
      { name: 'B', cardioDone: true },
      { name: 'C', sets: [5] },
    ]);
    expect(hits).toBe(3);
    expect([0, 1, 2, 3, 6].map(isCombo)).toEqual([
      false,
      false,
      false,
      true,
      true,
    ]);
  });
});

describe('isPr', () => {
  it('primeira vez não conta', () =>
    expect(isPr(kg(100), undefined)).toBe(false));
  it('empate não conta', () => expect(isPr(kg(100), kg(100))).toBe(false));
  it('peso menor não conta', () => expect(isPr(kg(95), kg(100))).toBe(false));
  it('peso maior conta', () => expect(isPr(kg(102.5), kg(100))).toBe(true));
  it('converte libras', () => {
    expect(isPr(lb(100), kg(45))).toBe(true); // 45,36 kg
    expect(isPr(lb(100), kg(46))).toBe(false);
  });
});

describe('bestWeights', () => {
  it('guarda o maior peso com reps > 0, em kg', () => {
    const best = bestWeights([
      {
        key: 'supino',
        sets: [
          { reps: 5, weight: kg(80) },
          { reps: 0, weight: kg(200) },
        ],
      },
      {
        key: 'supino',
        sets: [{ reps: 3, weight: lb(200) }, { weight: kg(300) }],
      },
    ]);
    expect(best.get('supino')?.value.toFixed(1)).toBe('90.7');
    expect(best.get('supino')?.unit).toBe('kilograms');
  });
});

describe('rewardPages', () => {
  it('Missão sempre; Level up e Espólio só se houver; máximo 3', () => {
    expect(rewardPages(false, 0)).toEqual(['mission']);
    expect(rewardPages(true, 0)).toEqual(['mission', 'levelup']);
    expect(rewardPages(true, 4)).toEqual(['mission', 'levelup', 'loot']);
  });
  it('Masmorra limpa substitui o Espólio e não passa de 3 páginas', () => {
    expect(rewardPages(true, 4, true)).toEqual([
      'mission',
      'levelup',
      'dungeon',
    ]);
    expect(rewardPages(false, 0, true)).toEqual(['mission', 'dungeon']);
  });
});

describe('shareCardFields', () => {
  it('só passa a lista fechada de campos (C8)', () => {
    const fields = shareCardFields({
      level: 7,
      title: 'Veterano',
      workout: 'Treino A',
      xp: 120,
      boss: 'Caveira',
      // campos a mais que nunca podem vazar no cartão
      ...({ bodyweight: kg(80), location: 'SP', name: 'Fulano' } as object),
    });
    expect(Object.keys(fields).sort()).toEqual([
      'boss',
      'level',
      'title',
      'workout',
      'xp',
    ]);
  });
});
