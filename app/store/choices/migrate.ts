import type { Dated } from '@/store/journey/rules/dated';
import {
  DAILY_ITEMS,
  type DailyCounts,
  type DailyEntry,
} from '@/store/journey/rules/daily';
import {
  MAX_STUDY_MINUTES_PER_DAY,
  type StudyEntry,
} from '@/store/journey/rules/study';
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

function counts(v: unknown): DailyCounts | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const out: DailyCounts = {};
  for (const k of DAILY_ITEMS) {
    const n = o[k];
    if (typeof n === 'number' && Number.isFinite(n) && n >= 0)
      out[k] = Math.round(n);
  }
  return out;
}

/** Log da missão diária: um registro válido por dia, em ordem. */
function dailyLog(v: unknown): DailyEntry[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const byDate = new Map<string, DailyEntry>();
  for (const x of v as unknown[]) {
    const o = (x ?? {}) as Record<string, unknown>;
    const date = o['date'];
    const done = counts(o['done']);
    if (!isDay(date) || !done) continue;
    const recovery = counts(o['recovery']);
    byDate.set(date, { date, done, ...(recovery && { recovery }) });
  }
  const list = [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
  return list.length ? list : undefined;
}

/** Log do estudo: um registro por dia, minutos inteiros entre 1 e o teto do dia. */
function studyLog(v: unknown): StudyEntry[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const byDate = new Map<string, StudyEntry>();
  for (const x of v as unknown[]) {
    const o = (x ?? {}) as Record<string, unknown>;
    const date = o['date'];
    const m = o['minutes'];
    if (!isDay(date) || typeof m !== 'number' || !Number.isFinite(m)) continue;
    const minutes = Math.min(MAX_STUDY_MINUTES_PER_DAY, Math.round(m));
    if (minutes > 0) byDate.set(date, { date, minutes });
  }
  const list = [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
  return list.length ? list : undefined;
}

/** Valida campo a campo; o que não passar some (nunca derruba a hidratação). */
export function pick(obj: Record<string, unknown> | undefined): Choices {
  const o = obj ?? {};
  const out: Choices = {};
  if (isClass(o['rpgClass'])) out.rpgClass = o['rpgClass'];
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
  const daily = dailyLog(o['dailyLog']);
  if (daily) out.dailyLog = daily;
  const study = studyLog(o['studyLog']);
  if (study) out.studyLog = study;
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

/** Backup (campo `choices_json`): grava só as escolhas, sem o estado de tela. */
export function choicesToJson(state: Choices & { isHydrated?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isHydrated, ...choices } = state;
  return JSON.stringify(choices);
}

/** Restore: valida o JSON do backup e completa os "desde" com o dia do restore. */
export const choicesFromJson = (json: string, today: string): Choices =>
  withJourneyDefaults(pick(parse(json)), today);
