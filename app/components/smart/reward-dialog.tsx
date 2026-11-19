import FxStage from '@/components/presentation/fx/FxStage';
import Button from '@/components/presentation/pixel/Button';
import Dialog from '@/components/presentation/pixel/Dialog';
import Icon from '@/components/presentation/pixel/Icon';
import Tag from '@/components/presentation/pixel/Tag';
import ShareCard from '@/components/presentation/rpg/ShareCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { useAppSelector } from '@/store';
import { showSnackbar } from '@/store/app';
import {
  BOSS,
  combatExercises,
  enemiesFor,
  rewardPages,
  shareCardFields,
} from '@/store/journey/rules/combat';
import { selectJourney, selectPlanWorkouts } from '@/store/journey';
import type { XpSource } from '@/store/journey/rules/multipliers';
import { titleForLevel } from '@/store/rpg/derive';
import {
  ACHIEVEMENTS,
  clearLevelUp,
  clearSessionReward,
  selectProgress,
  selectRpgLevel,
} from '@/store/rpg';
import { selectSessions } from '@/store/stored-sessions';
import { fontFamily, type } from '@/theme/tokens';
import { shareCardImage } from '@/utils/share-card';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { useDispatch } from 'react-redux';

/**
 * RewardDialog (TD7/DR3): fila paginada Missão → Level up → Espólio, no máximo 3 páginas.
 * "Pular" fecha tudo em qualquer página; "Compartilhar" (E2) só na última.
 */
