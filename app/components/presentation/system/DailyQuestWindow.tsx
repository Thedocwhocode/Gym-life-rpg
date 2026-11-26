import SakugaCheck from '@/components/presentation/fx/SakugaCheck';
import IconButton from '@/components/presentation/pixel/IconButton';
import PixelBar, {
  type BarTone,
} from '@/components/presentation/pixel/PixelBar';
import SystemWindow from '@/components/presentation/system/SystemWindow';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  DAILY_ITEMS,
  DAILY_REWARD,
  DAILY_STEP,
  type DailyCounts,
  type DailyItem,
  type DailyTargets,
} from '@/store/journey/rules/daily';
import { systemText } from '@/theme/palettes';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

/** Fração cumprida somando os itens (cada um conta até a sua meta). */
export function dailyRatio(done: DailyCounts, t: DailyTargets) {
  const items = DAILY_ITEMS.filter((k) => t[k] > 0);
  if (!items.length) return 1;
  return (
    items.reduce((s, k) => s + Math.min(1, (done[k] ?? 0) / t[k]), 0) /
    items.length
  );
}

/** Minutos até a meia-noite local, atualizado a cada minuto. */
function useMinutesToMidnight() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 60000));
  };
  const [min, setMin] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setMin(calc()), 60000);
    return () => clearInterval(id);
  }, []);
  return min;
}

export function QuestItems({
  targets,
  done,
  onSet,
  testID,
}: {
  targets: DailyTargets;
  done: DailyCounts;
  onSet: (item: DailyItem, value: number) => void;
  testID: string;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  return (
    <View style={{ gap: 8 }}>
      {DAILY_ITEMS.filter((k) => targets[k] > 0).map((k) => {
        const have = done[k] ?? 0;
        const met = have >= targets[k];
        const name = t(`rpg.daily.item.${k}`);
        return (
          <View
            key={k}
            testID={`${testID}-${k}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <SakugaCheck
              checked={met}
              // desmarcar zera o item; marcar completa a meta
              onChange={(on) => onSet(k, on ? targets[k] : 0)}
              label={t('rpg.daily.mark', { item: name })}
              testID={`${testID}-${k}-check`}
            />
            <Text
              numberOfLines={1}
              style={{
                ...type.body,
                flex: 1,
                minWidth: 0,
                color: met ? palette.text3 : palette.text1,
              }}
            >
              {name}
            </Text>
            <IconButton
              icon="minus"
              label={t('rpg.daily.less', { item: name })}
              size={36}
              variant="secondary"
              disabled={have <= 0}
              onPress={() => onSet(k, have - DAILY_STEP[k])}
              testID={`${testID}-${k}-dec`}
            />
            <Text
              accessibilityLabel={t('rpg.daily.count', {
                have,
                need: targets[k],
              })}
              style={{
                ...type.small,
                minWidth: 92,
                textAlign: 'center',
                color: met ? palette.success : palette.text2,
              }}
            >
              [ {have} / {targets[k]} ]
            </Text>
            <IconButton
              icon="plus"
              label={t('rpg.daily.more', { item: name })}
              size={36}
              variant="secondary"
              onPress={() => onSet(k, have + DAILY_STEP[k])}
              testID={`${testID}-${k}-inc`}
            />
          </View>
        );
      })}
    </View>
  );
}

/** Missão diária do Sistema: contagem até a meia-noite, barra, itens com [−]/[+] e recompensa. */
export default function DailyQuestWindow({
  targets,
  done,
  complete,
  streak,
  weeks,
  onSet,
}: {
  targets: DailyTargets;
  done: DailyCounts;
  complete: boolean;
  streak: number;
  weeks: number;
  onSet: (item: DailyItem, value: number) => void;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const left = useMinutesToMidnight();
  const urgent = !complete && left < 120;
  const tone: BarTone = complete ? 'energy' : 'xp';
  return (
    <SystemWindow
      kind="quest"
      testID="daily-quest"
      title={t('rpg.daily.title')}
      footer={
        <Text style={{ ...type.small, color: palette.text2 }}>
          {t('rpg.daily.reward', {
            xp: DAILY_REWARD.xp,
            vit: DAILY_REWARD.vit,
          })}
        </Text>
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Text
          testID="daily-quest-status"
          style={{
            ...type.label,
            color: complete ? palette.success : systemText(palette),
          }}
        >
          {complete ? t('rpg.daily.status.done') : t('rpg.daily.status.open')}
        </Text>
        {complete ? null : (
          <Text
            style={{
              ...type.label,
              color: urgent ? palette.danger : palette.text3,
            }}
          >
            {t('rpg.daily.timeLeft', {
              h: Math.floor(left / 60),
              m: left % 60,
            })}
          </Text>
        )}
      </View>
      <PixelBar value={dailyRatio(done, targets)} segments={20} tone={tone} />
      <QuestItems
        targets={targets}
        done={done}
        onSet={onSet}
        testID="daily-quest"
      />
      <Text style={{ ...type.small, color: palette.text3 }}>
        {t('rpg.daily.streak', { n: streak })}
        {weeks > 0 ? ` · ${t('rpg.daily.weeks', { n: weeks })}` : ''}
      </Text>
    </SystemWindow>
  );
}
