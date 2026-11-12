import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import { bestiaryState, BESTIARY } from './bestiary';
import { chronicleFor, showChronicle } from './chronicle';
import { choose, valueAt } from './dated';
import { dungeonClears, dungeonNodes } from './dungeon';
import { deriveEnergy, restRecommended } from './energy';
import { deriveHearts, HEARTS } from './hearts';
import { equipItem, ITEMS } from './items';
import { totalPct, withPct, xpSources } from './multipliers';
import {
  EMPTY_STATS,
  equippedSkill,
  hasEffect,
  reqProgress,
  SKILLS,
  skillState,
} from './skills';
import { activeStatuses, isDebuff } from './status';

const d = (s: string) => LocalDate.parse(s);
// 2026-11-02 é segunda-feira.
const MON = d('2026-11-02');

describe('dated', () => {
  const list = [
    { since: '2026-11-01', value: 'a' },
    { since: '2026-11-05', value: 'b' },
  ];
  it('vale a última escolha com since <= dia', () => {
    expect(valueAt(list, '2026-10-31')).toBeUndefined();
    expect(valueAt(list, d('2026-11-04'))).toBe('a');
    expect(valueAt(list, '2026-11-05')).toBe('b');
    expect(valueAt(undefined, '2026-11-05')).toBeUndefined();
  });
  it('escolher no mesmo dia ou antes substitui o que vinha depois', () => {
    expect(choose(list, '2026-11-05', 'c')).toEqual([
      list[0],
      { since: '2026-11-05', value: 'c' },
    ]);
    expect(choose(list, '2026-11-03', 'c')).toEqual([
      list[0],
      { since: '2026-11-03', value: 'c' },
    ]);
    expect(choose(undefined, '2026-11-03', 'c')).toHaveLength(1);
  });
});

describe('deriveHearts', () => {
  // seg, qua, sex
  const trainingDays = [{ since: '2026-10-01', value: [1, 3, 5] }];
  const base = { trainingDays, since: MON, sessionDays: [] as LocalDate[] };

  it('sem coracoesDesde ou sem dias de treino fica desligado', () => {
    expect(
      deriveHearts({ ...base, since: undefined, today: MON }).enabled,
    ).toBe(false);
    expect(
      deriveHearts({ ...base, trainingDays: undefined, today: MON }).enabled,
    ).toBe(false);
    expect(deriveHearts({ ...base, today: MON.minusDays(1) }).enabled).toBe(
      false,
    );
  });

  it('dia planejado sem missão custa 1 coração, mas hoje ainda não', () => {
    const h = deriveHearts({ ...base, today: MON });
    expect(h).toMatchObject({ enabled: true, hearts: 5, missed: [] });
    const h2 = deriveHearts({ ...base, today: MON.plusDays(1) });
    expect(h2.hearts).toBe(4);
    expect(h2.missed.map(String)).toEqual(['2026-11-02']);
  });

  it('nada antes de coracoesDesde conta (DR8)', () => {
    const h = deriveHearts({
      ...base,
      since: MON.plusDays(3),
      today: MON.plusDays(4),
    });
    expect(h.missed).toEqual([]);
  });

  it('2 missões fora do Exausto devolvem 1 coração, até 5', () => {
    const h = deriveHearts({
      ...base,
      sessionDays: [MON.plusDays(2), MON.plusDays(3), MON.plusDays(4)],
      today: MON.plusDays(5),
    });
    // perdeu seg (4), qua e sex treinou; qui extra: 2ª missão devolve 1 → 5
    expect(h.hearts).toBe(5);
  });

  it('zera e fica Exausto; 3 missões em 7 dias curam com 2 corações', () => {
    const today = MON.plusWeeks(2).plusDays(1); // ter da 3ª semana
    const h = deriveHearts({ ...base, today });
    expect(h).toMatchObject({ hearts: 0, exhausted: true });
    expect(h.missed).toHaveLength(HEARTS.max);
    expect(h.exhaustedDays.has(today.toString())).toBe(true);

    const cure = [today, today.plusDays(1), today.plusDays(2)];
    expect(
      deriveHearts({ ...base, sessionDays: cure.slice(0, 2), today: cure[1] })
        .cureProgress,
    ).toBe(2);
    const healed = deriveHearts({ ...base, sessionDays: cure, today: cure[2] });
    expect(healed).toMatchObject({
      exhausted: false,
      hearts: HEARTS.afterCure,
    });
  });

  it('missões espaçadas mais de 7 dias não somam para a cura', () => {
    const start = MON.plusWeeks(2).plusDays(1);
    const h = deriveHearts({
      ...base,
      sessionDays: [start, start.plusDays(8), start.plusDays(9)],
      today: start.plusDays(9),
    });
    expect(h.exhausted).toBe(true);
    expect(h.cureProgress).toBe(2);
  });
});

