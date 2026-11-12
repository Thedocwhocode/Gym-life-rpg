import { LocalDate } from '@js-joda/core';

/** Escolha datada (§3.7): vale a partir de `since` (YYYY-MM-DD, data local) até a próxima. */
export interface Dated<T> {
  since: string;
  value: T;
}

/** Valor vigente no dia `day`; undefined antes da primeira escolha. */
export function valueAt<T>(
  list: readonly Dated<T>[] | undefined,
  day: LocalDate | string,
): T | undefined {
  const key = day.toString();
  let found: T | undefined;
  for (const c of list ?? []) if (c.since <= key) found = c.value;
  return found;
}

/** Acrescenta a escolha de hoje; outra escolha no mesmo dia substitui a anterior. */
export function choose<T>(
  list: readonly Dated<T>[] | undefined,
  since: string,
  value: T,
): Dated<T>[] {
  return [...(list ?? []).filter((c) => c.since < since), { since, value }];
}
