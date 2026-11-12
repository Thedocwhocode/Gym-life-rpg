import HeartBar from '@/components/presentation/journey/HeartBar';
import Button from '@/components/presentation/pixel/Button';
import Dialog from '@/components/presentation/pixel/Dialog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import {
  markChronicleSeen,
  markHeartsSeen,
  markJourneyIntroSeen,
  selectChoices,
} from '@/store/choices';
import { selectJourney } from '@/store/journey';
import { HEARTS } from '@/store/journey/rules/hearts';
import { openingOverlay } from '@/store/journey/rules/opening';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { useDispatch } from 'react-redux';

/**
 * Avisos de abertura (F6): coração perdido, crônica da semana e boas-vindas da Jornada (DR9).
 * Um por vez, depois da recompensa; cada um só some quando o herói o fecha.
 */
export default function OpeningOverlay() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const choices = useAppSelector(selectChoices);
  const sessionsHydrated = useAppSelector((s) => s.storedSessions.isHydrated);
  const hasSessions = useAppSelector(
    (s) =>
      s.storedSessions.isHydrated &&
      Object.keys(s.storedSessions.sessions).length > 0,
  );
  const reward = useAppSelector((s) => !!s.rpg.lastSessionReward);
  const { hearts, chronicle } = useAppSelector(selectJourney);
  const ready = choices.isHydrated && sessionsHydrated;

  // Herói novo não tem histórico para "recalcular": as boas-vindas valem só para quem já treinava.
  useEffect(() => {
    if (ready && !hasSessions && !choices.journeyIntroSeen)
      dispatch(markJourneyIntroSeen());
  }, [ready, hasSessions, choices.journeyIntroSeen, dispatch]);

  const seenMissed = choices.heartsSeenMissed ?? 0;
  const lost = hearts.missed.slice(seenMissed);
  const current = ready
    ? openingOverlay({
        reward,
        heart: lost.length > 0,
        chronicle: !!chronicle,
        intro: hasSessions && !choices.journeyIntroSeen,
      })
    : undefined;
  if (!current || current === 'reward') return null;

  const dayName = (n: number) => t(`rpg.day.${n}` as TranslationKey);
  const close =
    current === 'heart'
      ? () => dispatch(markHeartsSeen(hearts.missed.length))
      : current === 'chronicle'
        ? () => chronicle && dispatch(markChronicleSeen(chronicle.week))
        : () => dispatch(markJourneyIntroSeen());

  return (
    <Portal>
      <Dialog visible onDismiss={close}>
        <View testID={`opening-${current}`} style={{ gap: 12 }}>
          {current === 'heart' ? (
            <>
              <Dialog.Title>{t('rpg.hearts.lost.title')}</Dialog.Title>
              <HeartBar
                hearts={hearts.hearts}
                max={HEARTS.max}
                lostKey={hearts.missed.length}
              />
              <Text style={{ ...type.body, color: palette.text2 }}>
                {t('rpg.hearts.lost.body', {
                  days: lost
                    .map((d) => dayName(d.dayOfWeek().value()))
                    .join(', '),
                })}
              </Text>
              <Text style={{ ...type.micro, color: palette.text3 }}>
                {t(hearts.hearts === 0 ? 'rpg.hearts.zero' : 'rpg.hearts.gain')}
              </Text>
            </>
          ) : current === 'chronicle' && chronicle ? (
            <>
              <Dialog.Title>
                {t('rpg.chronicle.title', { week: chronicle.week })}
              </Dialog.Title>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {chronicle.days.map((trained, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: trained ? palette.success : palette.line2,
                    }}
                  >
                    <Text
                      style={{
                        ...type.micro,
                        color: trained ? palette.success : palette.text3,
                      }}
                    >
                      {t(`rpg.day.short.${i + 1}` as TranslationKey)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={{ ...type.body, color: palette.text1 }}>
                {t('rpg.chronicle.missions', { n: chronicle.missions })}
                {'\n'}
                {t('rpg.chronicle.bosses', { n: chronicle.bosses })}
                {'\n'}
                {t('rpg.chronicle.hearts', { n: chronicle.heartsLost })}
                {chronicle.skills.length > 0
                  ? `\n${t('rpg.chronicle.skills', {
                      list: chronicle.skills
                        .map((s) => t(`rpg.skill.${s}` as TranslationKey))
                        .join(', '),
                    })}`
                  : ''}
              </Text>
              <Text style={{ ...type.label, color: palette.reward }}>
                {t('rpg.chronicle.xp', { n: chronicle.xp })}
                {chronicle.perfect ? ` · ${t('rpg.chronicle.perfect')}` : ''}
              </Text>
            </>
          ) : (
            <>
              <Dialog.Title>{t('rpg.intro.title')}</Dialog.Title>
              <Text style={{ ...type.body, color: palette.text2 }}>
                {t('rpg.intro.body')}
              </Text>
            </>
          )}
        </View>
        <Dialog.Actions>
          {current === 'intro' && (
            <Button
              variant="secondary"
              testID="opening-intro-days"
              onPress={() => {
                close();
                push('/settings/training-days');
              }}
            >
              {t('rpg.intro.days')}
            </Button>
          )}
          <Button testID="opening-ok" onPress={close}>
            {t('generic.ok.button')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
