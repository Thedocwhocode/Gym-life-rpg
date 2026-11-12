import { describe, expect, it } from 'vitest';
import en from './en.json';
import pt from './pt.json';

describe('i18n pt × en', () => {
  it('pt tem toda chave do en (sem cair no inglês)', () => {
    expect(Object.keys(en).filter((k) => !(k in pt))).toEqual([]);
    expect(Object.keys(pt).filter((k) => !(k in en))).toEqual([]);
  });
});
