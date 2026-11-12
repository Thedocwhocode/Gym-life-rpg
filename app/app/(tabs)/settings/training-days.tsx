import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import Check from '@/components/presentation/pixel/Check';
import ListItem from '@/components/presentation/pixel/ListItem';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { setTrainingDays } from '@/store/choices';
import { selectJourney } from '@/store/journey';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

const WEEK = [1, 2, 3, 4, 5, 6, 7];

/** D4: dias da semana planejados; cada troca é uma escolha datada (vale de hoje em diante). */
export default function TrainingDays() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const dispatch = useDispatch();
  const days = useAppSelector(selectJourney).trainingDays;
  const toggle = (d: number) =>
    dispatch(
      setTrainingDays(
        days.includes(d) ? days.filter((x) => x !== d) : [...days, d],
      ),
    );

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={{ title: t('rpg.days.title') }} />
      <Text style={{ ...type.body, color: palette.text2 }}>
        {t('rpg.days.subtitle')}
      </Text>
      <View>
        {WEEK.map((d) => (
          <ListItem
            key={d}
            testID={`training-day-${d}`}
            title={t(`rpg.day.${d}` as TranslationKey)}
            leading={<Check kind="checkbox" checked={days.includes(d)} />}
            chevron={false}
            onPress={() => toggle(d)}
          />
        ))}
      </View>
    </FullHeightScrollView>
  );
}
