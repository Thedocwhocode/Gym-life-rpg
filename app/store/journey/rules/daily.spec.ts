import {
  dailyHistory,
  dailyState,
  recoveryTargets,
  targetsFor,
  withDailyCount,
  type DailyEntry,
} from '@/store/journey/rules/daily';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';

const day = (iso: string) => LocalDate.parse(iso);
const full = (date: string, pushups = 10, squats = 10, run = 500) => ({
  date,
  done: { pushups, squats, run },
});
// 2026-11-02 é segunda-feira.
const weekOf = (monday: string, days: number, t = [10, 10, 500]) =>
  Array.from({ length: days }, (_, i) =>
    full(day(monday).plusDays(i).toString(), t[0], t[1], t[2]),
  );

describe('targetsFor', () => {
  it('começa em 10/10/500 e sobe 10% por semana, arredondando para cima', () => {
    expect(targetsFor(0)).toEqual({ pushups: 10, squats: 10, run: 500 });
    expect(targetsFor(1)).toEqual({ pushups: 11, squats: 11, run: 550 });
    // 10 × 1,21 = 12,1 → 13; 500 × 1,21 = 605 → 650.
    expect(targetsFor(2)).toEqual({ pushups: 13, squats: 13, run: 650 });
  });
});

describe('dailyState', () => {
  it('só sobe a meta depois de uma semana com 5 de 7 dias', () => {
    const quatro = weekOf('2026-11-02', 4);
    expect(dailyState(quatro, day('2026-11-10')).targets.pushups).toBe(10);
    const cinco = weekOf('2026-11-02', 5);
    const s = dailyState(cinco, day('2026-11-10'));
    expect(s.weeks).toBe(1);
    expect(s.targets).toEqual({ pushups: 11, squats: 11, run: 550 });
  });

  it('a semana atual não sobe a meta no meio dela', () => {
    expect(
      dailyState(weekOf('2026-11-02', 6), day('2026-11-07')).targets.pushups,
    ).toBe(10);
  });

  it('na segunda semana conta a meta nova: 10 flexões não bastam mais', () => {
    const log = [...weekOf('2026-11-02', 5), ...weekOf('2026-11-09', 5)];
    expect(dailyState(log, day('2026-11-17')).weeks).toBe(1);
  });

  it('conta o streak até hoje, ou até ontem se hoje ainda está aberto', () => {
    const log = weekOf('2026-11-02', 3);
    expect(dailyState(log, day('2026-11-04')).streak).toBe(3);
    expect(dailyState(log, day('2026-11-05')).streak).toBe(3);
    expect(dailyState(log, day('2026-11-06')).streak).toBe(0);
  });

  it('dia incompleto com streak antes abre a recuperação com metade do que faltou', () => {
    const log: DailyEntry[] = [
      ...weekOf('2026-11-02', 2),
      { date: '2026-11-04', done: { pushups: 4, squats: 10 } },
    ];
    const s = dailyState(log, day('2026-11-05'));
    expect(s.streak).toBe(0);
    expect(s.recovery).toEqual({
      date: '2026-11-04',
      targets: { pushups: 3, squats: 0, run: 250 },
      progress: {},
      streak: 3,
    });
  });

  it('recuperação cumprida devolve o streak e conta para a semana', () => {
    let log: DailyEntry[] = weekOf('2026-11-02', 2);
    // Ontem ficou em branco: metade da meta inteira (5/5/250).
    log = withDailyCount(log, '2026-11-04', 'pushups', 5, true);
    log = withDailyCount(log, '2026-11-04', 'squats', 5, true);
    log = withDailyCount(log, '2026-11-04', 'run', 250, true);
    const s = dailyState(log, day('2026-11-05'));
    expect(s.recovery).toBeUndefined();
    expect(s.streak).toBe(3);
    expect(dailyHistory(log, day('2026-11-05')).recovered).toEqual([
      '2026-11-04',
    ]);
  });

  it('sem streak para salvar, não oferece recuperação', () => {
    expect(dailyState([], day('2026-11-05')).recovery).toBeUndefined();
  });
});

describe('recoveryTargets', () => {
  it('arredonda para cima e corrida em passos de 50 m', () => {
    expect(
      recoveryTargets({ run: 100 }, { pushups: 11, squats: 11, run: 550 }),
    ).toEqual({ pushups: 6, squats: 6, run: 250 });
  });
});

describe('withDailyCount', () => {
  it('não muta e mantém o log em ordem', () => {
    const log = [full('2026-11-03')];
    const next = withDailyCount(log, '2026-11-02', 'run', 120.4);
    expect(log).toHaveLength(1);
    expect(next.map((e) => e.date)).toEqual(['2026-11-02', '2026-11-03']);
    expect(next[0].done).toEqual({ run: 120 });
  });
});
