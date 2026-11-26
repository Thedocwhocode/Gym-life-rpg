import { pick } from '@/store/choices/migrate';
import { describe, expect, it } from 'vitest';
import { totalPct, xpSources } from './multipliers';
import {
  weatherOn,
  weatherPct,
  withWeather,
  withWeatherAttrs,
} from './weather';

const base = {
  sets: 3,
  cardio: 0,
  rpgClass: undefined,
  skill: undefined,
  items: [],
  statuses: [],
};

describe('clima do dia → XP', () => {
  it('chuva e tempestade somam nas fontes; céu limpo só com cardio', () => {
    expect(xpSources({ ...base, weather: 'rain' })).toEqual([
      { source: 'weather', id: 'rain', pct: 10 },
    ]);
    expect(totalPct(xpSources({ ...base, weather: 'storm' }))).toBe(15);
    expect(xpSources({ ...base, weather: 'clear_day' })).toEqual([]);
    expect(weatherPct('clear_day', 1)).toBe(5);
    expect(xpSources({ ...base, weather: 'fog' })).toEqual([]);
    expect(xpSources(base)).toEqual([]);
  });

  it('neve dá END e ventania dá AGI, só se o atributo já ganhou algo', () => {
    expect(withWeatherAttrs({ END: 10, STR: 5 }, 'snow')).toEqual({
      END: 11,
      STR: 5,
    });
    expect(withWeatherAttrs({ AGI: 20 }, 'wind')).toEqual({ AGI: 21 });
    expect(withWeatherAttrs({ STR: 5 }, 'snow')).toEqual({ STR: 5 });
    expect(withWeatherAttrs({ STR: 5 }, 'rain')).toEqual({ STR: 5 });
  });

  it('a primeira leitura do dia vence e o log fica em ordem', () => {
    let log = withWeather([], '2026-11-26', 'rain');
    log = withWeather(log, '2026-11-26', 'clear_day');
    log = withWeather(log, '2026-11-25', 'storm');
    expect(log).toEqual([
      { date: '2026-11-25', kind: 'storm' },
      { date: '2026-11-26', kind: 'rain' },
    ]);
    expect(weatherOn(log, '2026-11-26')).toBe('rain');
    expect(weatherOn(undefined, '2026-11-26')).toBeUndefined();
  });

  it('pick valida o log do clima (dia válido, tipo conhecido, um por dia)', () => {
    expect(
      pick({
        weatherLog: [
          { date: '2026-11-26', kind: 'rain' },
          { date: '2026-11-26', kind: 'storm' },
          { date: '2026-11-20', kind: 'tornado' },
          { date: 'ontem', kind: 'snow' },
          { date: '2026-11-01', kind: 'snow' },
        ],
      }),
    ).toEqual({
      weatherLog: [
        { date: '2026-11-01', kind: 'snow' },
        { date: '2026-11-26', kind: 'rain' },
      ],
    });
    expect(pick({ weatherLog: 'x' })).toEqual({});
  });
});
