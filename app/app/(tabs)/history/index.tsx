import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import LimitedHtml from '@/components/presentation/limited-html';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import Button from '@/components/presentation/pixel/Button';
import IconButton from '@/components/presentation/pixel/IconButton';
import SessionCard from '@/components/presentation/rpg/SessionCard';
import { sessionXp } from '@/store/rpg/effects';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { addUnpublishedSessionId } from '@/store/feed';
import {
  deleteStoredSession,
  selectSessions,
  selectSessionsInMonth,
} from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LocalDate, YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const formatDate = useFormatDate();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const latesBodyweight = useAppSelector((x) =>
    x.program.upcomingSessions
      .map((x) => x.at(0)?.bodyweight)
      .unwrapOr(undefined),
  );
  const sessions = useAppSelector(selectSessions);
  const sessionsInMonth = useAppSelectorWithArg(
    selectSessionsInMonth,
    currentYearMonth,
  );
  const { push } = useRouter();
  const currentWorkoutSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const onSelectSession = (session: Session) => {
    dispatch(setCurrentSession({ target: 'historySession', session }));
    push('/history/edit');
  };
  const createSessionAtDate = (date: LocalDate) => {
    const newSession = Session.freeformSession(date, latesBodyweight);
    onSelectSession(newSession);
  };
  const [
    replaceCurrentSessionConfirmOpen,
    setReplaceCurrentSessionConfirmOpen,
  ] = useState(false);
  const [
    deleteSelectedWorkoutConfirmOpen,
    setDeleteSelectedWorkoutConfirmOpen,
  ] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Session>();
  const deleteWorkout = (session: Session, force = false) => {
    if (!force) {
      setSelectedWorkout(session);
      setDeleteSelectedWorkoutConfirmOpen(true);
    } else if (selectedWorkout) {
      dispatch(deleteStoredSession(selectedWorkout.id));
      dispatch(addUnpublishedSessionId(selectedWorkout.id));
      setDeleteSelectedWorkoutConfirmOpen(false);
      setSelectedWorkout(undefined);
    }
  };

  const startWorkout = (session: Session, force = false) => {
    if (currentWorkoutSession && !force) {
      setSelectedWorkout(session);
      setReplaceCurrentSessionConfirmOpen(true);
    } else {
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: session
            .withNothingCompleted()
            .with({ date: LocalDate.now(), id: uuid() }),
        }),
      );
      setReplaceCurrentSessionConfirmOpen(false);
      setSelectedWorkout(undefined);

      push('/(tabs)/(session)/session', { withAnchor: true });
    }
  };
  return (
    <>
      <Stack.Screen
        options={headerOptions(t('rpg.tab.history'), t('rpg.history.eyebrow'))}
      />
      <FullHeightScrollView
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        <HistoryCalendarCard
          currentYearMonth={currentYearMonth}
          sessions={sessions}
          onDateSelect={createSessionAtDate}
          onMonthChange={setCurrentYearMonth}
          onDeleteSession={(s) => {
            deleteWorkout(s);
          }}
          onSessionSelect={onSelectSession}
        />
        <View testID="history-list" style={{ gap: 12 }}>
          {sessionsInMonth.length === 0 && (
            <EmptyInfo icon="calendar">
              <LimitedHtml
                value={t('workout.no_sessions_in_month.message', {
                  month: formatDate(currentYearMonth.atDay(1), {
                    month: 'long',
                  }),
                })}
              />
            </EmptyInfo>
          )}
          {sessionsInMonth.map((session) => (
            <SessionCard
              key={session.id}
              filled
              session={session}
              eyebrow={`${
                session.isComplete
                  ? t('rpg.history.complete')
                  : t('rpg.history.partial')
              } · +${sessionXp(session)} XP`}
              eyebrowTone={session.isComplete ? 'success' : 'accent'}
              actions={
                <>
                  <IconButton
                    icon="play"
                    variant="secondary"
                    label={t('workout.start_this.button')}
                    onPress={() => startWorkout(session)}
                  />
                  <IconButton
                    icon="trash"
                    variant="secondary"
                    label={t('generic.delete.button')}
                    onPress={() => deleteWorkout(session)}
                  />
                  <Button
                    icon="edit"
                    testID="history-edit-workout"
                    onPress={() => onSelectSession(session)}
                  >
                    {t('workout.edit.button')}
                  </Button>
                </>
              }
            />
          ))}
        </View>
      </FullHeightScrollView>
      <ConfirmationDialog
        headline={t('workout.replace_current.confirm.title')}
        textContent={t('workout.replace_in_progress.confirm.body')}
        open={replaceCurrentSessionConfirmOpen}
        okText={t('generic.replace.button')}
        onOk={() => selectedWorkout && startWorkout(selectedWorkout, true)}
        onCancel={() => {
          setSelectedWorkout(undefined);
          setReplaceCurrentSessionConfirmOpen(false);
        }}
      />
      <ConfirmationDialog
        headline={t('workout.delete.confirm.title')}
        textContent={
          <LimitedHtml
            value={t('workout.delete.confirm.body', {
              sessionName: selectedWorkout?.blueprint.name ?? '',
              date: formatDate(selectedWorkout?.date ?? LocalDate.now(), {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            })}
          />
        }
        open={deleteSelectedWorkoutConfirmOpen}
        danger
        okText={t('generic.delete.button')}
        onOk={() => selectedWorkout && deleteWorkout(selectedWorkout, true)}
        onCancel={() => {
          setSelectedWorkout(undefined);
          setDeleteSelectedWorkoutConfirmOpen(false);
        }}
      />
    </>
  );
}
