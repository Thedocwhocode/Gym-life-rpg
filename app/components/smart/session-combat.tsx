import CombatStage from '@/components/presentation/combat/CombatStage';
import FxBurst from '@/components/presentation/fx/FxBurst';
import { UI_MOMENTS } from '@/components/presentation/fx/moments';
import type { FxId } from '@/components/presentation/fx/registry';
import { useHaptic } from '@/hooks/useHaptic';
import { NormalizedName } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectJourney } from '@/store/journey';
import { SKILLS } from '@/store/journey/rules/skills';
import { showSnackbar } from '@/store/app';
import {
  notifySetTimer,
  selectCurrentSession,
  setExerciseReps,
  setWorkoutSessionLastSetTime,
} from '@/store/current-session';
import {
  classifyStrike,
  combatExercises,
  enemiesFor,
  hitCount,
  isCombo,
  isPr,
  nextStrike,
} from '@/store/journey/rules/combat';
import { selectBestWeights } from '@/store/stored-sessions';
import { OffsetDateTime } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { useDispatch, useStore } from 'react-redux';

interface Moment {
  fx: FxId;
  options: Record<string, unknown>;
  x: DimensionValue;
  key: number;
}

// ponytail: por processo; reabrir o app com a sessão ainda sem séries repete a contagem.
const countedDown = new Set<string>();

/**
 * Combate da sessão de treino (F5): palco, momentos, vibração e o CTA "Golpear".
 * O placar sai da sessão (regras puras); aqui só mora o que é efêmero (qual golpe tocar, recolhido ou não).
 */
export function useSessionCombat(
  session: Session | undefined,
  enabled: boolean,
) {
  const { t } = useTranslate();
  const haptic = useHaptic();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const best = useAppSelectorWithArg(selectBestWeights, session?.id ?? '');
  const { equipped } = useAppSelector(selectJourney);
  const attackFx = SKILLS.find((s) => s.id === equipped)?.fx;
  const [strikeKey, setStrikeKey] = useState(0);
  const [focus, setFocus] = useState<number>();
  const [collapsed, setCollapsed] = useState(
    () => !!session && hitCount(combatExercises(session)) > 0,
  );
  const toggled = useRef(false);
  const prDone = useRef(new Set<number>());
  const [moment, setMoment] = useState<Moment>();
  const play = useCallback(
    (
      m: { fx: FxId; options: Record<string, unknown> },
      x: DimensionValue = '50%',
    ) => setMoment((prev) => ({ ...m, x, key: (prev?.key ?? 0) + 1 })),
    [],
  );

  // 3-2-1 ao entrar numa sessão nova; nunca ao retomar (DR2). Não bloqueia toque (FxBurst sem eventos).
  const sessionId = session?.id;
  const started = !!session?.isStarted;
  useEffect(() => {
    if (!enabled || !sessionId || started || countedDown.has(sessionId)) return;
    countedDown.add(sessionId);
    play(UI_MOMENTS.countdown());
  }, [enabled, sessionId, started, play]);

  /** Chamar depois de gravar as reps de uma série, com as reps de antes. */
  const onSetChanged = (
    exerciseIndex: number,
    setIndex: number,
    before: number | undefined,
  ) => {
    if (!enabled) return;
    const after = selectCurrentSession(store.getState(), 'workoutSession');
    const ex = after?.recordedExercises[exerciseIndex];
    if (!after || !(ex instanceof RecordedWeightedExercise)) return;
    const reps = ex.potentialSets[setIndex]?.set?.repsCompleted;
    const strike = classifyStrike(before, reps);
    if (strike === 'dodge') return play(UI_MOMENTS.alert());
    if (strike !== 'hit' || reps === undefined) return;

    haptic('click');
    setFocus(exerciseIndex);
    setStrikeKey((k) => k + 1);
    const exercises = combatExercises(after);
    const weight = ex.potentialSets[setIndex].weight;
    const key = NormalizedName.fromExerciseBlueprint(ex.blueprint).toString();
    const hits = hitCount(exercises);
    if (!prDone.current.has(exerciseIndex) && isPr(weight, best.get(key))) {
      prDone.current.add(exerciseIndex);
      haptic('rise');
      play(UI_MOMENTS.pr(weight.shortLocaleFormat(), t('combat.pr.label')));
    } else if (isCombo(hits)) {
      play(UI_MOMENTS.combo(hits, t('combat.combo.label')));
    } else {
      play(UI_MOMENTS.set(reps), '72%');
    }
    const enemy = enemiesFor(exercises, after.isFreeform)[exerciseIndex];
    if (enemy?.boss && enemy.defeated) haptic('rise');
  };

  const next = enabled && session ? nextStrike(session) : undefined;
  const strike = () => {
    // lido na hora do toque: com toque duplo o `next` do render já está velho
    const live = selectCurrentSession(store.getState(), 'workoutSession');
    const next = live ? nextStrike(live) : undefined;
    if (!next) return;
    const target = 'workoutSession' as const;
    const where = {
      exerciseIndex: next.exerciseIndex,
      setIndex: next.setIndex,
    };
    const prevTime = store.getState().currentSession.workoutSessionLastSetTime;
    dispatch(
      setExerciseReps({
        target,
        payload: { ...where, reps: next.reps, time: OffsetDateTime.now() },
      }),
    );
    dispatch(notifySetTimer());
    onSetChanged(next.exerciseIndex, next.setIndex, undefined);
    dispatch(
      showSnackbar({
        text: t('combat.strike.toast'),
        action: t('generic.undo.button'),
        // Desfazer: devolve a série, o relógio do descanso e o aviso do timer
        dispatchAction: [
          setExerciseReps({
            target,
            payload: { ...where, reps: undefined, time: OffsetDateTime.now() },
          }),
          setWorkoutSessionLastSetTime(prevTime),
          notifySetTimer(),
        ],
      }),
    );
  };
  const strikeLabel = next
    ? t('combat.strike.button', {
        reps: next.reps,
        weight: next.weight.shortLocaleFormat(),
      })
    : undefined;

  const enemies =
    enabled && session
      ? enemiesFor(combatExercises(session), session.isFreeform)
      : [];
  const nextIndex = session?.nextExercise
    ? session.recordedExercises.indexOf(session.nextExercise)
    : -1;
  const shown =
    enemies[focus ?? -1] ?? enemies[nextIndex] ?? enemies[enemies.length - 1];

  const stage = shown ? (
    <CombatStage
      key={shown.index}
      enemy={shown}
      attackFx={attackFx}
      strikeKey={strikeKey}
      collapsed={collapsed}
      onToggle={() => {
        toggled.current = true;
        setCollapsed((c) => !c);
      }}
      onStrikeDone={() => {
        // DR2: depois do 1º golpe o palco vira faixa, a não ser que o usuário tenha mexido
        if (strikeKey > 0 && !toggled.current) setCollapsed(true);
      }}
    >
      {moment ? (
        <FxBurst
          fx={moment.fx}
          options={moment.options}
          playKey={moment.key}
          x={moment.x}
          y={collapsed ? '50%' : '40%'}
          onDone={() => setMoment(undefined)}
        />
      ) : null}
    </CombatStage>
  ) : null;

  return {
    stage,
    onSetChanged,
    strike: next ? strike : undefined,
    strikeLabel,
  };
}
