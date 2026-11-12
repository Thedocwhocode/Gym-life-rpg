import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import MonsterCard from '@/components/presentation/journey/MonsterCard';
import AsciiBar from '@/components/presentation/pixel/AsciiBar';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectJourney } from '@/store/journey';
import { BESTIARY, type Beast } from '@/store/journey/rules/bestiary';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

function Grid({
  beasts,
  state,
}: {
  beasts: readonly Beast[];
  state: ReturnType<typeof selectJourney>['beasts'];
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {beasts.map((b) => (
        <View key={b.id} style={{ width: '48%', flexGrow: 1 }}>
          <MonsterCard beast={b} state={state[b.id] ?? 'unknown'} />
        </View>
      ))}
    </View>
  );
}

/** Bestiário (design-spec §D.5): estado de cada monstro sai das sessões salvas. */
export default function Bestiary() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const { beasts } = useAppSelector(selectJourney);
  const defeated = BESTIARY.filter((b) => beasts[b.id] === 'defeated').length;
  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={{ title: t('rpg.journey.bestiary') }} />
      <Text style={{ ...type.body, color: palette.text2 }}>
        {t('rpg.bestiary.intro')}
      </Text>
      <View style={{ gap: 4 }}>
        <AsciiBar
          value={defeated / BESTIARY.length}
          cells={18}
          tone="hp"
          testID="bestiary-progress"
        />
        <Text style={{ ...type.micro, color: palette.text3 }}>
          {t('rpg.bestiary.count', { n: defeated, total: BESTIARY.length })}
        </Text>
      </View>
      <AsciiDivider label={t('rpg.bestiary.bosses')} />
      <Grid beasts={BESTIARY.filter((b) => b.boss)} state={beasts} />
      <AsciiDivider label={t('rpg.bestiary.creatures')} />
      <Grid beasts={BESTIARY.filter((b) => !b.boss)} state={beasts} />
    </FullHeightScrollView>
  );
}
