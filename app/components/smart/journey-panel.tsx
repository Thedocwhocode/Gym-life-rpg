import HeartBar from '@/components/presentation/journey/HeartBar';
import StatusBanner from '@/components/presentation/journey/StatusBanner';
import ListItem from '@/components/presentation/pixel/ListItem';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectChoices } from '@/store/choices';
import { selectJourney } from '@/store/journey';
import { HEARTS } from '@/store/journey/rules/hearts';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

/** Painel (DR8/D.2): corações + regra + status ativos; sem dias de treino, o convite para defini-los. */
export default function JourneyPanel() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const { push } = useRouter();
  const { hearts, statuses } = useAppSelector(selectJourney);
  const seen = useAppSelector(selectChoices).heartsSeenMissed ?? 0;
  const unseen = hearts.missed.length > seen;

  return (
    <View style={{ gap: 10 }}>
      {hearts.enabled ? (
        <View style={{ gap: 6 }}>
          <HeartBar
            hearts={hearts.hearts}
            max={HEARTS.max}
            lostKey={unseen ? hearts.missed.length : 0}
          />
          <Text style={{ ...type.micro, color: palette.text3 }}>
            {t(hearts.hearts === 0 ? 'rpg.hearts.zero' : 'rpg.hearts.lose')}
          </Text>
        </View>
      ) : (
        <ListItem
          testID="journey-days-prompt"
          icon="heart"
          title={t('rpg.days.prompt')}
          chevron
          onPress={() => push('/settings/training-days')}
        />
      )}
      {statuses.map((s) => (
        <StatusBanner
          key={s}
          status={s}
          cure={
            s === 'exausto'
              ? hearts.cureProgress / HEARTS.cureMissions
              : undefined
          }
        />
      ))}
    </View>
  );
}