describe('status', () => {
  const ctx = {
    exhausted: false,
    daysSinceLast: 1,
    prThisWeek: false,
    streak: 0,
    weeksBelowGoal: 0,
    goalMetThisWeek: false,
  };
  it('nada ativo num dia comum', () => {
    expect(activeStatuses(ctx)).toEqual([]);
  });
  it('debuffs primeiro, depois buffs', () => {
    expect(
      activeStatuses({
        exhausted: true,
        daysSinceLast: 7,
        prThisWeek: true,
        streak: 5,
        weeksBelowGoal: 2,
        goalMetThisWeek: false,
      }),
    ).toEqual(['exausto', 'amaldicoado', 'lento', 'furia', 'pressa']);
  });
  it('bater a meta da semana tira o Amaldiçoado', () => {
    expect(
      activeStatuses({ ...ctx, weeksBelowGoal: 2, goalMetThisWeek: true }),
    ).toEqual([]);
  });
  it('isDebuff segue o sinal do %', () => {
    expect(isDebuff('lento')).toBe(true);
    expect(isDebuff('pressa')).toBe(false);
  });
});

describe('multiplicadores (DR11)', () => {
  const input = {
    sets: 10,
    cardio: 0,
    rpgClass: 'warrior' as const,
    skill: 'corte',
    items: ['espada-ferro-frio', 'botas-couro'],
    statuses: [] as const,
  };
  it('soma classe, skill e itens que se aplicam à sessão', () => {
    const src = xpSources({ ...input, statuses: [] });
    expect(src.map((s) => `${s.source}:${s.id}:${s.pct}`)).toEqual([
      'class:warrior:10',
      'skill:corte:10',
      'item:espada-ferro-frio:5',
    ]);
    expect(totalPct(src)).toBe(25);
  });
  it('bônus de cardio só vale com cardio feito', () => {
    const src = xpSources({
      ...input,
      statuses: [],
      sets: 0,
      cardio: 1,
      rpgClass: 'scout',
      skill: 'estocada',
    });
    expect(totalPct(src)).toBe(15 + 15 + 5);
  });
  it('teto de +50% e piso de −50%', () => {
    const up = xpSources({ ...input, statuses: ['furia', 'pressa'] });
    expect(totalPct(up)).toBe(50);
    const down = xpSources({
      ...input,
      rpgClass: 'paladin',
      skill: undefined,
      items: [],
      statuses: ['exausto', 'amaldicoado'],
    });
    expect(totalPct(down)).toBe(-50);
  });
  it('withPct arredonda', () => {
    expect(withPct(150, 25)).toBe(188);
    expect(withPct(150, -50)).toBe(75);
    expect(withPct(150, 0)).toBe(150);
  });
});

