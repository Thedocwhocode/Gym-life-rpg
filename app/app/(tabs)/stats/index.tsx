import { Loader } from '@/components/presentation/loader';
import SingleValueStatisticCard from '@/components/presentation/single-value-statistic-card';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  ExerciseStatistics,
  fetchOverallStats,
  GranularStatisticView,
  selectOverallView,
  setOverallViewSession,
  setOverallViewTime,
  setStatsIsDirty,
} from '@/store/stats';
import { formatDuration } from '@/utils/format-date';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import ExerciseStatGraphCard from '@/components/presentation/exercise-stat-graph-card';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { LocalDate, Period } from '@js-joda/core';
import {
  selectCompletedDistinctSessionNames,
  selectSessions,
} from '@/store/stored-sessions';
import { useEffect, useMemo, useRef, useState } from 'react';
import BodyweightStatGraphCard from '@/components/presentation/bodyweight-stat-graph-card';
import { useScroll } from '@/hooks/useScrollListener';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import SessionStatGraphCard from '@/components/presentation/session-stat-graph-card';
import { Weight } from '@/models/weight';
import EmptyInfo from '@/components/presentation/empty-info';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import TextField from '@/components/presentation/pixel/TextField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { type } from '@/theme/tokens';

export default function StatsPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);
  const sessionCount = useAppSelector((s) => selectSessions(s).length);
  const [searchText, setSearchText] = useState<string>('');
  const { handleScroll } = useScroll();
  const scrollRef = useRef<FlashListRef<ExerciseStatistics>>(null);
  const data = useMemo(
    () =>
      stats?.exerciseStats.filter((x) =>
        x.exerciseName
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase()),
      ),
    [stats?.exerciseStats, searchText],
  );
  useEffect(() => {
    scrollRef.current?.scrollToTop();
  }, [data]);
  if (!stats) {
    return <Loader />;
  }

  return (
    <>
      <Stack.Screen
        options={headerOptions(
          t('stats.statistics.title'),
          t('rpg.stats.eyebrow'),
        )}
      />
      {/* DR5: com menos de 2 sessões não há tendência; nada de gráfico vazio. */}
      {sessionCount < 2 ? (
        <EmptyInfo testID="stats-empty" icon="barChart">
          {t('rpg.stats.empty')}
        </EmptyInfo>
      ) : (
        <FlashList
          ref={scrollRef}
          onScroll={handleScroll}
          ListHeaderComponent={
            <ListHeader
              searchText={searchText}
              setSearchText={setSearchText}
              stats={stats}
            />
          }
          data={data}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          keyExtractor={(item) => item.exerciseName}
          renderItem={({ item }) => (
            <ExerciseStatGraphCard
              exerciseStats={item}
              title={item.exerciseName}
            />
          )}
        />
      )}
    </>
  );
}

function ListHeader({
  stats,
  searchText,
  setSearchText,
}: {
  stats: GranularStatisticView;
  searchText: string;
  setSearchText: (value: string) => void;
}) {
  const time = useAppSelector((x) => x.stats.overallViewTime);
  const sessionName = useAppSelector((x) => x.stats.overallViewSessionName);
  const sessionNames = useAppSelectorWithArg(
    selectCompletedDistinctSessionNames,
    LocalDate.now().minus(time),
  );
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const timeOptions: SelectButtonOption<Period>[] = [
    {
      label: t('numbers.num_days.label', { count: '7' }),
      value: Period.ofDays(7),
    },
    {
      label: t('numbers.num_days.label', { count: '14' }),
      value: Period.ofDays(14),
    },
    {
      label: t('numbers.num_days.label', { count: '30' }),
      value: Period.ofDays(30),
    },
    {
      label: t('numbers.num_days.label', { count: '90' }),
      value: Period.ofDays(90),
    },
    {
      label: t('numbers.num_days.label', { count: '180' }),
      value: Period.ofDays(180),
    },
    {
      label: t('numbers.num_days.label', { count: '365' }),
      value: Period.ofDays(365),
    },
    { label: t('stats.all_time.label'), value: Period.ofDays(36500) },
  ];
  const sessions: SelectButtonOption<string | undefined>[] = sessionNames
    .map((value) => ({
      label: value,
      value: value as string | undefined,
    }))
    .concat({
      value: undefined,
      label: t('workout.all.title'),
    });
  return (
    <View style={{ gap: 12, marginBottom: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <SelectButton
          size="sm"
          value={sessionName}
          options={sessions}
          onChange={(name) => {
            dispatch(setOverallViewSession(name));
            dispatch(setStatsIsDirty(true));
            dispatch(fetchOverallStats());
          }}
        />
        <SelectButton
          testID="stats-time-selector"
          size="sm"
          value={time}
          options={timeOptions}
          onChange={(x) => {
            dispatch(setOverallViewTime(x));
            dispatch(setStatsIsDirty(true));
            dispatch(fetchOverallStats());
          }}
        />
      </View>
      <TextField
        prefix="⌕"
        placeholder={t('rpg.stats.search')}
        accessibilityLabel={t('generic.search.button')}
        value={searchText}
        onChangeText={setSearchText}
      />
      {searchText ? undefined : (
        <>
          {[0, 2].map((row) => (
            <View key={row} style={{ flexDirection: 'row', gap: 12 }}>
              <TopLevelStatCard index={row} stats={stats} />
              <TopLevelStatCard index={row + 1} stats={stats} />
            </View>
          ))}
          <SessionStatGraphCard sessionStats={stats.sessionStats} />
          <BodyweightStatGraphCard bodyweightStats={stats.bodyweightStats} />
        </>
      )}
    </View>
  );
}

function StatValue({ children }: { children: string }) {
  const { palette } = useAppTheme();
  return (
    <Text
      numberOfLines={2}
      style={{ ...type.stat, color: accentText(palette) }}
    >
      {children}
    </Text>
  );
}

const weightText = (w: Weight | undefined) =>
  w && !w.value.isZero() ? w.shortLocaleFormat(1) : '-';

function TopLevelStatCard(props: {
  index: number;
  stats: GranularStatisticView;
}) {
  const { t } = useTranslate();
  const { stats, index } = props;
  switch (index) {
    case 0:
      return (
        <SingleValueStatisticCard
          title={t('stats.max_weight_in_workout.label')}
        >
          <StatValue>{weightText(stats.maxWeightLiftedInAWorkout)}</StatValue>
        </SingleValueStatisticCard>
      );
    case 1:
      return (
        <SingleValueStatisticCard title={t('workout.average_length.label')}>
          <StatValue>
            {formatDuration(stats.averageSessionLength, 'mins')}
          </StatValue>
        </SingleValueStatisticCard>
      );
    case 2:
      return (
        <SingleValueStatisticCard title={t('stats.most_time_spent.label')}>
          <StatValue>
            {stats.exerciseMostTimeSpent?.exerciseName ?? '-'}
          </StatValue>
        </SingleValueStatisticCard>
      );
    case 3:
      return (
        <SingleValueStatisticCard title={t('stats.heaviest_lift.label')}>
          <StatValue>{weightText(stats.heaviestLift?.weight)}</StatValue>
          <HeaviestName name={stats.heaviestLift?.exerciseName} />
        </SingleValueStatisticCard>
      );
  }
}

function HeaviestName({ name }: { name: string | undefined }) {
  const { palette } = useAppTheme();
  if (!name) return undefined;
  return (
    <Text numberOfLines={1} style={{ ...type.small, color: palette.text2 }}>
      {name}
    </Text>
  );
}
