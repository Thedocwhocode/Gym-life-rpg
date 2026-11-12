import { describe, expect, it } from 'vitest';
import { createStage, flashesPerSecond, toFxText } from './engine';
import { UI_MOMENTS } from './moments';
import { FX_IDS } from './registry';

describe('toFxText', () => {
  it('tira acentos e põe em caixa alta', () => {
    expect(toFxText('Missão concluída')).toBe('MISSAO CONCLUIDA');
    expect(toFxText('Ação · força')).toBe('ACAO  FORCA');
  });
});

describe('createStage', () => {
  it('monta e desenha todos os efeitos registrados', () => {
    expect(FX_IDS).toHaveLength(68);
    for (const fx of FX_IDS) {
      const stage = createStage({ fx, repeat: false });
      const out = new Uint8ClampedArray(stage.w * stage.h * 4);
      stage.advance(0.1);
      stage.render(out);
      // o fundo carvão é opaco: algum pixel sempre fica pintado
      expect(
        out.some((b) => b > 0),
        fx,
      ).toBe(true);
    }
  }, 30_000); // 68 efeitos: passa dos 5 s padrão com a suíte em paralelo

  it('avisa o fim de um efeito único uma vez só', () => {
    const stage = createStage({ fx: 'ui/exclamation', repeat: false });
    let ends = 0;
    for (let i = 0; i < 300; i++) if (stage.advance(1 / 30).ended) ends++;
    expect(ends).toBe(1);
  });

  it('recusa efeito fora do registro', () => {
    expect(() => createStage({ fx: 'ui/nao-existe' as never })).toThrow(
      /desconhecido/,
    );
  });
});

describe('flashesPerSecond', () => {
  it('conta pares de variações fortes na pior janela de 1 s', () => {
    const calm = Array.from({ length: 60 }, () => 0.2);
    expect(flashesPerSecond(calm)).toBe(0);
    // claro/escuro a cada quadro: 29 variações em 30 quadros
    const strobe = Array.from({ length: 60 }, (_, i) => (i % 2 ? 0.9 : 0.1));
    expect(flashesPerSecond(strobe)).toBeGreaterThan(3);
  });

  it('mantém ui/countdown, o efeito mais piscante, abaixo de 3 flashes/s', () => {
    const stage = createStage({ fx: 'ui/countdown', repeat: false });
    const out = new Uint8ClampedArray(stage.w * stage.h * 4);
    const luma: number[] = [];
    for (let f = 0; f < 90; f++) {
      stage.advance(1 / 30);
      stage.render(out);
      let s = 0;
      for (let p = 0; p < out.length; p += 4)
        s +=
          (0.2126 * out[p] + 0.7152 * out[p + 1] + 0.0722 * out[p + 2]) / 255;
      luma.push(s / (out.length / 4));
    }
    expect(flashesPerSecond(luma)).toBeLessThanOrEqual(3);
  });
});

describe('UI_MOMENTS', () => {
  const args: Record<keyof typeof UI_MOMENTS, unknown[]> = {
    combo: [7, 'Sequência'],
    pr: ['102,5kg', 'Recorde'],
    set: [10],
    xp: [],
    achievement: ['Conquista', 'Desbloqueada'],
    heartLost: [],
    bossHit: [0.8, 0.4],
    countdown: [],
    alert: [],
    confetti: [],
    quest: ['Missão concluída'],
    levelUp: [],
  };
  it.each(Object.keys(args) as (keyof typeof UI_MOMENTS)[])(
    '%s monta sem fundo e termina',
    (name) => {
      const { fx, options } = (
        UI_MOMENTS[name] as (
          ...a: unknown[]
        ) => ReturnType<(typeof UI_MOMENTS)['xp']>
      )(...args[name]);
      const stage = createStage({ fx, options, bg: 'none', repeat: false });
      const out = new Uint8ClampedArray(stage.w * stage.h * 4);
      let ended = false;
      for (let i = 0; i < 300 && !ended; i++) {
        ended = stage.advance(1 / 30).ended;
        if (i === 15) stage.render(out);
      }
      expect(ended).toBe(true);
      // sem fundo, só o efeito pinta: algo opaco no quadro do meio
      expect(out.some((b, k) => k % 4 === 3 && b > 0)).toBe(true);
    },
  );
});

describe('texto nos efeitos', () => {
  const ascii = Array.from({ length: 95 }, (_, i) =>
    String.fromCharCode(32 + i),
  ).join('');
  it.each([
    ['ui/quest-complete', { text: ascii }],
    ['ui/quest-complete', { text: '' }],
    ['ui/crit-number', { label: ascii, text: '62.5KG!' }],
    ['ui/crit-number', { label: '', text: '' }],
    ['ui/achievement', { title: ascii, text: '' }],
  ] as const)('%s aceita %j', (fx, options) => {
    const stage = createStage({ fx, options, bg: 'none', repeat: false });
    const out = new Uint8ClampedArray(stage.w * stage.h * 4);
    let ended = false;
    for (let i = 0; i < 300 && !ended; i++) {
      ended = stage.advance(1 / 30).ended;
      stage.render(out);
    }
    expect(ended).toBe(true);
  });
});