describe('skills', () => {
  const learned = new Set<string>();
  it('20 skills, 4 escolas, ids únicos', () => {
    expect(SKILLS).toHaveLength(20);
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(20);
  });
  it('a inicial da classe já vem aprendida e equipada por padrão', () => {
    expect(equippedSkill(undefined, 'paladin')).toBe('respiro');
    expect(equippedSkill('egide', 'paladin', new Set(['egide']))).toBe('egide');
    // não aprendida, ou inicial de outra classe: cai na inicial da classe vigente
    expect(equippedSkill('egide', 'paladin')).toBe('respiro');
    expect(equippedSkill('corte', 'paladin')).toBe('respiro');
    expect(equippedSkill(undefined, undefined)).toBeUndefined();
    const respiro = SKILLS.find((s) => s.id === 'respiro')!;
    expect(
      skillState(respiro, {
        stats: EMPTY_STATS,
        rpgClass: 'paladin',
        learned,
        equipped: 'respiro',
      }),
    ).toBe('equipped');
    expect(
      skillState(respiro, {
        stats: EMPTY_STATS,
        rpgClass: 'warrior',
        learned,
        equipped: undefined,
      }),
    ).toBe('locked');
  });
  it('requisito cumprido deixa disponível; aprendida não volta a travar', () => {
    const cruzado = SKILLS.find((s) => s.id === 'cruzado')!;
    const ctx = { rpgClass: 'warrior' as const, learned, equipped: undefined };
    expect(skillState(cruzado, { ...ctx, stats: EMPTY_STATS })).toBe('locked');
    expect(
      skillState(cruzado, { ...ctx, stats: { ...EMPTY_STATS, missions: 10 } }),
    ).toBe('available');
    expect(
      skillState(cruzado, {
        ...ctx,
        stats: EMPTY_STATS,
        learned: new Set(['cruzado']),
      }),
    ).toBe('learned');
  });
  it('progresso dos requisitos', () => {
    const stats = { ...EMPTY_STATS, missions: 4, deadliftPr: true };
    expect(reqProgress({ kind: 'missions', n: 10 }, stats, undefined)).toEqual({
      value: 4,
      target: 10,
      ratio: 0.4,
    });
    expect(reqProgress({ kind: 'deadliftPr' }, stats, undefined).ratio).toBe(1);
    expect(reqProgress({ kind: 'soon' }, stats, undefined).ratio).toBe(0);
    expect(
      reqProgress({ kind: 'class', cls: 'scout' }, stats, 'scout').ratio,
    ).toBe(1);
  });
  it('só tem efeito quem a projeção aplica', () => {
    expect(SKILLS.filter(hasEffect).map((s) => s.id)).toEqual([
      'corte',
      'estocada',
      'respiro',
      'egide',
    ]);
  });
});

describe('itens', () => {
  it('equipar troca o item do mesmo slot', () => {
    expect(
      equipItem(['capuz-noite', 'botas-couro'], 'elmo-chamuscado'),
    ).toEqual(['botas-couro', 'elmo-chamuscado']);
  });
  it('todo drop do bestiário existe em ITEMS', () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const b of BESTIARY) expect(ids.has(b.drop)).toBe(true);
  });
});

describe('bestiário', () => {
  it('visto, derrotado e o guardião pela masmorra', () => {
    const { state, drops } = bestiaryState(
      [
        { monster: 'slime', defeated: false },
        { monster: 'slime', defeated: true },
        { monster: 'bat', defeated: false },
        { monster: 'desconhecido', defeated: true },
      ],
      1,
    );
    expect(state).toMatchObject({
      gosma: 'defeated',
      morcego: 'seen',
      olho: 'unknown',
      guardiao: 'defeated',
    });
    expect(drops).toEqual(['botas-couro', 'espada-ferro-frio']);
  });
  it('derrota não volta para visto', () => {
    const { state } = bestiaryState(
      [
        { monster: 'bat', defeated: true },
        { monster: 'bat', defeated: false },
      ],
      0,
    );
    expect(state['morcego']).toBe('defeated');
    expect(state['guardiao']).toBe('unknown');
  });
});

