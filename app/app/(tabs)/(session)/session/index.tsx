import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  persistCurrentSession,
  selectCurrentSession,
} from '@/store/current-session';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useId, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function Index() {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectCurrentSession, 'workoutSession');
  const keepAwake = useAppSelector(
    (x) => x.settings.keepScreenAwakeDuringWorkout,
  );
  const { dismissTo } = useRouter();
  const { t } = useTranslate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = (force = false) => {
    if (session) {
      if (!force && !session.isComplete) {
        setConfirmOpen(true);
        return;
      }
      setConfirmOpen(false);
      dispatch(addUnpublishedSessionId(session.id));
    }
    dispatch(persistCurrentSession('workoutSession'));
    dispatch(setStatsIsDirty(true));
    dismissTo('/');
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

  return (
    <>
      {keepAwake && <KeepAwake />}
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
          headerRight: () => (
            <SessionMoreMenuComponent target="workoutSession" />
          ),
        }}
      />
      <SessionComponent
        target="workoutSession"
        showBodyweight={showBodyweight}
        saveAndClose={() => save()}
      />
      <ConfirmationDialog
        okText={t('generic.finish.button')}
        onOk={() => save(true)}
        onCancel={() => setConfirmOpen(false)}
        textContent={
          <LimitedHtml value={t('workout.finish.incomplete.body')} />
        }
        headline={t('workout.finish.confirm.title')}
        open={confirmOpen}
      />
    </>
  );
}

/**
 * Allows us to conditionally keep the screen awake, as we cannot use hooks conditionally
 */
function KeepAwake() {
  const tag = useId();
  useEffect(() => {
    // On web the Wake Lock API rejects when the tab is hidden or the permission is denied;
    // useKeepAwake leaves that rejection uncaught, so we swallow it (best-effort feature).
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [tag]);
  return <></>;
}
