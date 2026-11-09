import {
  deriveProgress,
  diffProjection,
  weekKey,
  type SessionFacts,
} from '@/store/rpg/derive';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';

const day = (iso: string) => LocalDate.parse(iso);
const fact = (
  iso: string,
  sets = 0,
  extra: Partial<SessionFacts> = {},
): SessionFacts => ({
  date: day(iso),
  sets,
  minutes: 0,
  exercises: [],
  ...extra,
});

describe('weekKey', () => {
  it('vira de domingo para segunda pelo LocalDate (sem UTC)', () => {
    expect(weekKey(day('2026-11-08'))).toBe('2026-W45'); // domingo
    expect(weekKey(day('2026-11-09'))).toBe('2026-W46'); // segunda
  });

  it('usa o ano da semana ISO na virada do ano', () => {
    expect(weekKey(day('2027-01-01'))).toBe('2026-W53');
    expect(weekKey(day('2024-12-30'))).toBe('2025-W01');
  });
});

describe('deriveProgress', () => {
  const today = day('2026-11-11'); // quarta, semana 2026-W46

  it('sem sessões: nível 1, quests da semana de hoje zeradas', () => {
    const p = deriveProgress([], today);
    expect(p).toMatchObject({ xp: 0, level: 1, streak: 0, achievements: {} });
    expect(p.quests.map((q) => q.id)).toEqual([
      '2026-W46-workouts',
      '2026-W46-sets',
      '2026-W46-streak',
    ]);
    expect(p.quests.every((q) => q.progress === 0)).toBe(true);
  });

  it('XP da sessão: 50 + 10 por série + 15 por cardio', () => {
    const p = deriveProgress([fact('2026-11-11', 2, { cardio: 1 })], today);
    expect(p.xp).toBe(85);
    expect(p.achievements).toEqual({ first_quest: '2026-11-11' });
  });

  it('quest batida soma a recompensa (R3) e guarda o dia', () => {
    // 2 treinos em dias seguidos fecham "2 treinos" (+100) e "2 dias seguidos" (+200).
    const p = deriveProgress([fact('2026-11-09'), fact('2026-11-10')], today);
    expect(p.xp).toBe(50 + 50 + 100 + 200);
    const done = p.quests.filter((q) => q.completedAt === '2026-11-10');
    expect(done.map((q) => q.type).sort()).toEqual([
      'streak_days',
      'workouts_this_week',
    ]);
    expect(p.streak).toBe(2);
  });

  it('streak zera quando ontem e hoje passaram sem treino', () => {
    expect(deriveProgress([fact('2026-11-09')], today).streak).toBe(0);
    expect(deriveProgress([fact('2026-11-10')], today).streak).toBe(1);
  });

  it('pausa de 14+ dias corta o XP; a pausa atual também', () => {
    // 01/10 → 11/11 = 41 dias: perde ≈14,5% de 150 (10 séries, sem fechar quest).
    const parado = deriveProgress([fact('2026-10-01', 10)], today);
    expect(parado.xp).toBe(Math.floor(150 * (1 - 0.01 * 2 ** (27 / 7))));
    // Voltou em 11/11: a perda fica e o XP novo entra inteiro.
    const voltou = deriveProgress(
      [fact('2026-10-01', 10), fact('2026-11-11')],
      today,
    );
    expect(voltou.xp).toBe(parado.xp + 50);
  });

  it('sessão lançada com data passada entra na ordem certa (sem pausa falsa até hoje)', () => {
    const p = deriveProgress(
      [fact('2026-11-10'), fact('2026-10-20')], // a de outubro chegou depois
      today,
    );
    expect(p.streak).toBe(1);
    // A pausa real de 21 dias (20/10 → 10/11) tira 2% dos 50; nada se perde de 10/11 até hoje.
    expect(p.xp).toBe(49 + 50);
  });

  it('apagar sessão some com o XP e a conquista (projeção, não incremento)', () => {
    const com = deriveProgress(
      [fact('2026-11-10', 0, { maxWeight: 120 })],
      today,
    );
    expect(com.achievements.heavy_lift).toBe('2026-11-10');
    expect(deriveProgress([], today).achievements).toEqual({});
  });

  it('conquistas de nível ficam mesmo se a pausa baixar o nível depois', () => {
    // 160 séries = 1650 XP (nível 5), depois 120 dias parado.
    const p = deriveProgress([fact('2026-07-01', 160)], today);
    expect(p.level).toBeLessThan(5);
    expect(p.achievements.level_5).toBe('2026-07-01');
  });
});

describe('diffProjection', () => {
  const today = day('2026-11-11');
  it('level up, conquista nova e XP ganho', () => {
    const before = deriveProgress([fact('2026-11-10', 3)], today);
    const after = deriveProgress(
      [fact('2026-11-10', 3), fact('2026-11-11', 3)],
      today,
    );
    expect(diffProjection(before, after)).toEqual({
      xpGained: after.xp - before.xp,
      newLevel: after.level,
      newAchievementIds: [],
    });
  });

  it('nada mudou: sem nível novo', () => {
    const p = deriveProgress([fact('2026-11-10')], today);
    expect(diffProjection(p, p)).toEqual({
      xpGained: 0,
      newAchievementIds: [],
    });
  });
});
