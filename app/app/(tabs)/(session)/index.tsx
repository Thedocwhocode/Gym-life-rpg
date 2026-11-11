import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import Button from '@/components/presentation/pixel/Button';
import Fab from '@/components/presentation/pixel/Fab';
import IconButton from '@/components/presentation/pixel/IconButton';
import SessionCard from '@/components/presentation/rpg/SessionCard';
import { Remote } from '@/components/presentation/remote';
import AndroidNotificationAlert from '@/components/smart/android-notification-alert';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { publishUnpublishedSessions } from '@/store/feed';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { setEditingSession } from '@/store/session-editor';
import { executeRemoteBackup } from '@/store/settings';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { MigrateToWeightUnitsWizard } from '@/components/smart/migrate-to-weight-units';
import { WelcomeWizard } from '@/components/smart/welcome-wizard';
import { SessionDiffSaveDialog } from '@/components/smart/session-diff-save-dialog';

function PlanManager() {
  const { push } = useRouter();
  const { t } = useTranslate();
  const activeProgramId = useAppSelector(
    (s: RootState) => s.program.activeProgramId,
  );

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          variant="secondary"
          icon="list-box"
          style={{ flex: 1 }}
          onPress={() => push(`/settings/program-list`, { withAnchor: true })}
        >
          {t('plan.choose.button')}
        </Button>
        <Button
          variant="secondary"
          icon="edit"
          style={{ flex: 1 }}
          onPress={() =>
            push(`/settings/manage-workouts/${activeProgramId}`, {
              withAnchor: true,
            })
          }
        >
          {t('workout.edit_workouts.button')}
        </Button>
      </View>
      <Button
        variant="ghost"
        icon="upload"
        testID="pdf-import-entry"
        onPress={() => push('/settings/pdf-import')}
      >
        {t('pdf.entry.button')}
      </Button>
    </View>
  );
}

/** "Em andamento · 2/9 séries" (só conta séries de força). */
function useProgressEyebrow(session: Session | undefined) {
  const { t } = useTranslate();
  if (!session) return undefined;
  const sets = session.recordedExercises.flatMap((ex) =>
    ex instanceof RecordedWeightedExercise ? ex.potentialSets : [],
  );
  const done = sets.filter((x) => x.set !== undefined).length;
  return sets.length
    ? t('rpg.train.in_progress_sets', { done, total: sets.length })
    : t('rpg.train.in_progress');
}

