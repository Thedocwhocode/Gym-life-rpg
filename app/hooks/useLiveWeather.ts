import { useServices } from '@/components/smart/services-provider';
import {
  loadWeather,
  WEATHER_CACHE_KEY,
  type WeatherDeps,
  type WeatherState,
} from '@/services/weather';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';

const LOCATE_TIMEOUT_MS = 2500;
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

/** Só lê a posição se a permissão já foi dada; nunca pede no boot. */
async function locateIfAllowed() {
  const { granted } = await Location.getForegroundPermissionsAsync();
  if (!granted) return undefined;
  const pos =
    (await Location.getLastKnownPositionAsync({
      maxAge: LAST_KNOWN_MAX_AGE_MS,
    })) ??
    (await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      new Promise<null>((r) => setTimeout(() => r(null), LOCATE_TIMEOUT_MS)),
    ]));
  return pos
    ? { lat: pos.coords.latitude, lon: pos.coords.longitude }
    : undefined;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return res.json();
}

/** Leitura do clima ao montar; `refresh` pede a localização (só no toque) e lê de novo. */
export function useLiveWeather() {
  const { keyValueStore } = useServices();
  const [state, setState] = useState<WeatherState>({ status: 'loading' });
  const deps = useMemo<WeatherDeps>(
    () => ({
      readCache: () => keyValueStore.getItem(WEATHER_CACHE_KEY),
      writeCache: (v) => keyValueStore.setItem(WEATHER_CACHE_KEY, v),
      locate: locateIfAllowed,
      fetchJson,
      now: Date.now,
    }),
    [keyValueStore],
  );

  useEffect(() => {
    let alive = true;
    void loadWeather(deps).then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, [deps]);

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    await Location.requestForegroundPermissionsAsync().catch(() => undefined);
    setState(await loadWeather(deps, { force: true }));
  }, [deps]);

  return { state, refresh };
}
