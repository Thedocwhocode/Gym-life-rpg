import { useLiveWeather } from '@/hooks/useLiveWeather';
import { useAppSelector } from '@/store';
import { recordWeather } from '@/store/choices';
import { weatherFromCode } from '@/services/weather';
import { LocalDate } from '@js-joda/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Sem UI, na raiz: grava o clima do dia ao abrir o app, para a sessão de hoje já ter o
 * modificador mesmo sem passar pelo Painel. Só depois da hidratação, que troca o estado inteiro.
 */
export function WeatherRecorder() {
  const { state } = useLiveWeather();
  const hydrated = useAppSelector((s) => s.choices.isHydrated);
  const dispatch = useDispatch();
  const kind =
    state.status === 'ok'
      ? weatherFromCode(
          state.reading.code,
          state.reading.isDay,
          state.reading.wind,
        )
      : undefined;
  useEffect(() => {
    if (hydrated && kind)
      dispatch(recordWeather({ date: LocalDate.now().toString(), kind }));
  }, [dispatch, hydrated, kind]);
  return null;
}
