import type { Dated } from '@/store/journey/rules/dated';
import type { Choices, RpgClass } from './index';

export const CHOICES_KEY = 'Choices';
/** Chave do estado RPG antigo (persistia XP, quests etc.). Só a classe sobrevive. */
export const LEGACY_RPG_KEY = 'RpgState';
/** Antes de qualquer sessão: a classe escolhida antes da F6 vale para todo o histórico. */
export const ALWAYS = '1970-01-01';

const CLASSES: readonly RpgClass[] = ['warrior', 'scout', 'paladin'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

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

const isDay = (v: unknown): v is string => typeof v === 'string' && DAY.test(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && !!v;
const isClass = (v: unknown): v is RpgClass => CLASSES.includes(v as RpgClass);
const isDays = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((d) => Number.isInteger(d) && d >= 1 && d <= 7);
const isStrs = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isStr);

/** Lista datada válida, em ordem; item quebrado é descartado (dado vindo de disco ou backup). */
function datedList<T>(
  v: unknown,
  ok: (x: unknown) => x is T,
): Dated<T>[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = (v as unknown[])
    .filter((x): x is Dated<T> => {
      const o = x as Partial<Record<'since' | 'value', unknown>> | null;
      return !!o && typeof o === 'object' && isDay(o.since) && ok(o.value);
    })
    .map((x) => ({ since: x.since, value: x.value }))
    .sort((a, b) => (a.since < b.since ? -1 : a.since > b.since ? 1 : 0));
  return list.length ? list : undefined;
}

/** Valida campo a campo; o que não passar some (nunca derruba a hidratação). */
export function pick(obj: Record<string, unknown> | undefined): Choices {
  const o = obj ?? {};
  const out: Choices = {};
  if (isClass(o['rpgClass'])) out.rpgClass = o['rpgClass'];
  if (o['aiDataNoticeAccepted'] === true) out.aiDataNoticeAccepted = true;
  const lists = {
    classHistory: datedList(o['classHistory'], isClass),
    trainingDays: datedList(o['trainingDays'], isDays),
    skillEquipped: datedList(o['skillEquipped'], isStr),
    itemsEquipped: datedList(o['itemsEquipped'], isStrs),
    skillsLearned: datedList(o['skillsLearned'], isStr),
  };
  for (const [k, v] of Object.entries(lists))
    if (v) (out as Record<string, unknown>)[k] = v;
  for (const k of ['multiplicadoresDesde', 'coracoesDesde'] as const)
    if (isDay(o[k])) out[k] = o[k];
  if (typeof o['chronicleSeenWeek'] === 'string')
    out.chronicleSeenWeek = o['chronicleSeenWeek'];
  if (Number.isInteger(o['heartsSeenMissed']))
    out.heartsSeenMissed = o['heartsSeenMissed'] as number;
  if (o['journeyIntroSeen'] === true) out.journeyIntroSeen = true;
  return out;
}

/**
 * F6: classe vira histórico datado (a de antes vale para tudo) e as regras novas ganham o seu
 * "desde" no dia da migração, para o XP passado ficar intacto (DR8, DR11).
 */
export function withJourneyDefaults(c: Choices, today: string): Choices {
  const classHistory =
    c.classHistory ??
    (c.rpgClass ? [{ since: ALWAYS, value: c.rpgClass }] : undefined);
  return {
    ...c,
    ...(classHistory
      ? { classHistory, rpgClass: classHistory.at(-1)!.value }
      : {}),
    multiplicadoresDesde: c.multiplicadoresDesde ?? today,
    coracoesDesde: c.coracoesDesde ?? today,
  };
}

/**
 * Lê as escolhas; na primeira vez, tira a classe do `RpgState` antigo, grava `Choices`
 * e só então apaga o `RpgState` (se a gravação falhar, a chave antiga fica para a próxima).
 * Com `today`, completa os campos da F6 e grava se algo mudou.
 */
export async function loadChoices(kv: Kv, today?: string): Promise<Choices> {
  const current = await kv.getItem(CHOICES_KEY);
  let choices: Choices;
  if (current !== undefined) {
    choices = pick(parse(current));
  } else {
    const legacyRaw = await kv.getItem(LEGACY_RPG_KEY);
    if (legacyRaw === undefined && !today) return {};
    choices = pick(parse(legacyRaw));
    if (legacyRaw !== undefined) {
      await kv.setItem(CHOICES_KEY, JSON.stringify(choices));
      await kv.removeItem(LEGACY_RPG_KEY);
    }
  }
  if (!today) return choices;
  const full = withJourneyDefaults(choices, today);
  if (JSON.stringify(full) !== JSON.stringify(choices))
    await kv.setItem(CHOICES_KEY, JSON.stringify(full));
  return full;
}
