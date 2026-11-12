import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  catalogKey,
  displayName,
  fromRows,
  match,
  search,
  toDescriptor,
  words,
} from './exercise-catalog';

const file = JSON.parse(
  readFileSync(join(__dirname, '../assets/opengym-catalog.json'), 'utf8'),
) as { rows: Parameters<typeof fromRows>[0] };
const catalog = fromRows(file.rows);

describe('exercise-catalog', () => {
  it('normaliza acento, caixa, palavras vazias e jargão de ficha', () => {
    expect(words('Supino RETO com Halteres')).toEqual(['supino', 'halter']);
    expect(words('Tríceps pulley')).toEqual(['triceps', 'pulley']);
  });

  it('tem só texto, sem variantes, e todo exercício em pt-BR', () => {
    expect(catalog.length).toBeGreaterThan(5000);
    expect(catalog.every((e) => e.namePt && e.instructions.length)).toBe(true);
  });

  it.each([
    ['Supino reto', '0025'],
    ['Puxada frente', '0579'],
    ['Remada curvada', '0027'],
    ['Rosca direta', '0031'],
    ['Levantamento terra', '0032'],
    ['barbell bench press', '0025'],
  ])('casa "%s" com %s', (name, id) => {
    expect(match(catalog, name)?.id).toBe(id);
  });

  it('sem casamento quando falta uma palavra', () => {
    expect(match(catalog, 'supino xyzzy')).toBeUndefined();
    expect(search(catalog, '   ')).toEqual([]);
  });

  it('vira ExerciseDescriptor no idioma do app, com chave og:<id>', () => {
    const e = match(catalog, 'Supino reto');
    if (!e) throw new Error('sem casamento');
    expect(catalogKey(e.id)).toBe('og:0025');
    expect(displayName(e, 'en')).toBe('Barbell bench press');
    const pt = toDescriptor(e, 'pt');
    expect(pt.name).toBe('Supino com barra');
    expect(pt.muscles[0]).toBe('pectorals');
    expect(pt.instructions).toContain('\n');
  });
});
