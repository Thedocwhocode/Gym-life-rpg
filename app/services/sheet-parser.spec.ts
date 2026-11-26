import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import {
  parseSheet,
  prescription,
  type PdfCell,
  type PdfPage,
} from './sheet-parser';

/** O mesmo recorte de `pdf-text.ts`, pelo build do pdf.js que roda no Node. */
async function pagesOf(name: string): Promise<PdfPage[]> {
  const data = new Uint8Array(
    readFileSync(join(__dirname, 'test-assets/pdf', name)),
  );
  const doc = await getDocument({ data, verbosity: 0 }).promise;
  const out: PdfPage[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const { items } = await (await doc.getPage(p)).getTextContent();
    out.push(
      items.flatMap((i) => {
        if (!('str' in i) || !i.str.trim()) return [];
        const t = i.transform as number[];
        return [{ s: i.str, x: t[4] + i.width / 2, y: t[5] }];
      }),
    );
  }
  await doc.destroy();
  return out;
}

const exercises = (pages: PdfPage[]) =>
  parseSheet(pages)?.sessions.flatMap((s) => s.exercises) ?? [];

const setsReps = (e: { sets?: number; repsPerSet?: number } | object) =>
  'sets' in e && 'repsPerSet' in e ? `${e.sets}x${e.repsPerSet}` : 'cardio';

/** Uma linha de células, da esquerda para a direita, a 100 pt de distância. */
const row = (y: number, ...texts: string[]): PdfCell[] =>
  texts.map((s, i) => ({ s, x: 50 + i * 100, y }));

describe('prescription', () => {
  it.each([
    ['3x8a12', { sets: 3, reps: 8, odd: true }],
    ['4x10', { sets: 4, reps: 10, odd: false }],
    ['4x10 (DSDN)', { sets: 4, reps: 10, odd: true }],
    ['3x(4x4)', { sets: 3, odd: true }],
    ['15/12/10', { sets: 3, reps: 10, odd: true }],
    ['6-8', { reps: 6, odd: true }],
    ['8 a 12', { reps: 8, odd: true }],
    ['30min', { minutes: 30, odd: false }],
    ['Máximo', { odd: true }],
  ])('%s', (text, expected) => {
    expect(prescription(text)).toEqual(expected);
  });

  it.each(['Supino reto', '40kg', 'Treino A', ''])(
    '"%s" não é prescrição',
    (text) => {
      expect(prescription(text)).toBeUndefined();
    },
  );
});

describe('parseSheet: planilha por semanas (linha = exercício)', () => {
  const sheet: PdfPage[] = [
    [
      ...row(800, 'Fase 1'),
      ...row(780, 'Treino A'),
      ...row(760, 'Exercício', 'Semana 1', 'Semana 2'),
      ...row(740, 'Supino', 'inclinado', '45', '°', '3x10', '4x8'),
      ...row(720, 'Remada curvada', '3x(4x4)', 'https://exemplo.test/v'),
      ...row(700, 'Rosca direta', '15/12/10', '15/12/10'),
      ...row(680, 'Cardio'),
      ...row(660, 'Esteira', '20min'),
      ...row(640, 'Legenda: DSDN = drop set duplo'),
    ],
  ];

  it('nome partido em células, progressão nas notas, link inteiro, Fase e seções', () => {
    const plan = parseSheet(sheet)!;
    expect(plan.sessions.map((s) => s.name)).toEqual([
      'Fase 1 · Treino A',
      'Fase 1 · Cardio',
    ]);
    const [supino, remada, rosca] = plan.sessions[0].exercises;
    expect(supino.name).toBe('Supino inclinado 45°');
    expect(setsReps(supino)).toBe('3x10');
    expect(supino.notes).toBe('3x10 · 4x8');
    expect(setsReps(remada)).toBe('3x1');
    expect(remada.notes).toBe('3x(4x4)');
    expect(remada.link).toBe('https://exemplo.test/v');
    expect(setsReps(rosca)).toBe('3x10');
    const [esteira] = plan.sessions[1].exercises;
    expect(setsReps(esteira)).toBe('cardio');
  });

  it('linha digitada num bloco só vira palavras', () => {
    const plan = parseSheet([
      [
        { s: 'Treino B', x: 50, y: 800 },
        { s: 'Agachamento livre 4x8 60kg', x: 120, y: 780 },
      ],
    ])!;
    const [ex] = plan.sessions[0].exercises;
    expect(ex.name).toBe('Agachamento livre');
    expect(setsReps(ex)).toBe('4x8');
    expect(ex.notes).toBe('60kg');
  });

  it('sem cabeçalho de treino → null', () => {
    expect(parseSheet([row(800, 'Supino', '3x10')])).toBeNull();
  });
});

