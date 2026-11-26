import FxStage from '@/components/presentation/fx/FxStage';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import Button from '@/components/presentation/pixel/Button';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Segmented from '@/components/presentation/pixel/Segmented';
import Tag from '@/components/presentation/pixel/Tag';
import SystemWindow from '@/components/presentation/system/SystemWindow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHeroAttributes } from '@/hooks/useHeroAttributes';
import { useAppSelector } from '@/store';
import { addStudyMinutes, selectStudyLog } from '@/store/choices';
import {
  clock,
  INT_PER_MINUTE,
  pauseTimer,
  phaseMs,
  resumeTimer,
  startFocus,
  STUDY_PRESETS,
  studyMinutesOn,
  tickTimer,
  timerLeft,
  type StudyPreset,
  type StudyTimer,
} from '@/store/journey/rules/study';
import { systemText } from '@/theme/palettes';
import { fontFamily, type, typeSize, TITLE_MAX_SCALE } from '@/theme/tokens';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

type Notice = { kind: 'done'; int: number; rest: number } | { kind: 'rest' };

// shortcut: o relógio vive na memória do módulo (sobrevive a sair da tela, não a recarregar a
// página); se pedirem bloco que sobreviva ao reload, gravar o timer nas preferências.
let kept: StudyTimer = { phase: 'idle', preset: 'short' };
const keep = (s: StudyTimer) => {
  kept = s;
};

const PRESETS: StudyPreset[] = ['short', 'long'];
/** 12,5 em pt, 12.5 em en. */
const num = (n: number) => localeFormatBigNumber(new BigNumber(n));

/** Grimório do foco: pomodoro de estudo. Só bloco de foco completo vira INT (0,5 por minuto). */
export default function StudyPage() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const dispatch = useDispatch();
  const log = useAppSelector(selectStudyLog) ?? [];
  const attrs = useHeroAttributes();
  const [timer, setTimerState] = useState<StudyTimer>(kept);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState<Notice>();
  const setTimer = (s: StudyTimer) => {
    keep(s);
    setTimerState(s);
  };

  const running = timer.endsAt !== undefined;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running]);

  // Fecha a fase quando o relógio zera, inclusive na volta de uma aba em segundo plano.
  useEffect(() => {
    const r = tickTimer(timer, now);
    if (r.next === timer) return;
    if (r.earned > 0) {
      dispatch(
        addStudyMinutes({
          date: LocalDate.now().toString(),
          minutes: r.earned,
        }),
      );
      setNotice({
        kind: 'done',
        int: r.earned * INT_PER_MINUTE,
        rest: STUDY_PRESETS[timer.preset].rest,
      });
    }
    if (r.restDone) setNotice({ kind: 'rest' });
    setTimer(r.next);
  }, [timer, now, dispatch]);

  const act = (f: (at: number) => StudyTimer) => () => {
    const at = Date.now();
    setNow(at);
    setTimer(f(at));
  };
  const left = timer.phase === 'idle' ? phaseMs(timer) : timerLeft(timer, now);
  const progress = timer.phase === 'idle' ? 0 : 1 - left / phaseMs(timer);
  const phaseColor =
    timer.phase === 'focus'
      ? palette.attrInt
      : timer.phase === 'rest'
        ? systemText(palette)
        : palette.text1;
  const phaseLabel =
    timer.phase !== 'idle' && !running
      ? t('study.phase.paused')
      : t(`study.phase.${timer.phase}`);
  const todayMin = studyMinutesOn(log, LocalDate.now().toString());

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={headerOptions(t('study.title'), t('study.eyebrow'))}
      />
      <PixelBox padding={16} innerStyle={{ gap: 12 }} testID="study-timer">
        <View style={{ height: 120, overflow: 'hidden' }}>
          <FxStage
            fx={
              timer.phase === 'rest'
                ? 'arcane/time-stop'
                : timer.phase === 'focus'
                  ? 'arcane/magic-circle-cast'
                  : 'arcane/spell-charge'
            }
            fill
            hold={timer.phase !== 'idle' && !running}
            label={t('study.fx')}
          />
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Tag
            tone={timer.phase === 'rest' ? 'system' : 'int'}
            testID="study-phase"
          >
            {phaseLabel}
          </Tag>
          <Text
            testID="study-clock"
            accessibilityRole="timer"
            maxFontSizeMultiplier={TITLE_MAX_SCALE}
            style={{
              fontFamily: fontFamily.displayBold,
              fontSize: typeSize.hero,
              lineHeight: typeSize.hero + 4,
              color: phaseColor,
              fontVariant: ['tabular-nums'],
            }}
          >
            {clock(left)}
          </Text>
        </View>
        <PixelBar
          value={progress}
          segments={25}
          tone={timer.phase === 'rest' ? 'energy' : 'xp'}
          testID="study-bar"
        />
        {timer.phase === 'idle' ? (
          <Segmented
            testID="study-preset"
            value={timer.preset}
            onChange={(preset) => setTimer({ phase: 'idle', preset })}
            options={PRESETS.map((p) => ({
              value: p,
              label: t('study.preset', STUDY_PRESETS[p]),
              testID: `study-preset-${p}`,
            }))}
          />
        ) : (
          <Text
            style={{ ...type.small, color: palette.text3, textAlign: 'center' }}
          >
            {t('study.preset', STUDY_PRESETS[timer.preset])}
          </Text>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {timer.phase === 'idle' ? (
            <Button
              style={{ flex: 1 }}
              icon="play"
              testID="study-start"
              onPress={act((at) => {
                setNotice(undefined);
                return startFocus(timer.preset, at);
              })}
            >
              {t('study.start')}
            </Button>
          ) : (
            <>
              <Button
                style={{ flex: 1 }}
                icon={running ? 'pause' : 'play'}
                testID={running ? 'study-pause' : 'study-resume'}
                onPress={act((at) =>
                  running ? pauseTimer(timer, at) : resumeTimer(timer, at),
                )}
              >
                {running ? t('study.pause') : t('study.resume')}
              </Button>
              <Button
                style={{ flex: 1 }}
                variant="secondary"
                icon="close"
                testID="study-stop"
                onPress={act(() => ({ phase: 'idle', preset: timer.preset }))}
              >
                {timer.phase === 'rest'
                  ? t('study.skipRest')
                  : t('study.giveUp')}
              </Button>
            </>
          )}
        </View>
      </PixelBox>

      {notice ? (
        <SystemWindow
          kind={notice.kind === 'done' ? 'quest' : 'info'}
          title={
            notice.kind === 'done'
              ? t('study.done.title')
              : t('study.restDone.title')
          }
          testID="study-notice"
        >
          <Text style={{ ...type.body, color: palette.text1 }}>
            {notice.kind === 'done'
              ? t('study.done.body', {
                  int: num(notice.int),
                  rest: notice.rest,
                })
              : t('study.restDone.body')}
          </Text>
        </SystemWindow>
      ) : null}

      <SystemWindow
        kind="info"
        title={t('study.ledger.title')}
        testID="study-ledger"
      >
        <Text
          testID="study-today"
          style={{ ...type.body, color: palette.text1 }}
        >
          {t('study.today', {
            min: todayMin,
            int: num(todayMin * INT_PER_MINUTE),
          })}
        </Text>
        <Text style={{ ...type.body, color: palette.attrInt }}>
          {t('study.total', { n: attrs.INT.total })}
        </Text>
        <Text style={{ ...type.small, color: palette.text3 }}>
          {t('study.rule')}
        </Text>
      </SystemWindow>
    </FullHeightScrollView>
  );
}
