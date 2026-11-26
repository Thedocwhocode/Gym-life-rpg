import DailyQuestWindow from '@/components/presentation/system/DailyQuestWindow';
import RankBadge from '@/components/presentation/system/RankBadge';
import RecoveryQuest from '@/components/presentation/system/RecoveryQuest';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { useDispatch } from 'react-redux';
import { selectDailyLog, setDailyCount } from '@/store/choices';
import { dailyState, type DailyItem } from '@/store/journey/rules/daily';
import { selectNextRank, selectRank } from '@/store/rpg';
import type { RootState } from '@/store/store';
import { type } from '@/theme/tokens';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

const selectToday = (s: RootState) => s.app.today;

/** Painel: rank do Sistema, Quest de Recuperação (se houver) e missão diária de hoje. */
export default function DailyQuest() {
  const dispatch = useDispatch();
  const log = useAppSelector(selectDailyLog);
  const today = useAppSelector(selectToday);
  const state = useMemo(
    () => dailyState(log ?? [], LocalDate.parse(today)),
    [log, today],
  );
  const set =
    (date: string, recovery = false) =>
    (item: DailyItem, value: number) =>
      dispatch(setDailyCount({ date, item, value, recovery }));

  return (
    <View style={{ gap: 16 }}>
      <RankLine />
      {state.recovery ? (
        <RecoveryQuest
          targets={state.recovery.targets}
          progress={state.recovery.progress}
          streak={state.recovery.streak}
          onSet={set(state.recovery.date, true)}
        />
      ) : null}
      <DailyQuestWindow
        targets={state.targets}
        done={state.done}
        complete={state.complete}
        streak={state.streak}
        weeks={state.weeks}
        onSet={set(today)}
      />
    </View>
  );
}

function RankLine() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const rank = useAppSelector(selectRank);
  const next = useAppSelector(selectNextRank);
  return (
    <View
      testID="rank-line"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <RankBadge id={rank} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ ...type.label, color: palette.text1 }}>
          {t('rpg.rank.label', { id: rank })}
        </Text>
        <Text style={{ ...type.small, color: palette.text3 }}>
          {next
            ? t('rpg.rank.next', {
                id: next.id,
                need: next.missing
                  .map((m) =>
                    t(`rpg.rank.need.${m.key}`, {
                      have: m.have,
                      need: m.need,
                    }),
                  )
                  .join(' · '),
              })
            : t('rpg.rank.max')}
        </Text>
      </View>
    </View>
  );
}
