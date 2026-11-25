import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fromRows, match } from './exercise-catalog';

// Os 51 exercícios de uma ficha real (de um consultor brasileiro), cedida pelo dono do projeto em 2026-11-25.
// A versão em PDF, só com as tabelas e sem aluno, professor, fotos, marca ou datas, está em
// test-assets/pdf/ficha-real-anonimizada.pdf.
const NAMES = [
  'Agachamento sumô com halter',
  'Cadeira flexora',
  'Mesa flexora',
  'Supino inclinado com halter (banco em 30 graus)',
  'Supino inclinado articulado',
  'Flexão de braços',
  'Desenvolvimento com halter sentado',
  'Elevação lateral com halter',
  'Remada unilateral ajoelhado na polia',
  'Pulley frente triângulo',
  'Remada cavalinho',
  'Barra fixa pronada',
  'Crucifixo inclinado com halter (30°)',
  'Tríceps francês na polia média com corda',
  'Tríceps francês com halter',
  'Stiff com barra pés afastados',
  'Abdução de quadril na polia',
  'Abdução de quadril com caneleira',
  'Abdominal canivete com anilha',
  'Abdominal reto com anilha',
  'Supino reto com barra',
  'Supino reto com halter',
  'Tríceps nas paralelas',
  'Rosca martelo com halter',
  'Crucifixo inverso na máquina',
  'Agachamento hack linear',
  'Leg-press horizontal',
  'Panturrilha no leg-press horizontal com pés neutros',
  'Panturrilha no smith',
  'Banco romano',
  'Elevação pélvica na máquina',
  'Cadeira extensora',
  'Remada baixa com triângulo',
  'Crucifixo na máquina',
  'Rosca scott com barra W',
  'Rotação de tronco na polia média',
  'Flexão declinada',
  'Drop squat',
  'Slide leg',
  'Tríceps testa na parede',
  'Abdominal infra',
  'Afundo com salto',
  'Panturrilha unilateral em pé',
  'Superman',
  'Alpinista',
  'Elevação pélvica unilateral',
  'Cadeirinha',
  'Flexão arqueira',
  'Prancha sobe e desce',
  'Abdominal bicicleta',
  'Bike/Elíptico',
];

const file = JSON.parse(
  readFileSync(join(__dirname, '../assets/opengym-catalog.json'), 'utf8'),
) as { rows: Parameters<typeof fromRows>[0] };
const catalog = fromRows(file.rows);

describe('ficha real × catálogo', () => {
  // Antes dos sinônimos e apelidos (2026-11-25): 30 de 51, e "Banco romano" e "Tríceps francês com halter"
  // caíam errado. Agora só "Bike/Elíptico" (cardio, duas máquinas) fica sem sugestão.
  it('sugere exercício para pelo menos 50 dos 51 nomes', () => {
    const hits = NAMES.filter((n) => match(catalog, n));
    expect(NAMES).toHaveLength(51);
    expect(hits.length).toBeGreaterThanOrEqual(50);
  });

  it.each([
    ['Agachamento sumô com halter', '2323'],
    ['Cadeira flexora', '0599'],
    ['Cadeira extensora', '0585'],
    ['Supino reto com halter', '0289'],
    ['Elevação lateral com halter', '0334'],
    ['Rosca martelo com halter', '0313'],
    ['Leg-press horizontal', '2951'],
    ['Abdominal bicicleta', '6211'],
    // Sinônimo (polia → cabo, articulado → máquina, caneleira → peso) e nota entre parênteses.
    ['Remada unilateral ajoelhado na polia', '5369'],
    ['Supino inclinado articulado', '1299'],
    ['Abdução de quadril com caneleira', '0837'],
    ['Supino inclinado com halter (banco em 30 graus)', '0314'],
    ['Crucifixo inclinado com halter (30°)', '0319'],
    // Apelido: antes erravam.
    ['Banco romano', '0489'],
    ['Tríceps francês com halter', '2188'],
  ])('%s → %s', (name, id) => {
    expect(match(catalog, name)?.id).toBe(id);
  });
});
