import { describe, expect, it } from 'vitest';
import legacy from './__fixtures__/rpg-state-v0.json';
import { CHOICES_KEY, LEGACY_RPG_KEY, loadChoices } from './migrate';

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
