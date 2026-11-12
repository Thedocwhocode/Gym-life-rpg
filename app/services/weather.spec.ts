import { describe, expect, it, vi } from 'vitest';
import {
  freshCache,
  loadWeather,
  parseOpenMeteo,
  roundCoord,
  SAO_PAULO,
  WEATHER_CACHE_MS,
  weatherFromCode,
  type WeatherDeps,
} from './weather';

const api = (code = 61, isDay = 1, wind = 10, temp = 21.6) => ({
  current: {
    weather_code: code,
    is_day: isDay,
    wind_speed_10m: wind,
    temperature_2m: temp,
  },
});

function deps(over: Partial<WeatherDeps> = {}): WeatherDeps {
  return {
    readCache: vi.fn(async () => undefined),
    writeCache: vi.fn(async () => undefined),
    locate: vi.fn(async () => undefined),
    fetchJson: vi.fn(async () => api()),
    now: () => 1_000_000,
    ...over,
  };
}

describe('weatherFromCode', () => {
  it.each([
    [95, true, 0, 'storm'],
    [99, false, 50, 'storm'],
    [71, true, 0, 'snow'],
    [86, true, 0, 'snow'],
    [51, true, 0, 'rain'],
    [82, true, 60, 'rain'],
    [45, true, 0, 'fog'],
    [3, true, 40, 'wind'],
    [0, true, 39.9, 'clear_day'],
    [3, true, 0, 'clouds'],
    [2, true, 0, 'few_clouds'],
    [0, false, 0, 'clear_night'],
  ] as const)('%i/%s/%i → %s', (code, isDay, wind, kind) => {
    expect(weatherFromCode(code, isDay, wind)).toBe(kind);
  });
});

describe('parseOpenMeteo e cache', () => {
  it('rejeita formato inesperado', () => {
    expect(parseOpenMeteo(null)).toBeUndefined();
    expect(parseOpenMeteo({ current: { weather_code: '3' } })).toBeUndefined();
    expect(parseOpenMeteo(api())).toEqual({
      code: 61,
      isDay: true,
      wind: 10,
      temp: 21.6,
    });
  });

  it('arredonda para 2 casas', () => {
    expect(roundCoord(-23.55678)).toBe(-23.56);
  });

  it('cache vale por 1 h e só com formato válido', () => {
    const raw = JSON.stringify({
      code: 0,
      isDay: true,
      wind: 1,
      temp: 20,
      at: 0,
      place: 'region',
    });
    expect(freshCache(raw, WEATHER_CACHE_MS - 1)?.place).toBe('region');
    expect(freshCache(raw, WEATHER_CACHE_MS)).toBeUndefined();
    expect(freshCache('{oops', 0)).toBeUndefined();
    expect(freshCache(JSON.stringify({ at: 0 }), 1)).toBeUndefined();
  });
});

describe('loadWeather', () => {
  it('permissão negada → São Paulo, rotulado como padrão', async () => {
    const d = deps();
    const s = await loadWeather(d);
    expect(s).toMatchObject({ status: 'ok', place: 'default' });
    expect(d.fetchJson).toHaveBeenCalledWith(
      expect.stringContaining(
        `latitude=${SAO_PAULO.lat}&longitude=${SAO_PAULO.lon}`,
      ),
    );
  });

  it('com posição, arredonda e não grava coordenadas no cache', async () => {
    const d = deps({
      locate: async () => ({ lat: -22.90642, lon: -43.18223 }),
    });
    const s = await loadWeather(d);
    expect(s).toMatchObject({ status: 'ok', place: 'region' });
    expect(d.fetchJson).toHaveBeenCalledWith(
      expect.stringContaining('latitude=-22.91&longitude=-43.18'),
    );
    const saved = vi.mocked(d.writeCache).mock.calls[0][0];
    expect(saved).not.toContain('-22.9');
    expect(saved).not.toContain('-43.1');
  });

  it('offline → estado offline, sem dado falso e sem gravar cache', async () => {
    const d = deps({
      fetchJson: async () => {
        throw new TypeError('Failed to fetch');
      },
    });
    expect(await loadWeather(d)).toEqual({
      status: 'offline',
      place: 'default',
    });
    expect(d.writeCache).not.toHaveBeenCalled();
  });

  it('localização que falha cai no padrão', async () => {
    const d = deps({
      locate: async () => {
        throw new Error('timeout');
      },
    });
    expect(await loadWeather(d)).toMatchObject({ place: 'default' });
  });

  it('cache fresco evita a rede; force ignora o cache', async () => {
    const raw = JSON.stringify({
      code: 3,
      isDay: true,
      wind: 5,
      temp: 18,
      at: 999_000,
      place: 'region',
    });
    const d = deps({ readCache: async () => raw });
    expect(await loadWeather(d)).toMatchObject({
      status: 'ok',
      place: 'region',
      reading: { code: 3 },
    });
    expect(d.fetchJson).not.toHaveBeenCalled();
    await loadWeather(d, { force: true });
    expect(d.fetchJson).toHaveBeenCalledOnce();
  });

  it('falha ao gravar o cache não derruba a leitura', async () => {
    const d = deps({
      writeCache: async () => {
        throw new Error('quota');
      },
    });
    expect(await loadWeather(d)).toMatchObject({ status: 'ok' });
  });
});