describe('parseSheet: tabela com colunas (consultoria)', () => {
  const header = (y: number) =>
    [
      ['Exercício', 100],
      ['Séries', 250],
      ['Repetições', 350],
      ['Técnica', 450],
      ['Bi-set', 550],
    ].map(([s, x]) => ({ s: s as string, x: x as number, y }));
  const cell = (s: string, x: number, y: number) => ({ s, x, y });

  it('séries empilhadas, nome em duas linhas, bi-set e continuação de página', () => {
    const plan = parseSheet([
      [
        cell('Treino A', 100, 820),
        ...header(800),
        cell('Desenvolvimento com', 100, 776),
        cell('halter', 100, 764),
        ...['1', '2', '3', '4'].map((n, i) => cell(n, 250, 782 - i * 6)),
        cell('6-8', 350, 770),
        cell('Tradicional', 450, 770),
        cell('1', 550, 770),
        cell('Elevação lateral', 100, 720),
        cell('3', 250, 720),
        cell('8a12', 350, 720),
        cell('1', 550, 720),
      ],
      [cell('Crucifixo', 100, 700), cell('3x12', 350, 700)],
    ])!;
    const [dev, elev, cruc] = plan.sessions[0].exercises;
    expect(dev.name).toBe('Desenvolvimento com halter');
    expect(setsReps(dev)).toBe('4x6');
    expect(dev.notes).toBe('6-8 · Tradicional');
    expect('supersetWithNext' in dev && dev.supersetWithNext).toBe(true);
    expect('supersetWithNext' in elev && elev.supersetWithNext).toBe(false);
    expect(cruc.name).toBe('Crucifixo');
    expect(setsReps(cruc)).toBe('3x12');
  });
});

describe('fixtures', () => {
  it('ficha real anonimizada: 7 treinos, 51 exercícios', async () => {
    const plan = parseSheet(await pagesOf('ficha-real-anonimizada.pdf'))!;
    expect(plan.sessions).toHaveLength(7);
    expect(plan.sessions.map((s) => s.name)).toContain(
      'Treino Peso do Corpo 3',
    );
    const ex = plan.sessions.flatMap((s) => s.exercises);
    expect(ex).toHaveLength(51);
    expect(ex[0].name).toBe('Agachamento sumô com halter');
    expect(setsReps(ex[0])).toBe('3x6');
    expect(ex[0].notes).toBe('6-8 · Tradicional');
    const flexao = ex.find((e) => e.name === 'Flexão declinada')!;
    expect(setsReps(flexao)).toBe('3x1');
    expect(flexao.notes).toBe('Máximo · Tradicional');
  });

  it('ficha real nº 2: nome em duas linhas, bi-set, tabela sem coluna Bi-set, cardio em minutos', async () => {
    const plan = parseSheet(await pagesOf('ficha-real-2-anonimizada.pdf'))!;
    expect(plan.sessions).toHaveLength(7);
    const ex = plan.sessions.flatMap((s) => s.exercises);
    expect(ex).toHaveLength(52);
    const byName = (n: string) => ex.find((e) => e.name === n)!;
    expect(byName('Abdominal infra no banco declinado')).toBeDefined();
    expect(
      byName('Supino inclinado com halter (banco em 30 graus)'),
    ).toBeDefined();
    const supino = byName('Supino reto articulado');
    expect('supersetWithNext' in supino && supino.supersetWithNext).toBe(true);
    expect(setsReps(byName('Afundo com halter'))).toBe('4x12');
    expect(setsReps(byName('Bike/Elíptico'))).toBe('cardio');
  });

  it('planilha por semanas sintética', async () => {
    const plan = parseSheet(await pagesOf('planilha-semanas-sintetica.pdf'))!;
    expect(plan.sessions.map((s) => s.name)).toEqual([
      'Fase 1 · Treino A',
      'Fase 1 · ABDOMÊN',
      'Fase 2 · Treino A',
      'Fase 2 · Cardio',
    ]);
    const ex = plan.sessions.flatMap((s) => s.exercises);
    expect(ex.map((e) => `${e.name} ${setsReps(e)}`)).toEqual([
      'Agachamento livre (B) 4x10',
      'Rosca no banco 45° (H) 3x12',
      'Remada curvada (B) 3x1',
      'Elevação lateral (H) 3x10',
      'Puxada frontal 4x10',
      'Supino reto (B) 4x8',
      'Abdominal supra 3x20',
      'Levantamento terra (B) 5x5',
      'Desenvolvimento (H) 4x10',
      'Bicicleta cardio',
    ]);
    expect(ex[0].notes).toBe('4x10 · 4x8 · 5x6 · 5x5');
    expect(ex[4].link).toBe('https://example.com/v/puxada');
    // Link quebrado em dois pedaços pelo PDF: melhor sem link do que um endereço errado.
    expect(ex[5].link).toBe('');
  });

  it('ficha sintética com texto em blocos', async () => {
    const ex = exercises(await pagesOf('ficha-sintetica.pdf'));
    expect(ex.map((e) => `${e.name} ${setsReps(e)}`)).toEqual([
      'Supino reto 4x10',
      'Remada curvada 4x10',
      'Agachamento livre 4x8',
      'Leg press 3x12',
    ]);
  });

  it('ficha escaneada (só imagem) não tem texto → null', async () => {
    expect(parseSheet(await pagesOf('escaneado-sintetico.pdf'))).toBeNull();
  });
});
