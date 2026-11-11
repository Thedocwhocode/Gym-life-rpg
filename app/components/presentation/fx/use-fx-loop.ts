import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { FREEZE_MOTION } from '@/utils/motion';
import { createStage, type Stage, type StageSpec } from './engine';
import type { FxStageProps } from './FxStage';

export type FxDraw = (
  rgba: Uint8ClampedArray,
  shake: readonly [number, number],
) => void;

// Abaixo disso nos 2 primeiros segundos, o efeito congela num quadro parado (PLANO §3.6).
// ponytail: o recuo é para quadro parado, não para sprite sheet (B); gerar sheets se o aparelho médio pedir.
// 24 e não 30: telas de 30 Hz oscilam em 29 e congelariam à toa.
const MIN_FPS = 24;
const PROBE_MS = 2000;
// Web é o ambiente de referência do pixelfx; lá o navegador estrangula rAF em aba oculta e a medição
// congelaria o efeito para sempre.
const PROBE = Platform.OS !== 'web';

/** Monta a cena e roda o laço de 30 fps; `draw` só copia o RGBA para a superfície da plataforma. */
export function useFxLoop(props: FxStageProps, draw: FxDraw) {
  const live = useRef(props);
  live.current = props;
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [error, setError] = useState<Error>();
  // leva o erro do laço para o FxBoundary
  if (error) throw error;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) =>
      setActive(s === 'active'),
    );
    return () => sub.remove();
  }, []);

  const { fx, act, target, body, palette, options, size, bg, flip } = props;
  const { companions, repeat, playKey } = props;
  // A cena só depende de dados serializáveis; playKey entra para reiniciar o efeito.
  const specKey = JSON.stringify({
    fx,
    act,
    target,
    body,
    palette,
    options,
    size,
    bg,
    flip,
    companions,
    repeat,
    playKey,
  });
  const stage = useMemo(
    () =>
      createStage(JSON.parse(specKey) as StageSpec, (hit) =>
        live.current.onHit?.(hit),
      ),
    [specKey],
  );
  const rgba = useMemo(
    () => new Uint8ClampedArray(stage.w * stage.h * 4),
    [stage],
  );

  // onDone uma vez por cena: trocar foco/AppState reexecuta o efeito abaixo.
  const doneFor = useRef<Stage | null>(null);
  const frozen = reduced || FREEZE_MOTION;
  useEffect(() => {
    // Sem animação o efeito único "termina" na hora: quem espera onDone (FxBurst, fila da F5) não trava.
    const freeze = () => {
      stage.still();
      drawRef.current(rgba, stage.render(rgba));
      if (stage.loop || live.current.hold || doneFor.current === stage) return;
      doneFor.current = stage;
      live.current.onDone?.();
    };
    if (frozen) {
      freeze();
      return;
    }
    drawRef.current(rgba, stage.render(rgba));
    if (!focused || !active) return;
    let raf = 0;
    let last = performance.now();
    const start = last;
    let ticks = 0;
    const tick = (now: number) => {
      try {
        const p = live.current;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        ticks++;
        if (
          PROBE &&
          now - start > PROBE_MS &&
          ticks / (PROBE_MS / 1000) < MIN_FPS
        ) {
          freeze();
          return;
        }
        const { moved, ended } = stage.advance(
          p.paused ? 0 : dt * (p.speed ?? 1),
          p.hold,
        );
        if (ended) {
          doneFor.current = stage;
          p.onDone?.();
        }
        if (moved) drawRef.current(rgba, stage.render(rgba));
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('efeito pixelfx falhou'));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, rgba, frozen, focused, active]);

  return stage;
}