function ListUpcomingWorkouts({
  upcoming,
  selectSession,
}: {
  upcoming: readonly Session[];
  selectSession: (s: Session) => void;
}) {
  const plan = useAppSelector(selectActiveProgram);
  const { t } = useTranslate();
  const currentSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const planId = useAppSelector((x) => x.program.activeProgramId);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [confirmDeleteSessionOpen, setConfirmDeleteSessionOpen] =
    useState(false);
  const eyebrow = useProgressEyebrow(currentSession);
  const clearCurrentSession = () => {
    dispatch(
      setCurrentSession({ session: undefined, target: 'workoutSession' }),
    );
    dispatch(fetchUpcomingSessions());
  };
  return (
    <View style={{ flex: 1, gap: 10, paddingTop: 16, paddingBottom: 72 }}>
      <SessionDiffSaveDialog />
      <WelcomeWizard />
      <PlanManager />
      {currentSession && (
        <View style={{ gap: 10, marginTop: 12 }}>
          <AsciiDivider label={t('rpg.train.current')} />
          <SessionCard
            highlight
            session={currentSession}
            eyebrow={eyebrow}
            actions={
              <>
                <IconButton
                  testID="clear-current-workout"
                  icon="trash"
                  variant="secondary"
                  label={t('workout.clear_current.button')}
                  onPress={() => setConfirmDeleteSessionOpen(true)}
                />
                <Button
                  icon="play"
                  testID="resume-workout-button"
                  onPress={() => selectSession(currentSession)}
                >
                  {t('workout.resume.button')}
                </Button>
              </>
            }
          />
        </View>
      )}
      {!!upcoming.length && (
        <View style={{ marginTop: 12 }}>
          <AsciiDivider label={t('rpg.train.upcoming')} />
        </View>
      )}
      {upcoming.map((session, index) => {
        const sessionPlanIndex = plan.sessions.findIndex((x) =>
          x.equals(session.blueprint),
        );
        const handleEditPress = () => {
          dispatch(setEditingSession(session.blueprint));
          push(
            `/(tabs)/settings/manage-workouts/${planId}/manage-session/${sessionPlanIndex}`,
            { withAnchor: true },
          );
        };
        return (
          <SessionCard
            key={index}
            session={session}
            actions={
              <>
                {sessionPlanIndex !== -1 && (
                  <IconButton
                    icon="edit"
                    variant="secondary"
                    label={t('workout.edit_workouts.button')}
                    onPress={handleEditPress}
                  />
                )}
                <Button
                  icon="play"
                  testID="start-resume-workout-button"
                  onPress={() => selectSession(session)}
                >
                  {session.isStarted
                    ? t('workout.resume.button')
                    : t('workout.start.button')}
                </Button>
              </>
            }
          />
        );
      })}
      <ConfirmationDialog
        headline={t('workout.clear_current.confirm.title')}
        textContent={t('workout.clear_current.confirm.body')}
        okText={t('generic.clear.button')}
        danger
        onOk={() => {
          clearCurrentSession();
          setConfirmDeleteSessionOpen(false);
        }}
        open={confirmDeleteSessionOpen}
        onCancel={() => setConfirmDeleteSessionOpen(false)}
      />
    </View>
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  const activePlan = useAppSelector(selectActiveProgram);
  // const program = useAppSelector(selectActiveProgram);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();
  const currentSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const currentBodyweight = upcomingSessions
    .map((x) => x.at(0)?.bodyweight)
    .unwrapOr(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const rootNavigationState = useRootNavigationState();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const navigatorReady = rootNavigationState?.key != null;
  // const [hasRedirected, setHasRedirected] = useState(false);
  // const [hasMounted, setHasMounted] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  // useMountEffect(() => {
  //   setHasMounted(true);
  // });
  // useEffect(() => {
  //   if (!navigatorReady || !hasMounted) return;
  //   // On app open from cold if we have a current session loaded, show it automatically.
  //   if (currentSession?.isStarted && !hasRedirected) {
  //     push('/(tabs)/(session)/session');
  //   }
  //   setHasRedirected(true);
  // }, [
  //   navigatorReady,
  //   hasRedirected,
  //   currentSession?.isStarted,
  //   push,
  //   hasMounted,
  // ]);

  useFocusEffect(() => {
    dispatch(fetchUpcomingSessions());
    dispatch(publishUnpublishedSessions());
    dispatch(executeRemoteBackup({}));
  });

  const selectSession = (session: Session) => {
    if (!currentSession || currentSession.equals(session)) {
      replaceSession(session);
    } else {
      setSelectedSession(session);
    }
  };
  const replaceSession = useDebouncedCallback(
    (session: Session) => {
      setSelectedSession(undefined);
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session,
        }),
      );
      push('/session');
    },
    500,
    { leading: true, trailing: false },
  );
  const replaceSessionDialogAction = () => {
    if (!selectedSession) return;
    replaceSession(selectedSession);
  };

  const createFreeformSession = () => {
    const newSession = Session.freeformSession(
      LocalDate.now(),
      currentBodyweight,
    );
    selectSession(newSession);
  };

  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <Fab
          icon="zap"
          label={t('workout.freeform.title')}
          onPress={createFreeformSession}
        />
      }
    />
  );

  return (
    <FullHeightScrollView
      floatingChildren={floatingBottomContainer}
      scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}
    >
      <Stack.Screen
        options={headerOptions('GymLife RPG', activePlan.name || undefined)}
      />
      <AndroidNotificationAlert />
      <MigrateToWeightUnitsWizard />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
          return (
            <ListUpcomingWorkouts
              selectSession={selectSession}
              upcoming={upcoming.map((x) => Session.fromPOJO(x))}
            />
          );
        }}
      />
      <ConfirmationDialog
        open={!!selectedSession}
        onCancel={() => setSelectedSession(undefined)}
        okText={t('generic.replace.button')}
        onOk={replaceSessionDialogAction}
        headline={t('workout.replace_current.confirm.title')}
        textContent={t('workout.replace_in_progress.confirm.body')}
      />
    </FullHeightScrollView>
  );
}
