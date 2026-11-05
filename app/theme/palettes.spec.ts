import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { accentText, PALETTE_IDS, palettes, type Palette } from './palettes';

const SURFACES = [
  'bgApp',
  'bgSunken',
  'surface1',
  'surface2',
  'surface3',
] as const;
// Textos que precisam de AA (4,5:1) sobre qualquer superfície.
const TEXTS = [
  'text1',
  'text2',
  'text3',
  'accentStrong',
  'dangerStrong',
] as const;

describe('paletas', () => {
  it('têm o mesmo conjunto de chaves', () => {
    const keys = Object.keys(palettes.brasa).sort();
    for (const id of PALETTE_IDS) {
      expect(Object.keys(palettes[id]).sort(), id).toEqual(keys);
    }
  });

  describe.each(PALETTE_IDS)('%s', (id) => {
    const p: Palette = palettes[id];
    for (const text of TEXTS) {
      for (const surface of SURFACES) {
        it(`${text} sobre ${surface} ≥ 4,5:1`, () => {
          expect(contrastRatio(p[text], p[surface])).toBeGreaterThanOrEqual(
            4.5,
          );
        });
      }
    }
    for (const surface of SURFACES) {
      it(`accentText sobre ${surface} ≥ 4,5:1`, () => {
        expect(contrastRatio(accentText(p), p[surface])).toBeGreaterThanOrEqual(
          4.5,
        );
      });
    }
    it('textOnAccent sobre accent ≥ 4,5:1', () => {
      expect(contrastRatio(p.textOnAccent, p.accent)).toBeGreaterThanOrEqual(
        4.5,
      );
    });
    it('textOnDanger sobre dangerDeep (preenchimento do botão) ≥ 4,5:1', () => {
      expect(
        contrastRatio(p.textOnDanger, p.dangerDeep),
      ).toBeGreaterThanOrEqual(4.5);
    });
    it('text1 sobre accentWash e dangerWash ≥ 4,5:1', () => {
      expect(contrastRatio(p.text1, p.accentWash)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.text1, p.dangerWash)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
