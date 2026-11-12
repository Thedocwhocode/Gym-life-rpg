import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import AchievementBadge from '@/components/presentation/rpg/AchievementBadge';
import { useAppSelector } from '@/store';
import { selectAllAchievements } from '@/store/rpg';
import { useTranslate } from '@tolgee/react';
import { FlatList, View } from 'react-native';

export default function AchievementsRow() {
  const { t } = useTranslate();
  const achievements = useAppSelector(selectAllAchievements);
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <View testID="achievements" style={{ gap: 12 }}>
      <AsciiDivider
        label={t('rpg.achievement.title')}
        meta={`${unlocked} / ${achievements.length}`}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={achievements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 2 }}
        renderItem={({ item }) => (
          <AchievementBadge
            name={item.name}
            description={item.description}
            icon={item.icon}
            unlockedAt={item.unlockedAt}
          />
        )}
      />
    </View>
  );
}
