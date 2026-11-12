import type { FxId } from '@/components/presentation/fx/registry';

/** Clima do reino (F7, design-spec D.3). Só visual: nunca entra no XP (D8). */
export type WeatherKind =
  | 'storm'
  | 'snow'
  | 'rain'
  | 'fog'
  | 'wind'
  | 'clouds'
  | 'few_clouds'
  | 'clear_day'
  | 'clear_night';

export interface WeatherReading {
  code: number;
  isDay: boolean;
  /** km/h, padrão do Open-Meteo. */
  wind: number;
  temp: number;
}

/** `region` = posição do aparelho; `default` = São Paulo. */
export type WeatherPlace = 'region' | 'default';

export type WeatherState =
  | { status: 'loading' }
  | { status: 'ok'; reading: WeatherReading; place: WeatherPlace }
  | { status: 'offline'; place: WeatherPlace };

export const SAO_PAULO = { lat: -23.55, lon: -46.63 };
export const WEATHER_CACHE_KEY = 'weather-cache';
export const WEATHER_CACHE_MS = 60 * 60 * 1000;

export const WEATHER_FX: Record<WeatherKind, FxId> = {
  storm: 'weather/storm',
  snow: 'weather/snow',
  rain: 'weather/rain',
  fog: 'weather/fog',
  wind: 'weather/falling-leaves',
  clouds: 'weather/clouds',
  few_clouds: 'weather/clouds',
  clear_day: 'weather/god-rays',
  clear_night: 'weather/shooting-stars',
};

/** A primeira condição verdadeira vence; o vento vem antes das nuvens. */
export function weatherFromCode(
  code: number,
  isDay: boolean,
  wind: number,
): WeatherKind {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (wind >= 40) return 'wind';
  if (code === 3) return 'clouds';
  if (code === 1 || code === 2) return 'few_clouds';
  return isDay ? 'clear_day' : 'clear_night';
}

/** Localização aproximada: 2 casas (~1 km). */
export const roundCoord = (n: number) => Math.round(n * 100) / 100;

export const openMeteoUrl = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  '&current=temperature_2m,weather_code,is_day,wind_speed_10m';

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Resposta externa: só aceita o formato esperado. */
export function parseOpenMeteo(json: unknown): WeatherReading | undefined {
  const c = (json as { current?: Record<string, unknown> } | null)?.current;
  if (!c) return undefined;
  const { weather_code, is_day, wind_speed_10m, temperature_2m } = c;
  if (![weather_code, is_day, wind_speed_10m, temperature_2m].every(isNum))
    return undefined;
  return {
    code: weather_code as number,
    isDay: is_day === 1,
    wind: wind_speed_10m as number,
    temp: temperature_2m as number,
  };
}

interface WeatherCache extends WeatherReading {
  at: number;
  place: WeatherPlace;
}

/** O cache guarda a leitura e o tipo de lugar, nunca as coordenadas. */
export function freshCache(
  raw: string | undefined,
  now: number,
): WeatherCache | undefined {
  if (!raw) return undefined;
  try {
    const c = JSON.parse(raw) as WeatherCache;
    const reading = parseOpenMeteo({
      current: {
        weather_code: c.code,
        is_day: c.isDay ? 1 : 0,
        wind_speed_10m: c.wind,
        temperature_2m: c.temp,
      },
    });
    const ok =
      reading &&
      isNum(c.at) &&
      now - c.at >= 0 &&
      now - c.at < WEATHER_CACHE_MS &&
      (c.place === 'region' || c.place === 'default');
    return ok ? c : undefined;
  } catch {
    return undefined;
  }
}

export interface WeatherDeps {
  readCache(): Promise<string | undefined>;
  writeCache(value: string): Promise<void>;
  /** `undefined` = sem permissão, sem sinal ou tempo esgotado. */
  locate(): Promise<{ lat: number; lon: number } | undefined>;
  fetchJson(url: string): Promise<unknown>;
  now(): number;
}

/** Uma leitura por abertura: cache de 1 h, fallback São Paulo, offline sem dado falso (DR7). */
export async function loadWeather(
  deps: WeatherDeps,
  { force = false }: { force?: boolean } = {},
): Promise<WeatherState> {
  if (!force) {
    const cached = freshCache(
      await deps.readCache().catch(() => undefined),
      deps.now(),
    );
    if (cached) {
      const { at: _at, place, ...reading } = cached;
      return { status: 'ok', reading, place };
    }
  }
  const pos = await deps.locate().catch(() => undefined);
  const place: WeatherPlace = pos ? 'region' : 'default';
  const { lat, lon } = pos
    ? { lat: roundCoord(pos.lat), lon: roundCoord(pos.lon) }
    : SAO_PAULO;
  const reading = parseOpenMeteo(
    await deps.fetchJson(openMeteoUrl(lat, lon)).catch(() => undefined),
  );
  if (!reading) return { status: 'offline', place };
  const cache: WeatherCache = { ...reading, at: deps.now(), place };
  await deps.writeCache(JSON.stringify(cache)).catch(() => undefined);
  return { status: 'ok', reading, place };
}
