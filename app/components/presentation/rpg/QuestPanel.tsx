import AsciiFrame from '@/components/presentation/pixel/AsciiFrame';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import Tag from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectActiveQuests, type Quest } from '@/store/rpg';
import { fontFamily, type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

/** Missões da semana numa moldura ASCII. */
export default function QuestPanel() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const quests = useAppSelector(selectActiveQuests);
  return (
    <AsciiFrame testID="quest-panel" title={t('rpg.quests.title')}>
      <View style={{ gap: 14 }}>
        {quests.length ? (
          quests.map((q) => <QuestRow key={q.id} quest={q} />)
        ) : (
          <Text style={{ ...type.body, color: palette.text3 }}>
            {t('rpg.quests.empty')}
          </Text>
        )}
      </View>
    </AsciiFrame>
  );
}

function QuestRow({ quest }: { quest: Quest }) {
  const { palette } = useAppTheme();
  const done = !!quest.completedAt || quest.progress >= quest.target;
  const ratio = quest.target > 0 ? quest.progress / quest.target : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {done ? (
          <Icon name="check" size={16} color={palette.success} />
        ) : (
          <Text
            style={{
              ...type.small,
              width: 16,
              textAlign: 'center',
              color: palette.accent,
            }}
          >
            ▸
          </Text>
        )}
        <Text
          numberOfLines={1}
          style={{
            ...type.body,
            flex: 1,
            minWidth: 0,
            color: done ? palette.text3 : palette.text1,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {quest.description}
        </Text>
        <Tag tone="reward" brackets={false} size="sm">
          +{quest.xpReward} XP
        </Tag>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 24,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <PixelBar
            value={ratio}
            segments={quest.target <= 12 ? quest.target : 20}
            height={6}
            tone={done ? 'energy' : 'xp'}
          />
        </View>
        <Text
          style={{
            fontFamily: fontFamily.monoBold,
            fontSize: 11,
            color: palette.text2,
          }}
        >
          {Math.min(quest.progress, quest.target)}/{quest.target}
        </Text>
      </View>
    </View>
  );
}
