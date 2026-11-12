import { describe, expect, it } from 'vitest';
import {
  choicesReducer,
  equipItem,
  learnSkill,
  setRpgClass,
  setTrainingDays,
  unequipItem,
  type ChoicesState,
} from './index';

const at = <A extends { payload: { since: string } }>(a: A, since: string) => ({
  ...a,
  payload: { ...a.payload, since },
});
const run = (...actions: { type: string }[]) =>
  actions.reduce<ChoicesState>((s, a) => choicesReducer(s, a), {
    isHydrated: true,
  });

describe('choices (escolhas datadas da F6)', () => {
  it('trocar de classe guarda o histórico e a classe atual', () => {
    const s = run(
      at(setRpgClass('warrior'), '2026-11-01'),
      at(setRpgClass('scout'), '2026-11-05'),
      at(setRpgClass('paladin'), '2026-11-05'),
    );
    expect(s.rpgClass).toBe('paladin');
    expect(s.classHistory).toEqual([
      { since: '2026-11-01', value: 'warrior' },
      { since: '2026-11-05', value: 'paladin' },
    ]);
  });

  it('dias de treino sem repetição, de 1 a 7 e em ordem', () => {
    const s = run(at(setTrainingDays([5, 1, 3, 3, 9]), '2026-11-02'));
    expect(s.trainingDays).toEqual([{ since: '2026-11-02', value: [1, 3, 5] }]);
  });

  it('equipar troca o item do slot; desequipar tira', () => {
    const s = run(
      at(equipItem('capuz-noite'), '2026-11-01'),
      at(equipItem('botas-couro'), '2026-11-01'),
      at(equipItem('elmo-chamuscado'), '2026-11-03'),
      at(unequipItem('botas-couro'), '2026-11-04'),
    );
    expect(s.itemsEquipped).toEqual([
      { since: '2026-11-01', value: ['capuz-noite', 'botas-couro'] },
      { since: '2026-11-03', value: ['botas-couro', 'elmo-chamuscado'] },
      { since: '2026-11-04', value: ['elmo-chamuscado'] },
    ]);
  });

  it('aprender a mesma skill duas vezes não duplica', () => {
    const s = run(
      at(learnSkill('cruzado'), '2026-11-01'),
      at(learnSkill('cruzado'), '2026-11-08'),
    );
    expect(s.skillsLearned).toEqual([
      { since: '2026-11-01', value: 'cruzado' },
    ]);
  });
});
