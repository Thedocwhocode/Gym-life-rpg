import Button from '@/components/presentation/pixel/Button';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { selectJourney } from '@/store/journey';
import { fetchUpcomingSessions } from '@/store/program';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

/** DR1: o treino em andamento (Retomar) ou o próximo do plano ativo (Iniciar). */
export default function NextQuestCard() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const { push } = useRouter();
  const dispatch = useDispatch();
  const current = useAppSelectorWithArg(selectCurrentSession, 'workoutSession');
  const upcoming = useAppSelector((s) => s.program.upcomingSessions);
  const { restRecommended } = useAppSelector(selectJourney);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUpcomingSessions());
    }, [dispatch]),
  );

  const firstUpcoming = upcoming.map((x) => x.at(0)).unwrapOr(undefined);
  const next = current ?? Session.fromPOJO(firstUpcoming);

  if (!next) {
    // Ainda carregando: não pisca o estado vazio.
    if (!upcoming.isSuccess()) return null;
    return (
      <PixelBox testID="next-quest" padding={16} innerStyle={{ gap: 12 }}>
        <Text style={{ ...type.label, color: palette.text3 }}>
          {t('rpg.next.title')}
        </Text>
        <Text style={{ ...type.body, color: palette.text2 }}>
          {t('rpg.next.no_plan')}
        </Text>
        <Button
          variant="secondary"
          icon="list-box"
          onPress={() => push('/settings/program-list')}
        >
          {t('rpg.next.see_plans')}
        </Button>
      </PixelBox>
    );
  }

  const resume = !!current || next.isStarted;
  const start = () => {
    if (!current) {
      dispatch(setCurrentSession({ target: 'workoutSession', session: next }));
    }
    push('/session');
  };

  return (
    <PixelBox testID="next-quest" padding={16} innerStyle={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ ...type.label, color: palette.text3 }}>
          {t('rpg.next.title')}
        </Text>
        <Text numberOfLines={1} style={{ ...type.title, color: palette.text1 }}>
          {next.blueprint.name}
        </Text>
        <Text style={{ ...type.small, color: palette.text2 }}>
          {t('rpg.next.exercises', { count: next.recordedExercises.length })}
        </Text>
        {restRecommended && !resume && (
          <Text
            testID="next-quest-rest"
            style={{ ...type.small, color: palette.barEnergy }}
          >
            {t('rpg.next.rest')}
          </Text>
        )}
      </View>
      <Button
        testID="next-quest-button"
        size="lg"
        block
        icon="play"
        onPress={start}
      >
        {resume ? t('rpg.next.resume') : t('rpg.next.start')}
      </Button>
    </PixelBox>
  );
}