describe('energia (DR13)', () => {
  it('cheia sem treino; cada dia de treino gasta 1, descanso devolve 2', () => {
    expect(deriveEnergy([], MON)).toBe(5);
    const days = [0, 1, 2, 3].map((n) => MON.plusDays(n));
    expect(deriveEnergy(days, MON.plusDays(3))).toBe(1);
    expect(restRecommended(1)).toBe(true);
    // o dia de descanso de hoje ainda não devolveu: é aqui que o card sugere descanso
    expect(deriveEnergy(days, MON.plusDays(4))).toBe(1);
    expect(deriveEnergy(days, MON.plusDays(5))).toBe(3);
    expect(restRecommended(3)).toBe(false);
  });
  it('não passa de 0..5 e o Respiro devolve +1', () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((n) => MON.plusDays(n));
    expect(deriveEnergy(days, MON.plusDays(6))).toBe(0);
    expect(deriveEnergy(days, MON.plusDays(8))).toBe(2);
    expect(deriveEnergy(days, MON.plusDays(8), () => 1)).toBe(3);
  });
});

describe('masmorra (DR22)', () => {
  const plan = ['A', 'B', 'C'];
  it('nós: feitos antes do atual, último é chefe', () => {
    expect(dungeonNodes(plan, 'B').map((n) => n.state)).toEqual([
      'done',
      'current',
      'boss',
    ]);
    expect(dungeonNodes(plan, 'C').map((n) => n.state)).toEqual([
      'done',
      'done',
      'current',
    ]);
    expect(dungeonNodes(plan, undefined).map((n) => n.state)).toEqual([
      'open',
      'open',
      'boss',
    ]);
  });
  it('masmorra limpa = sessão do último treino, por semana', () => {
    const r = dungeonClears(
      [
        { date: MON, workout: 'C' },
        { date: MON.plusDays(1), workout: 'A' },
        { date: MON.plusWeeks(1), workout: 'C' },
        { date: MON.plusWeeks(1).plusDays(2), workout: 'C' },
      ],
      plan,
    );
    expect(r).toEqual({
      total: 3,
      byWeek: { '2026-W45': 1, '2026-W46': 2 },
    });
    expect(dungeonClears([{ date: MON, workout: 'C' }], [])).toEqual({
      total: 0,
      byWeek: {},
    });
    // plano de um treino só: nenhuma sessão conta como masmorra limpa
    expect(dungeonClears([{ date: MON, workout: 'C' }], ['C']).total).toBe(0);
  });
});

describe('crônica (E4)', () => {
  const today = MON.plusWeeks(1); // segunda seguinte
  const input = {
    today,
    sessionDays: [MON, MON.plusDays(2)],
    missionsByWeek: { '2026-W45': 2 },
    xpByWeek: { '2026-W45': 300 },
    clearsByWeek: { '2026-W45': 1 },
    missed: [MON.plusDays(4)],
    learned: [
      { since: '2026-11-03', value: 'cruzado' },
      { since: '2026-10-20', value: 'giro' },
    ],
    goal: 2,
  };
  it('resume a semana anterior', () => {
    expect(chronicleFor(input)).toEqual({
      week: '2026-W45',
      days: [true, false, true, false, false, false, false],
      missions: 2,
      bosses: 1,
      heartsLost: 1,
      skills: ['cruzado'],
      xp: 300,
      perfect: false,
    });
    expect(chronicleFor({ ...input, missed: [] })?.perfect).toBe(true);
  });
  it('sem missão na semana não aparece; vista não repete', () => {
    expect(chronicleFor({ ...input, missionsByWeek: {} })).toBeUndefined();
    const c = chronicleFor(input);
    expect(showChronicle(c, today, undefined)).toBe(true);
    expect(showChronicle(c, today.plusDays(3), '2026-W46')).toBe(false);
    expect(showChronicle(undefined, today, undefined)).toBe(false);
  });
});