export default function RewardDialog() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const haptic = useHaptic();
  const reward = useAppSelector((s) => s.rpg.lastSessionReward);
  const newLevel = useAppSelector((s) =>
    s.rpg.pendingLevelUp ? s.rpg.levelUpNewLevel : undefined,
  );
  const level = useAppSelector(selectRpgLevel);
  const sessions = useAppSelector(selectSessions);
  const workouts = useAppSelector(selectPlanWorkouts);
  const { clears } = useAppSelector(selectJourney);
  const { sources } = useAppSelector(selectProgress);
  const [page, setPage] = useState(0);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);

  const loot = (reward?.newAchievementIds ?? []).flatMap((id) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    return a ? [a] : [];
  });
  const session = reward?.sessionId
    ? sessions.find((s) => s.id === reward.sessionId)
    : undefined;
  // DR22: masmorra limpa = a sessão salva é o último treino de um plano com 2+ treinos.
  const dungeon =
    !!session &&
    workouts.length >= 2 &&
    session.blueprint.name === workouts.at(-1);
  const bonus: XpSource[] = (session && sources[session.id]) ?? [];
  const pages = rewardPages(newLevel !== undefined, loot.length, dungeon);
  const current = pages[Math.min(page, pages.length - 1)];
  const last = page >= pages.length - 1;

  useEffect(() => {
    if (current === 'levelup') haptic('rise');
  }, [current, haptic]);

  if (!reward) return null;

  const close = () => {
    setPage(0);
    dispatch(clearLevelUp());
    dispatch(clearSessionReward());
  };

  const sourceLabel = (b: XpSource) =>
    t(
      (b.source === 'class'
        ? `rpg.class.${b.id}`
        : `rpg.${b.source}.${b.id}`) as TranslationKey,
    );
  const bossDown =
    !!session &&
    enemiesFor(combatExercises(session), session.isFreeform).some(
      (e) => e.boss && e.defeated,
    );
  const shownLevel = newLevel ?? level;
  const card = shareCardFields({
    level: shownLevel,
    title: t(titleForLevel(shownLevel)),
    workout: session?.blueprint.name ?? '',
    xp: reward.xpGained,
    boss: bossDown
      ? t(`combat.monster.${BOSS.id}` as TranslationKey)
      : undefined,
  });

  const share = async () => {
    setSharing(true);
    try {
      await shareCardImage(cardRef);
    } catch {
      dispatch(showSnackbar({ text: t('reward.share.error') }));
    } finally {
      setSharing(false);
    }
  };

  const center = { textAlign: 'center' } as const;
  return (
    <>
      {/* Portal: sem ele o Modal do Paper fica sob o RootStack */}
      <Portal>
        <Dialog visible dismissable={false}>
          <View
            style={{ alignItems: 'center', gap: 12 }}
            testID={`reward-page-${current}`}
          >
            {current === 'mission' ? (
              <>
                <FxStage
                  fx="ui/quest-complete"
                  fill
                  repeat={false}
                  label={t('reward.mission.title')}
                />
                <Icon name="check" size={32} color={palette.success} />
                <Dialog.Title style={center}>
                  {t('reward.mission.title')}
                </Dialog.Title>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: palette.reward,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    testID="reward-xp"
                    style={{
                      fontFamily: fontFamily.monoBold,
                      fontSize: 24,
                      color: palette.reward,
                    }}
                  >
                    {`+${reward.xpGained} XP`}
                  </Text>
                </View>
                {bonus.length > 0 && (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={{ ...type.micro, color: palette.text3 }}>
                      {t('rpg.reward.sources')}
                    </Text>
                    <View
                      testID="reward-sources"
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 6,
                        justifyContent: 'center',
                      }}
                    >
                      {bonus.map((b) => (
                        <Tag
                          key={`${b.source}-${b.id}`}
                          tone={b.pct < 0 ? 'danger' : 'success'}
                          size="sm"
                        >
                          {`${sourceLabel(b)} ${b.pct > 0 ? '+' : ''}${b.pct}%`}
                        </Tag>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : current === 'levelup' ? (
              <>
                <FxStage
                  fx="ui/level-up"
                  fill
                  repeat={false}
                  label={t('reward.levelup.title', { level: shownLevel })}
                />
                <Dialog.Title style={[center, { color: palette.reward }]}>
                  {t('reward.levelup.title', { level: shownLevel })}
                </Dialog.Title>
                <Text
                  style={{
                    ...type.label,
                    ...center,
                    color: palette.accent,
                    textTransform: 'uppercase',
                  }}
                >
                  {t(titleForLevel(shownLevel))}
                </Text>
              </>
            ) : current === 'dungeon' ? (
              <>
                <FxStage
                  fx="ui/quest-complete"
                  fill
                  repeat={false}
                  label={t('rpg.reward.dungeon', { n: clears.total })}
                />
                <Icon name="trophy" size={32} color={palette.reward} />
                <Dialog.Title style={[center, { color: palette.reward }]}>
                  {t('rpg.reward.dungeon', { n: clears.total })}
                </Dialog.Title>
                <Text style={{ ...type.body, ...center, color: palette.text2 }}>
                  {t('rpg.reward.dungeon.body')}
                </Text>
                {loot.length > 0 && (
                  <Text style={{ ...type.label, color: palette.reward }}>
                    {t('reward.achievements.label')}
                  </Text>
                )}
                <LootList loot={loot} />
              </>
            ) : (
              <>
                <Icon name="gift" size={32} color={palette.reward} />
                <Dialog.Title style={center}>
                  {t('reward.loot.title')}
                </Dialog.Title>
                <Text style={{ ...type.label, color: palette.reward }}>
                  {t('reward.achievements.label')}
                </Text>
                <LootList loot={loot} />
              </>
            )}
            {pages.length > 1 ? (
              <Text style={{ ...type.small, color: palette.text3 }}>
                {t('reward.page.label', {
                  current: page + 1,
                  total: pages.length,
                })}
              </Text>
            ) : null}
          </View>
          <Dialog.Actions>
            <Button
              variant="ghost"
              testID="session-reward-continue"
              onPress={close}
            >
              {t('reward.skip.button')}
            </Button>
            {last ? (
              <Button
                variant="secondary"
                icon="upload"
                testID="reward-share"
                disabled={sharing}
                onPress={() => void share()}
              >
                {t('reward.share.button')}
              </Button>
            ) : null}
            <Button
              testID="reward-next"
              onPress={last ? close : () => setPage((p) => p + 1)}
            >
              {t(last ? 'reward.finish.button' : 'reward.continue.button')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* E2: cartão fora da tela, só para a captura (fora do Dialog: a moldura cortaria) */}
      <View
        style={{ position: 'absolute', left: -10000, top: 0 }}
        pointerEvents="none"
        aria-hidden
      >
        <ShareCard
          ref={cardRef}
          fields={card}
          labels={{
            title: t('reward.mission.title'),
            boss: t('share.card.boss'),
            level: t('share.card.level', { level: card.level }),
            brand: 'GYMLIFE RPG',
          }}
        />
      </View>
    </>
  );
}

function LootList({ loot }: { loot: readonly { id: string; name: string }[] }) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  return (
    <View style={{ alignSelf: 'stretch', gap: 8 }}>
      {loot.map((a) => (
        <View
          key={a.id}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Icon name="trophy" size={16} color={palette.accent} />
          <Text style={{ ...type.body, color: palette.text1, flex: 1 }}>
            {t(`rpg.achievement.${a.id}.name` as TranslationKey, a.name)}
          </Text>
        </View>
      ))}
    </View>
  );
}
