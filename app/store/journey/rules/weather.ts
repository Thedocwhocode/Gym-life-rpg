import type { WeatherKind } from '@/services/weather';
import type { AttrKey, AttrWeights } from './attributes';

export const WEATHER_KINDS: readonly WeatherKind[] = [
  'storm',
  'snow',
  'rain',
  'fog',
  'wind',
  'clouds',
  'few_clouds',
  'clear_day',
  'clear_night',
];

/** Clima do dia gravado na primeira leitura (real ou simulada): é o que o XP daquele dia usa. */
export interface WeatherEntry {
  date: string;
  kind: WeatherKind;
}

/**
 * Modificadores do design v1.2 (WeatherBanner.jsx). `xp` = % no XP da sessão (entra nas fontes
 * do DR11, com o mesmo teto); `cardioOnly` = só vale com cardio concluído; `attr` = % no XP
 * daquele atributo. Neblina e nuvens não mexem em número.
 */
export const WEATHER_MODS: Record<
  WeatherKind,
  { xp?: number; cardioOnly?: boolean; attr?: [AttrKey, number] }
> = {
  storm: { xp: 15 },
  rain: { xp: 10 },
  clear_night: { xp: 5 },
  clear_day: { xp: 5, cardioOnly: true },
  snow: { attr: ['END', 10] },
  wind: { attr: ['AGI', 5] },
  fog: {},
  clouds: {},
  few_clouds: {},
};

/** % do clima no XP da sessão (0 quando não vale). */
export function weatherPct(kind: WeatherKind | undefined, cardio: number) {
  const m = kind && WEATHER_MODS[kind];
  if (!m?.xp || (m.cardioOnly && cardio <= 0)) return 0;
  return m.xp;
}

/** XP de atributo com o bônus do clima do dia (neve: END; ventania: AGI). */
export function withWeatherAttrs(
  xp: AttrWeights,
  kind: WeatherKind | undefined,
): AttrWeights {
  const bonus = kind && WEATHER_MODS[kind].attr;
  if (!bonus || !xp[bonus[0]]) return xp;
  const [k, pct] = bonus;
  return { ...xp, [k]: ((xp[k] ?? 0) * (100 + pct)) / 100 };
}

/** Grava o clima do dia só se ainda não houver: a primeira leitura vence. */
export function withWeather(
  log: readonly WeatherEntry[],
  date: string,
  kind: WeatherKind,
): WeatherEntry[] {
  return log.some((e) => e.date === date)
    ? [...log]
    : [...log, { date, kind }].sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
      );
}

export const weatherOn = (
  log: readonly WeatherEntry[] | undefined,
  date: string,
) => log?.find((e) => e.date === date)?.kind;
