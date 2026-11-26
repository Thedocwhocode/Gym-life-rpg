import PixelBar from '@/components/presentation/pixel/PixelBar';
import {
  dailyRatio,
  QuestItems,
} from '@/components/presentation/system/DailyQuestWindow';
import SystemWindow from '@/components/presentation/system/SystemWindow';
import { useAppTheme } from '@/hooks/useAppTheme';
import type {
  DailyCounts,
  DailyItem,
  DailyTargets,
} from '@/store/journey/rules/daily';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Text } from 'react-native';

/** Quest de Recuperação: metade do que faltou ontem, hoje, para o streak não zerar. */
export default function RecoveryQuest({
  targets,
  progress,
  streak,
  onSet,
}: {
  targets: DailyTargets;
  progress: DailyCounts;
  streak: number;
  onSet: (item: DailyItem, value: number) => void;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  return (
    <SystemWindow
      kind="recovery"
      testID="recovery-quest"
      title={t('rpg.recovery.title')}
      footer={
        <Text style={{ ...type.small, color: palette.text3 }}>
          {t('rpg.recovery.fail')}
        </Text>
      }
    >
      <Text style={{ ...type.body, color: palette.text2 }}>
        {t('rpg.recovery.body', { n: streak })}
      </Text>
      <PixelBar
        value={dailyRatio(progress, targets)}
        segments={20}
        tone="reward"
      />
      <QuestItems
        targets={targets}
        done={progress}
        onSet={onSet}
        testID="recovery-quest"
      />
      <Text style={{ ...type.label, color: palette.reward }}>
        {t('rpg.recovery.success')}
      </Text>
    </SystemWindow>
  );
}
