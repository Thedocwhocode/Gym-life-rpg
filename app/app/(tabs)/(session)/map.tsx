import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Tag, { type TagTone } from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectJourney, selectPlanWorkouts } from '@/store/journey';
import { dungeonNodes, type NodeState } from '@/store/journey/rules/dungeon';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const NODE_TONE: Record<NodeState, TagTone> = {
  done: 'success',
  current: 'reward',
  open: 'muted',
  boss: 'danger',
};

/** Masmorra (DR22): os treinos do plano ativo; o próximo é o mesmo de "Próxima missão". */
export default function DungeonMap() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const workouts = useAppSelector(selectPlanWorkouts);
  const { clears } = useAppSelector(selectJourney);
  const next = useAppSelector((s) =>
    s.program.upcomingSessions
      .map((x) => x.at(0)?.blueprint.name)
      .unwrapOr(undefined),
  );
  const nodes = dungeonNodes(workouts, next);

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={headerOptions(
          t('rpg.dungeon.title'),
          t('rpg.dungeon.eyebrow', { n: clears.total }),
        )}
      />
      {workouts.length < 2 ? (
        <Text
          testID="dungeon-no-plan"
          style={{ ...type.body, color: palette.text2 }}
        >
          {t('rpg.dungeon.no_plan')}
        </Text>
      ) : (
        <>
          <Text style={{ ...type.body, color: palette.text2 }}>
            {t('rpg.dungeon.intro')}
          </Text>
          {nodes.map((n, i) => (
            <View key={`${n.name}-${i}`} style={{ gap: 4 }}>
              {i > 0 && (
                <Text
                  style={{
                    ...type.micro,
                    color: palette.text3,
                    textAlign: 'center',
                  }}
                >
                  │
                </Text>
              )}
              <PixelBox
                testID={`dungeon-node-${i}`}
                tone={
                  n.state === 'current'
                    ? 'accent'
                    : n.boss
                      ? 'danger'
                      : 'default'
                }
                glow={n.state === 'current'}
                padding={12}
                innerStyle={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  opacity: n.state === 'done' ? 0.7 : 1,
                }}
              >
                <Icon
                  name={
                    n.boss ? 'trophy' : n.state === 'done' ? 'check' : 'flag'
                  }
                  size={20}
                  color={n.boss ? palette.dangerStrong : palette.text1}
                />
                <Text
                  numberOfLines={1}
                  style={{ ...type.label, color: palette.text1, flex: 1 }}
                >
                  {n.name}
                </Text>
                <Tag tone={NODE_TONE[n.state]} size="sm">
                  {t(`rpg.dungeon.node.${n.state}` as TranslationKey)}
                </Tag>
              </PixelBox>
            </View>
          ))}
        </>
      )}
    </FullHeightScrollView>
  );
}
