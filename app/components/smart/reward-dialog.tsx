import FxStage from '@/components/presentation/fx/FxStage';
import Button from '@/components/presentation/pixel/Button';
import Dialog from '@/components/presentation/pixel/Dialog';
import Icon from '@/components/presentation/pixel/Icon';
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
import { titleForLevel } from '@/store/rpg/derive';
import {
  ACHIEVEMENTS,
  clearLevelUp,
  clearSessionReward,
  selectRpgLevel,
} from '@/store/rpg';
import { selectSessions } from '@/store/stored-sessions';
import { fontFamily, type } from '@/theme/tokens';
import { shareCardImage } from '@/utils/share-card';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
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
  const [page, setPage] = useState(0);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);

  const loot = (reward?.newAchievementIds ?? []).flatMap((id) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    return a ? [a] : [];
  });
  const pages = rewardPages(newLevel !== undefined, loot.length);
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

  const session = reward.sessionId
    ? sessions.find((s) => s.id === reward.sessionId)
    : undefined;
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
          ) : (
            <>
              <Icon name="gift" size={32} color={palette.reward} />
              <Dialog.Title style={center}>
                {t('reward.loot.title')}
              </Dialog.Title>
              <Text style={{ ...type.label, color: palette.reward }}>
                {t('reward.achievements.label')}
              </Text>
              <View style={{ alignSelf: 'stretch', gap: 8 }}>
                {loot.map((a) => (
                  <View
                    key={a.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Icon name="trophy" size={16} color={palette.accent} />
                    <Text
                      style={{ ...type.body, color: palette.text1, flex: 1 }}
                    >
                      {a.name}
                    </Text>
                  </View>
                ))}
              </View>
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
