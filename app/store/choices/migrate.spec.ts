import { describe, expect, it } from 'vitest';
import legacy from './__fixtures__/rpg-state-v0.json';
import {
  ALWAYS,
  CHOICES_KEY,
  LEGACY_RPG_KEY,
  loadChoices,
  pick,
  withJourneyDefaults,
} from './migrate';

function memoryKv(init: Record<string, string>, failSet = false) {
  const data = new Map(Object.entries(init));
  return {
    data,
    getItem: async (k: string) => data.get(k),
    setItem: async (k: string, v: string) => {
      if (failSet) throw new Error('disco cheio');
      data.set(k, v);
    },
    removeItem: async (k: string) => {
      data.delete(k);
    },
  };
}

describe('loadChoices (migração do RpgState)', () => {
  it('mantém a classe do snapshot antigo, grava Choices e apaga RpgState', async () => {
    const kv = memoryKv({ [LEGACY_RPG_KEY]: JSON.stringify(legacy) });
    expect(await loadChoices(kv)).toEqual({ rpgClass: 'paladin' });
    expect(JSON.parse(kv.data.get(CHOICES_KEY)!)).toEqual({
      rpgClass: 'paladin',
    });
    expect(kv.data.has(LEGACY_RPG_KEY)).toBe(false);
  });

  it('lembra o aceite do aviso LGPD da IA', async () => {
    const kv = memoryKv({
      [CHOICES_KEY]: JSON.stringify({ aiDataNoticeAccepted: true }),
    });
    expect(await loadChoices(kv)).toEqual({ aiDataNoticeAccepted: true });
  });

  it('se a gravação falhar, não apaga o RpgState', async () => {
    const kv = memoryKv({ [LEGACY_RPG_KEY]: JSON.stringify(legacy) }, true);
    await expect(loadChoices(kv)).rejects.toThrow();
    expect(kv.data.has(LEGACY_RPG_KEY)).toBe(true);
  });

  it('Choices já gravado vence e o RpgState não é lido', async () => {
    const kv = memoryKv({
      [CHOICES_KEY]: JSON.stringify({ rpgClass: 'scout' }),
      [LEGACY_RPG_KEY]: JSON.stringify(legacy),
    });
    expect(await loadChoices(kv)).toEqual({ rpgClass: 'scout' });
  });

  it('sem classe, classe inválida ou JSON quebrado viram escolhas vazias', async () => {
    expect(await loadChoices(memoryKv({}))).toEqual({});
    expect(
      await loadChoices(memoryKv({ [LEGACY_RPG_KEY]: '{"rpgClass":"mago"}' })),
    ).toEqual({});
    const kv = memoryKv({ [LEGACY_RPG_KEY]: '{quebrado' });
    expect(await loadChoices(kv)).toEqual({});
    expect(kv.data.has(LEGACY_RPG_KEY)).toBe(false);
  });
});

describe('F6: escolhas datadas', () => {
  const TODAY = '2026-11-10';

  it('classe antiga vale para todo o histórico; regras novas começam hoje', () => {
    expect(withJourneyDefaults({ rpgClass: 'scout' }, TODAY)).toEqual({
      rpgClass: 'scout',
      classHistory: [{ since: ALWAYS, value: 'scout' }],
      multiplicadoresDesde: TODAY,
      coracoesDesde: TODAY,
    });
  });

  it('não mexe no que já existe e espelha a classe do histórico', () => {
    const c = withJourneyDefaults(
      {
        rpgClass: 'scout',
        classHistory: [{ since: '2026-11-01', value: 'paladin' }],
        multiplicadoresDesde: '2026-11-01',
        coracoesDesde: '2026-11-02',
      },
      TODAY,
    );
    expect(c).toMatchObject({
      rpgClass: 'paladin',
      multiplicadoresDesde: '2026-11-01',
      coracoesDesde: '2026-11-02',
    });
  });

  it('com today, a 1ª carga grava os campos novos (só uma vez)', async () => {
    const kv = memoryKv({ [LEGACY_RPG_KEY]: JSON.stringify(legacy) });
    const first = await loadChoices(kv, TODAY);
    expect(first.classHistory).toEqual([{ since: ALWAYS, value: 'paladin' }]);
    expect(JSON.parse(kv.data.get(CHOICES_KEY)!)).toEqual(first);
    expect(await loadChoices(kv, '2026-12-01')).toEqual(first);

    const fresh = memoryKv({});
    expect(await loadChoices(fresh, TODAY)).toEqual({
      multiplicadoresDesde: TODAY,
      coracoesDesde: TODAY,
    });
  });

  it('pick descarta item datado inválido e ordena por data', () => {
    expect(
      pick({
        trainingDays: [
          { since: '2026-11-05', value: [1, 3] },
          { since: 'ontem', value: [2] },
          { since: '2026-11-01', value: [9] },
          { since: '2026-11-02', value: [2, 4] },
        ],
        itemsEquipped: 'quebrado',
        skillsLearned: [{ since: '2026-11-02', value: 'cruzado' }],
        multiplicadoresDesde: '10/11/2026',
        heartsSeenMissed: 2,
        journeyIntroSeen: true,
      }),
    ).toEqual({
      trainingDays: [
        { since: '2026-11-02', value: [2, 4] },
        { since: '2026-11-05', value: [1, 3] },
      ],
      skillsLearned: [{ since: '2026-11-02', value: 'cruzado' }],
      heartsSeenMissed: 2,
      journeyIntroSeen: true,
    });
  });
});
