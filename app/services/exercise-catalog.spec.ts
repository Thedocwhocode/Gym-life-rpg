import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SessionBlueprintPOJO } from '@/models/blueprint-models';
import { describe, expect, it } from 'vitest';
import {
  applyCatalog,
  catalogKey,
  displayName,
  fromRows,
  label,
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
    // apelidos de ficha (antes erravam ou casavam pela metade)
    ['Agachamento livre', '0043'],
    ['Prancha', '0463'],
    ['Elevação lateral', '0334'],
    ['Abdominal supra', '0274'],
    ['Desenvolvimento com halteres', '0405'],
  ])('casa "%s" com %s', (name, id) => {
    expect(match(catalog, name)?.id).toBe(id);
  });

  it('traduz músculo e equipamento só em pt, e todo valor do catálogo tem tradução', () => {
    expect(label('pectorals', 'pt-BR')).toBe('peitorais');
    expect(label('pectorals', 'en')).toBe('pectorals');
    const values = new Set(catalog.flatMap((e) => [e.target, e.equipment]));
    expect(
      [...values].filter(
        (v) => label(v, 'pt') === v && v !== 'kettlebell' && v !== 'landmine',
      ),
    ).toEqual([]);
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
  it('aplica só os casamentos confirmados e devolve os itens og:<id>', () => {
    const squat = match(catalog, 'Agachamento livre');
    const session = {
      type: 'SessionBlueprint',
      name: 'A',
      notes: '',
      exercises: [
        { name: 'Agachamento livre', sets: 4 },
        { name: 'Prancha', sets: 3 },
      ],
    } as unknown as SessionBlueprintPOJO;
    const out = applyCatalog(
      [session],
      { 'Agachamento livre': squat },
      'pt-BR',
    );
    expect(out.sessions[0].exercises.map((e) => e.name)).toEqual([
      'Agachamento completo com barra',
      'Prancha',
    ]);
    expect(out.sessions[0].exercises[0]).toMatchObject({ sets: 4 });
    expect(session.exercises[0].name).toBe('Agachamento livre');
    expect(out.saved.map((x) => x.id)).toEqual(['og:0043']);
  });
});
