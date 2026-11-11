import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import {
  deriveProgress,
  factsXp,
  JourneyContext,
  SessionFacts,
} from './derive';

// Fold com as escolhas datadas da F6 (DR8, DR11). 2026-11-02 é segunda-feira.
const MON = LocalDate.parse('2026-11-02');
const day = (n: number) => MON.plusDays(n);
let seq = 0;
const fact = (n: number, extra: Partial<SessionFacts> = {}): SessionFacts => ({
  date: day(n),
  sets: 5,
  minutes: 30,
  exercises: ['Supino'],
  id: `s${String(seq++).padStart(3, '0')}`,
  ...extra,
});
const BASE = factsXp({ date: MON, sets: 5, minutes: 30, exercises: [] }); // 100

const since = (n: number): JourneyContext => ({
  multipliersSince: day(n),
  classHistory: [{ since: '2020-01-01', value: 'warrior' }],
});

describe('deriveProgress com JourneyContext', () => {
  it('sem multiplicadoresDesde nada muda (XP passado intacto)', () => {
    const facts = [fact(0), fact(1)];
    const plain = deriveProgress(facts, day(1));
    const ctx = deriveProgress(facts, day(1), {
      classHistory: [{ since: '2020-01-01', value: 'warrior' }],
    });
    expect(ctx.xp).toBe(plain.xp);
    expect(ctx.statuses).toEqual([]);
    expect(ctx.sources).toEqual({});
    expect(ctx.hearts.enabled).toBe(false);
  });

  it('classe + skill inicial valem só a partir do multiplicadoresDesde', () => {
    const a = fact(0);
    const b = fact(6);
    const p = deriveProgress([a, b], day(6), since(6));
    expect(p.sources[a.id!]).toBeUndefined();
    // guerreiro +10 e Corte (inicial) +10
    expect(p.sources[b.id!].map((s) => s.pct)).toEqual([10, 10]);
    const off = deriveProgress([a, b], day(6));
    expect(p.xp - off.xp).toBe(Math.round(BASE * 0.2));
  });

  it('troca de classe vale do dia da troca em diante', () => {
    const a = fact(1);
    const b = fact(3);
    const p = deriveProgress([a, b], day(3), {
      multipliersSince: MON,
      classHistory: [
        { since: '2026-11-01', value: 'warrior' },
        { since: '2026-11-04', value: 'paladin' },
      ],
    });
    expect(p.sources[a.id!].map((s) => s.id)).toEqual(['warrior', 'corte']);
    expect(p.sources[b.id!]).toEqual([]);
  });

  it('itens e skill equipados por escolha datada', () => {
    const a = fact(0);
    const p = deriveProgress([a], day(0), {
      ...since(0),
      skillEquipped: [{ since: '2026-11-01', value: 'cruzado' }],
      itemsEquipped: [{ since: '2026-11-01', value: ['espada-ferro-frio'] }],
    });
    expect(p.sources[a.id!].map((s) => `${s.id}:${s.pct}`)).toEqual([
      'warrior:10',
      'espada-ferro-frio:5',
    ]);
  });

  it('Fúria: PR anterior na mesma semana dá +20% às sessões seguintes', () => {
    const facts = [
      fact(0, { loads: [['supino', 80]] }),
      fact(1, { loads: [['supino', 85]] }),
      fact(2, { loads: [['supino', 85]] }),
    ];
    const p = deriveProgress(facts, day(2), {
      multipliersSince: MON,
    });
    expect(p.sources[facts[1].id!]).toEqual([]);
    expect(p.sources[facts[2].id!].map((s) => s.id)).toEqual(['furia']);
    expect(p.statuses).toContain('furia');
  });

  it('Lento depois de 7+ dias; volta de 14+ conta como retorno', () => {
    const facts = [fact(0), fact(7), fact(21)];
    const p = deriveProgress(facts, day(21), { multipliersSince: MON });
    expect(p.sources[facts[1].id!].map((s) => s.id)).toEqual(['lento']);
    expect(p.stats.comeback).toBe(true);
    expect(deriveProgress(facts.slice(0, 2), day(7)).stats.comeback).toBe(
      false,
    );
  });

  it('Embalo com streak de 5 antes da sessão', () => {
    const facts = [0, 1, 2, 3, 4, 5].map((n) => fact(n));
    const p = deriveProgress(facts, day(5), { multipliersSince: MON });
    expect(p.sources[facts[4].id!]).toEqual([]);
    expect(p.sources[facts[5].id!].map((s) => s.id)).toEqual(['pressa']);
  });

  it('Paladino protege o streak 1× por semana (falta de 1 dia)', () => {
    const ctx: JourneyContext = {
      multipliersSince: MON,
      classHistory: [{ since: '2020-01-01', value: 'paladin' }],
    };
    const facts = [fact(0), fact(1), fact(3), fact(5)];
    expect(deriveProgress(facts, day(5), ctx).streak).toBe(1);
    expect(deriveProgress(facts.slice(0, 3), day(3), ctx).streak).toBe(3);
    // o escudo de hoje também segura o streak até amanhã
    expect(deriveProgress(facts.slice(0, 2), day(3), ctx).streak).toBe(2);
    expect(deriveProgress(facts.slice(0, 2), day(3)).streak).toBe(0);
  });

  it('Exausto (corações a zero) tira 50% das sessões', () => {
    const ctx: JourneyContext = {
      multipliersSince: MON,
      heartsSince: MON,
      trainingDays: [{ since: '2026-11-01', value: [1, 2, 3, 4, 5, 6, 7] }],
    };
    const f = fact(6);
    const p = deriveProgress([f], day(6), ctx);
    expect(p.hearts.exhausted).toBe(true);
    expect(p.sources[f.id!].map((s) => s.id)).toEqual(['exausto']);
    expect(p.statuses[0]).toBe('exausto');
  });

  it('Amaldiçoado após 2 semanas completas abaixo da meta', () => {
    const facts = [fact(0), fact(1), fact(7), fact(14), fact(21)];
    const p = deriveProgress(facts, day(21), { multipliersSince: MON });
    // semanas 2 e 3 tiveram 1 missão cada (meta 2); a pausa de 7 dias soma o Lento
    expect(p.sources[facts[4].id!].map((s) => s.id)).toEqual([
      'amaldicoado',
      'lento',
    ]);
    expect(p.sources[facts[2].id!]).toEqual([]);
    expect(p.sources[facts[3].id!].map((s) => s.id)).toEqual(['lento']);
  });

  it('mesma projeção com as sessões em outra ordem', () => {
    const facts = [
      fact(0, { loads: [['terra', 100]] }),
      fact(0),
      fact(2, { loads: [['terra', 110]], cardioMin: 35, cardioKm: 6 }),
      fact(3),
    ];
    const ctx = { ...since(0), heartsSince: MON };
    const a = deriveProgress(facts, day(4), ctx);
    const b = deriveProgress([...facts].reverse(), day(4), ctx);
    expect(b).toEqual(a);
    expect(a.stats).toMatchObject({
      missions: 4,
      deadliftPr: true,
      maxSessionCardioMin: 35,
      maxWeekKm: 6,
      maxWeekSets: 20,
    });
  });

  it('XP e missões por semana para a crônica', () => {
    const facts = [fact(0), fact(1), fact(8)];
    const p = deriveProgress(facts, day(8));
    expect(p.missionsByWeek).toEqual({ '2026-W45': 2, '2026-W46': 1 });
    // + quests de 2 missões (100) e de 2 dias seguidos (200)
    expect(p.xpByWeek['2026-W45']).toBe(2 * BASE + 100 + 200);
    expect(Object.values(p.xpByWeek).reduce((a, b) => a + b)).toBe(p.xp);
  });

  it('semanas seguidas batendo a meta e com 3 treinos', () => {
    const facts = [0, 1, 2, 7, 8, 9, 14].map((n) => fact(n));
    const p = deriveProgress(facts, day(15));
    expect(p.stats.maxWeeks3x).toBe(2);
    expect(p.stats.maxGoalWeeks).toBe(2);
  });
});
