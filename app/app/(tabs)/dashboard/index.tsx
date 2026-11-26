import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import AchievementsRow from '@/components/presentation/rpg/AchievementsRow';
import AttributeStat from '@/components/presentation/rpg/AttributeStat';
import CharacterSheet from '@/components/presentation/rpg/CharacterSheet';
import QuestPanel from '@/components/presentation/rpg/QuestPanel';
import DailyQuest from '@/components/smart/daily-quest';
import JourneyPanel from '@/components/smart/journey-panel';
import NextQuestCard from '@/components/smart/next-quest-card';
import WeatherBanner from '@/components/smart/weather-banner';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useHeroAttributes } from '@/hooks/useHeroAttributes';
import type { AttrKey } from '@/store/rpg/derive';
import { IsoFields, LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

const GRID: AttrKey[][] = [['STR', 'AGI'], ['END', 'VIT'], ['INT']];

/** DR1: ficha → próxima missão → quests → clima → atributos → conquistas. */
export default function DashboardPage() {
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const attrs = useHeroAttributes();
  const { push } = useRouter();
  const today = LocalDate.now();
  const eyebrow = t('rpg.dashboard.eyebrow', {
    week: today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR),
    month: formatDate(today, { month: 'long' }),
  });

  return (
    <>
      <Stack.Screen options={headerOptions(t('rpg.tab.dashboard'), eyebrow)} />
      <ScrollView
        contentContainerStyle={{
          gap: 24,
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 32,
        }}
      >
        <CharacterSheet />
        <JourneyPanel />
        <NextQuestCard />
        <DailyQuest />
        <QuestPanel />
        <WeatherBanner />
        <View style={{ gap: 10 }}>
          <AsciiDivider
            label={t('rpg.attr.title')}
            meta={t('rpg.attr.lifetime')}
          />
          {GRID.map((row) => (
            <View key={row.join()} style={{ flexDirection: 'row', gap: 8 }}>
              {row.map((k) => {
                const stat = (
                  <AttributeStat
                    key={k}
                    attr={k}
                    value={String(attrs[k].total)}
                    label={t(`rpg.attr.${k}`)}
                    subtitle={t(`rpg.attr.${k}.week`, {
                      count: attrs[k].week,
                    })}
                  />
                );
                // INT vem do pomodoro: o card abre a tela de estudo.
                return k === 'INT' ? (
                  <Pressable
                    key={k}
                    style={{ flex: 1 }}
                    accessibilityRole="link"
                    accessibilityLabel={t('study.open')}
                    testID="attr-INT-study"
                    onPress={() => push('/(tabs)/settings/study')}
                  >
                    {stat}
                  </Pressable>
                ) : (
                  stat
                );
              })}
            </View>
          ))}
        </View>
        <AchievementsRow />
      </ScrollView>
    </>
  );
}
