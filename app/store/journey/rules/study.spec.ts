import { deriveAttributes } from '@/store/rpg/derive';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import {
  clock,
  MAX_STUDY_MINUTES_PER_DAY,
  pauseTimer,
  phaseMs,
  resumeTimer,
  startFocus,
  studyFacts,
  studyMinutesOn,
  tickTimer,
  timerLeft,
  withStudyMinutes,
} from './study';

describe('estudo → INT', () => {
  it('soma minutos no mesmo dia sem mutar e mantém a ordem', () => {
    const a = withStudyMinutes([], '2026-11-03', 25);
    const b = withStudyMinutes(a, '2026-11-03', 25);
    const c = withStudyMinutes(b, '2026-11-01', 50);
    expect(a).toEqual([{ date: '2026-11-03', minutes: 25 }]);
    expect(c).toEqual([
      { date: '2026-11-01', minutes: 50 },
      { date: '2026-11-03', minutes: 50 },
    ]);
    expect(studyMinutesOn(c, '2026-11-03')).toBe(50);
    expect(studyMinutesOn(c, '2026-11-02')).toBe(0);
  });

  it('ignora negativo e respeita o teto do dia', () => {
    expect(withStudyMinutes([], '2026-11-03', -10)).toEqual([
      { date: '2026-11-03', minutes: 0 },
    ]);
    expect(
      withStudyMinutes(
        [{ date: '2026-11-03', minutes: 1430 }],
        '2026-11-03',
        50,
      ),
    ).toEqual([{ date: '2026-11-03', minutes: MAX_STUDY_MINUTES_PER_DAY }]);
  });

  it('25 min de foco valem 12,5 de INT (12 na ficha)', () => {
    const today = LocalDate.parse('2026-11-03');
    const attrs = deriveAttributes(
      studyFacts([{ date: '2026-11-03', minutes: 25 }]),
      today,
    );
    expect(attrs.INT).toEqual({ total: 12, week: 12.5 });
    expect(attrs.STR.total).toBe(0);
  });

  it('relógio mm:ss arredonda para cima e não fica negativo', () => {
    expect(clock(25 * 60_000)).toBe('25:00');
    expect(clock(59_001)).toBe('01:00');
    expect(clock(-5)).toBe('00:00');
  });
});

describe('relógio do pomodoro', () => {
  const t0 = 1_000_000;
  const M = 60_000;

  it('foco completo rende os minutos e abre a pausa; pausa termina em repouso', () => {
    const s = startFocus('short', t0);
    expect(tickTimer(s, t0 + 24 * M).earned).toBe(0);
    const end = tickTimer(s, t0 + 25 * M);
    expect(end.earned).toBe(25);
    expect(end.next.phase).toBe('rest');
    expect(timerLeft(end.next, t0 + 25 * M)).toBe(5 * M);
    const rest = tickTimer(end.next, t0 + 30 * M);
    expect(rest).toEqual({
      next: { phase: 'idle', preset: 'short' },
      earned: 0,
      restDone: true,
    });
  });

  it('pausado não corre nem rende; retomar continua de onde parou', () => {
    const s = pauseTimer(startFocus('long', t0), t0 + 10 * M);
    expect(timerLeft(s, t0 + 999 * M)).toBe(40 * M);
    expect(tickTimer(s, t0 + 999 * M).earned).toBe(0);
    const r = resumeTimer(s, t0 + 100 * M);
    expect(tickTimer(r, t0 + 139 * M).earned).toBe(0);
    expect(tickTimer(r, t0 + 140 * M).earned).toBe(50);
    expect(phaseMs(r)).toBe(50 * M);
  });
});
