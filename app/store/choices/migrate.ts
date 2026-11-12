import type { Choices, RpgClass } from './index';

export const CHOICES_KEY = 'Choices';
/** Chave do estado RPG antigo (persistia XP, quests etc.). Só a classe sobrevive. */
export const LEGACY_RPG_KEY = 'RpgState';

const CLASSES: readonly RpgClass[] = ['warrior', 'scout', 'paladin'];

interface Kv {
  getItem(key: string): Promise<string | undefined>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function parse(raw: string | undefined): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object'
      ? (v as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function pick(obj: Record<string, unknown> | undefined): Choices {
  const c = obj?.['rpgClass'];
  return CLASSES.includes(c as RpgClass) ? { rpgClass: c as RpgClass } : {};
}

/**
 * Lê as escolhas; na primeira vez, tira a classe do `RpgState` antigo, grava `Choices`
 * e só então apaga o `RpgState` (se a gravação falhar, a chave antiga fica para a próxima).
 */
export async function loadChoices(kv: Kv): Promise<Choices> {
  const current = await kv.getItem(CHOICES_KEY);
  if (current !== undefined) return pick(parse(current));
  const legacyRaw = await kv.getItem(LEGACY_RPG_KEY);
  if (legacyRaw === undefined) return {};
  const choices = pick(parse(legacyRaw));
  await kv.setItem(CHOICES_KEY, JSON.stringify(choices));
  await kv.removeItem(LEGACY_RPG_KEY);
  return choices;
}
