import { describe, expect, it } from 'vitest';
import {
  dominantAttr,
  filterEntries,
  patternFor,
  pickerEntry,
} from './patterns';

describe('padrão de movimento e atributo do seletor', () => {
  it('categoria manda, senão o músculo principal, senão isolamento', () => {
    expect(patternFor({ category: 'olympic', muscles: ['quads'] })).toBe('OL');
    expect(
      patternFor({ category: 'stretching', muscles: ['hamstrings'] }),
    ).toBe('MO');
    expect(patternFor({ category: 'strength', muscles: ['quads'] })).toBe('JO');
    expect(patternFor({ category: 'strength', muscles: ['glutes'] })).toBe(
      'QD',
    );
    expect(patternFor({ muscles: ['pectorals', 'triceps'] })).toBe('EP');
    expect(patternFor({ muscles: ['lats'] })).toBe('PX');
    expect(patternFor({ muscles: ['biceps'] })).toBe('IS');
    expect(patternFor({})).toBe('IS');
  });

  it('atributo dominante segue os pesos da regra de XP', () => {
    expect(dominantAttr({ category: 'cardio' })).toBe('END');
    expect(dominantAttr({ category: 'plyometrics' })).toBe('AGI');
    expect(dominantAttr({ muscles: ['abs'] })).toBe('VIT');
    expect(dominantAttr({ muscles: ['quads'] })).toBe('STR');
  });

  it('busca sem acento por nome em qualquer idioma e por músculo, com filtros', () => {
    const list = [
      pickerEntry('a', ['Flexão de braço', 'push-up'], {
        category: 'calisthenics',
        muscles: ['pectorals'],
      }),
      pickerEntry('b', ['Agachamento', 'squat'], { muscles: ['quads'] }),
      pickerEntry('c', ['Corrida'], { category: 'cardio' }),
    ];
    const keys = (r: { key: string }[]) => r.map((e) => e.key);
    expect(keys(filterEntries(list, { q: 'flexao' }))).toEqual(['a']);
    expect(keys(filterEntries(list, { q: 'PUSH' }))).toEqual(['a']);
    expect(keys(filterEntries(list, { q: 'quads' }))).toEqual(['b']);
    expect(keys(filterEntries(list, { q: '', pattern: 'CA' }))).toEqual(['c']);
    expect(keys(filterEntries(list, { q: '', attr: 'STR' }))).toEqual([
      'a',
      'b',
    ]);
    expect(keys(filterEntries(list, { q: 'agach', attr: 'END' }))).toEqual([]);
  });
});
