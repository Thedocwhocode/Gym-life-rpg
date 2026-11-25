import type { AiWorkoutPlan } from '@/models/ai-models';
import {
  type ExerciseBlueprintPOJO,
  Rest,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';

/** Um pedaço de texto da página: `x` é o centro horizontal, `y` cresce para cima (como no PDF). */
export interface PdfCell {
  s: string;
  x: number;
  y: number;
}
export type PdfPage = PdfCell[];

interface Row {
  y: number;
  cells: PdfCell[];
}

interface Prescription {
  sets?: number;
  reps?: number;
  minutes?: number;
  /** Escrito de um jeito que séries × repetições não guarda (faixa, cluster, pirâmide): vai para as notas. */
  odd: boolean;
}

const SETS_REPS =
  /^(\d{1,2})\s*[x×]\s*(\()?\s*(\d{1,3})(?:\s*(?:a|-|–|\/)\s*(\d{1,3}))?(.*)$/i;
const PYRAMID = /^\d{1,3}(?:\/\d{1,3}){1,7}$/;
const RANGE = /^(\d{1,3})\s*(?:a|-|–)\s*(\d{1,3})$/i;
const MINUTES = /^(\d{1,3})\s*min/i;
const MAX = /^(m[áa]ximo|m[áa]x|falha|amrap)$/i;
const URL = /^https?:\/\/\S+$/i;
const SESSION = /^treino(\s+\S+){1,5}$/i;
const PHASE = /^fase\s+\d{1,2}$/i;
const SECTION = /^(abd[oô]m[eê]n|abdominais|cardio|aer[oó]bico)$/i;

/** "3x8a12", "4x10 (DSDN)", "3x(4x4)", "15/12/10", "6-10", "30min", "Máximo"; undefined se não for prescrição. */
export function prescription(text: string): Prescription | undefined {
  const s = text.trim();
  const m = SETS_REPS.exec(s);
  if (m) {
    const [, sets, cluster, a, b, tail] = m;
    if (cluster) return { sets: +sets, odd: true };
    return {
      sets: +sets,
      reps: Math.min(+a, b ? +b : +a),
      odd: !!b || !!tail.trim(),
    };
  }
  if (PYRAMID.test(s)) {
    const reps = s.split('/').map(Number);
    return { sets: reps.length, reps: Math.min(...reps), odd: true };
  }
  const r = RANGE.exec(s);
  if (r) return { reps: Math.min(+r[1], +r[2]), odd: true };
  const min = MINUTES.exec(s);
  if (min) return { minutes: +min[1], odd: false };
  if (MAX.test(s)) return { odd: true };
  return undefined;
}

/** Itens a até 3 pt de altura contam como a mesma linha; de cima para baixo, cada linha da esquerda para a direita. */
export function rowsOf(page: PdfPage): Row[] {
  const rows: Row[] = [];
  for (const c of page) {
    if (!c.s.trim()) continue;
    const row = rows.find((r) => Math.abs(r.y - c.y) <= 3);
    if (row) row.cells.push(c);
    else rows.push({ y: c.y, cells: [c] });
  }
  rows.forEach((r) => r.cells.sort((a, b) => a.x - b.x));
  return rows.sort((a, b) => b.y - a.y);
}

/** Texto da ficha para o leitor por IA: uma linha da tabela por linha, células separadas por " | ". */
export const sheetText = (pages: PdfPage[]) =>
  pages
    .map((p) =>
      rowsOf(p)
        .map((r) => r.cells.map((c) => c.s.trim()).join(' | '))
        .join('\n'),
    )
    .join('\n\n')
    .trim();

const text = (cells: PdfCell[]) =>
  cells
    .map((c) => c.s.trim())
    .join(' ')
    .replace(/\s+°/g, '°')
    .replace(/\s+/g, ' ')
    .trim();

const isInt = (s: string) => /^\d{1,2}$/.test(s.trim());

interface Draft {
  name: string;
  p: Prescription;
  sets?: number | undefined;
  notes: string[];
  link: string;
  biset?: string | undefined;
}

function toPojo(d: Draft, supersetWithNext: boolean): ExerciseBlueprintPOJO {
  const notes = d.notes.filter(Boolean).join(' · ');
  if (d.p.minutes !== undefined)
    return {
      type: 'CardioExerciseBlueprint',
      name: d.name,
      target: { type: 'time', value: Duration.ofMinutes(d.p.minutes) },
      trackDuration: true,
      trackDistance: false,
      trackResistance: false,
      trackIncline: false,
      notes,
      link: d.link,
    };
  return {
    type: 'WeightedExerciseBlueprint',
    name: d.name,
    // Ficha sem número ainda dá um exercício usável (1×1), como o leitor por IA fazia.
    sets: Math.max(1, d.sets ?? d.p.sets ?? 1),
    repsPerSet: Math.max(1, d.p.reps ?? 1),
    weightIncreaseOnSuccess: new BigNumber(0),
    restBetweenSets: Rest.medium,
    supersetWithNext,
    notes,
    link: d.link,
  };
}

/** Linha digitada num só bloco ("Supino reto 4x10 40kg"): cada palavra vira uma célula. */
const words = (row: Row): PdfCell[] =>
  row.cells.flatMap((c) =>
    c.s
      .trim()
      .split(/\s+/)
      .map((s) => ({ ...c, s })),
  );

/** Planilha por semanas: o nome é tudo antes da 1ª prescrição; a 1ª semana dá séries × repetições. */
function fromRow(row: Row): Draft | undefined {
  let { cells } = row;
  let i = cells.findIndex((c) => prescription(c.s));
  if (i < 0 && words(row).length <= 12) {
    cells = words(row);
    i = cells.findIndex((c) => prescription(c.s));
  }
  if (i <= 0 || !/\p{L}/u.test(text(cells.slice(0, i)))) return undefined;
  const p = prescription(cells[i].s)!;
  let nameCells = cells.slice(0, i);
  let sets: number | undefined;
  // "Supino | 4 | 8-12": o número solto antes de uma faixa são as séries.
  if (
    p.sets === undefined &&
    nameCells.length > 1 &&
    isInt(nameCells.at(-1)!.s)
  ) {
    sets = +nameCells.at(-1)!.s;
    nameCells = nameCells.slice(0, -1);
  }
  const rest = cells.slice(i + 1);
  const plan = [cells[i], ...rest.filter((c) => prescription(c.s))].map((c) =>
    c.s.trim(),
  );
  const last = cells.at(-1)!.s.trim();
  const others = rest.filter(
    (c) => !prescription(c.s) && !URL.test(c.s.trim()) && c.s.trim() !== '-',
  );
  return {
    name: text(nameCells),
    p,
    sets,
    notes: [
      new Set(plan).size > 1 ? plan.join(' · ') : p.odd ? plan[0] : '',
      text(others),
    ],
    // Link só inteiro: se o PDF quebrou o endereço em pedaços, fica sem.
    link: URL.test(last) ? last : '',
  };
}

interface Columns {
  headerY: number;
  centers: { name: string; x: number }[];
}

/** Cabeçalho de tabela com coluna "Repetições" (ficha de consultoria): as colunas vêm do centro de cada título. */
function columnsOf(rows: Row[], header: Row): Columns {
  const centers: Columns['centers'] = [];
  for (const r of rows)
    if (Math.abs(r.y - header.y) <= 6)
      for (const c of r.cells) {
        const near = centers.find((k) => Math.abs(k.x - c.x) < 10);
        if (near) near.name += ` ${c.s.trim()}`;
        else centers.push({ name: c.s.trim(), x: c.x });
      }
  return { headerY: header.y, centers };
}

const columnOf = (cols: Columns, c: PdfCell) =>
  cols.centers.reduce((a, b) =>
    Math.abs(b.x - c.x) < Math.abs(a.x - c.x) ? b : a,
  ).name;

const col = (name: string, re: RegExp) => re.test(name);
const NAME_COL = /^exerc/i;
const SETS_COL = /^s[ée]ries/i;
const REPS_COL = /^repeti/i;
const TECH_COL = /^t[ée]cnica|^observa/i;
const BISET_COL = /^bi-?set/i;

/** Linhas de uma tabela com colunas: cada célula vai para a prescrição de repetições mais próxima na altura. */
function fromColumns(cols: Columns, rows: Row[]): Draft[] {
  const cells = rows.flatMap((r) => r.cells);
  const anchors = cells.filter(
    (c) => col(columnOf(cols, c), REPS_COL) && prescription(c.s),
  );
  if (!anchors.length) return [];
  const groups = anchors.map(() => [] as PdfCell[]);
  for (const c of cells) {
    let best = 0;
    anchors.forEach((a, i) => {
      if (Math.abs(a.y - c.y) < Math.abs(anchors[best].y - c.y)) best = i;
    });
    if (Math.abs(anchors[best].y - c.y) <= 24) groups[best].push(c);
  }
  return anchors.flatMap((a, i) => {
    const by = (re: RegExp) =>
      groups[i]
        .filter((c) => col(columnOf(cols, c), re))
        .sort((x, y) => y.y - x.y || x.x - y.x);
    const name = text(by(NAME_COL));
    if (!name) return [];
    const setNumbers = by(SETS_COL)
      .map((c) => c.s.trim())
      .filter(isInt)
      .map(Number);
    const p = prescription(a.s)!;
    const biset = by(BISET_COL)
      .map((c) => c.s.trim())
      .find(isInt);
    return [
      {
        name,
        p,
        sets: setNumbers.length ? Math.max(...setNumbers) : undefined,
        notes: [p.odd ? a.s.trim() : '', text(by(TECH_COL))],
        link: '',
        biset,
      },
    ];
  });
}

/**
 * Ficha em PDF → plano, sem IA: entende a planilha por semanas (linha = exercício) e a tabela com colunas
 * (Exercício · Séries · Repetições). Só transcreve; o que não cabe em séries × repetições vai para as notas.
 * Null quando não acha nenhum treino.
 */
export function parseSheet(pages: PdfPage[]): AiWorkoutPlan | null {
  const sessions: { name: string; drafts: Draft[] }[] = [];
  let phase = '';
  let cols: Columns | undefined;
  for (const page of pages) {
    const rows = rowsOf(page);
    let table: Row[] = [];
    const flush = () => {
      if (cols && table.length && sessions.length)
        sessions.at(-1)!.drafts.push(...fromColumns(cols, table));
      table = [];
    };
    for (const row of rows) {
      const line = text(row.cells);
      const single = row.cells.length === 1;
      if (single && PHASE.test(line)) {
        flush();
        phase = line;
      } else if (single && (SESSION.test(line) || SECTION.test(line))) {
        flush();
        sessions.push({
          name: phase ? `${phase} · ${line}` : line,
          drafts: [],
        });
      } else if (
        row.cells.some((c) => NAME_COL.test(c.s.trim())) &&
        row.cells.some((c) => REPS_COL.test(c.s.trim()))
      ) {
        flush();
        cols = columnsOf(rows, row);
      } else if (row.cells.some((c) => NAME_COL.test(c.s.trim()))) {
        flush();
        cols = undefined; // cabeçalho de planilha por semanas
      } else if (cols) {
        if (row.y < cols.headerY - 6) table.push(row);
      } else if (sessions.length) {
        const d = fromRow(row);
        if (d) sessions.at(-1)!.drafts.push(d);
      }
    }
    flush();
    // A tabela continua na página seguinte com as mesmas colunas, sem repetir o cabeçalho.
    if (cols) cols = { ...cols, headerY: Infinity };
  }
  const found = sessions.filter((s) => s.drafts.length);
  if (!found.length) return null;
  return {
    name: '',
    description: '',
    sessions: found.map((s) =>
      SessionBlueprint.fromPOJO({
        name: s.name,
        notes: '',
        exercises: s.drafts.map((d, i) =>
          toPojo(d, !!d.biset && d.biset === s.drafts[i + 1]?.biset),
        ),
      }),
    ),
  };
}
