// Gera assets/opengym-catalog.json a partir do TEXTO do catálogo do openGym (AGPL-3.0; as entradas
// "exercisedb" vêm do ExerciseDB sob MIT; ver NOTICE.md). Mídia (catalogue/media) nunca entra.
//
// Uso: node scripts/import-opengym.mjs <checkout-do-openGym> <sha>
// O checkout só precisa de catalogue/exercises/*.json e catalogue/i18n/pt-BR.json (sparse checkout).
// Os arquivos de lá são dado não confiável: lidos com JSON.parse, campos em lista branca e tipos conferidos.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [src, sha] = process.argv.slice(2);
if (!src || !/^[0-9a-f]{40}$/.test(sha ?? '')) {
  throw new Error(
    'uso: node scripts/import-opengym.mjs <checkout> <sha de 40 hex>',
  );
}

const str = (v, max = 400) =>
  typeof v === 'string' && v.length <= max ? v : null;
const strs = (v, max = 400) =>
  Array.isArray(v) && v.length <= 20 && v.every((x) => str(x, max) !== null)
    ? v
    : null;

const dir = join(src, 'catalogue', 'exercises');
const pt = JSON.parse(
  readFileSync(join(src, 'catalogue', 'i18n', 'pt-BR.json'), 'utf8'),
);

const rows = [];
let skipped = 0;
for (const file of readdirSync(dir).sort()) {
  const e = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  // Variantes femininas são só um ponteiro para outra mídia ({ id, variantOf }): sem texto próprio.
  if (e.variantOf !== undefined) {
    skipped++;
    continue;
  }
  const id = /^\d{4,6}$/.test(e.id) ? e.id : null;
  const row = [
    id,
    str(e.name),
    str(e.bodyPart, 40),
    str(e.equipment, 40),
    str(e.target, 40),
    strs(e.secondaryMuscles, 40),
    str(e.category, 40),
    strs(e.instructions),
  ];
  if (row.some((x) => x === null)) throw new Error(`entrada inválida: ${file}`);
  const t = pt[id];
  rows.push([...row, str(t?.name) ?? '', strs(t?.instructions) ?? []]);
}

const out = {
  source: `https://github.com/DuarteSantos8/openGym/tree/${sha}/catalogue`,
  license:
    'AGPL-3.0 (textSource exercisedb: MIT, ExerciseDB/hasaneyldrm). Ver NOTICE.md.',
  fields: [
    'id',
    'name',
    'bodyPart',
    'equipment',
    'target',
    'secondaryMuscles',
    'category',
    'instructions',
    'namePt',
    'instructionsPt',
  ],
  rows,
};
writeFileSync(
  new URL('../assets/opengym-catalog.json', import.meta.url),
  JSON.stringify(out) + '\n',
);
console.log(`${rows.length} exercícios, ${skipped} variantes puladas`);
