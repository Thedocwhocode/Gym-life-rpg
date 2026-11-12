import { OptionalStatisticOverTime } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { useTranslate } from '@tolgee/react';
import { lineGraphProps } from '@/components/presentation/line-graph-props';
import { Weight } from '@/models/weight';
import { useFormatDate } from '@/hooks/useFormatDate';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { type } from '@/theme/tokens';

export default function SessionStatGraphCard(props: {
  sessionStats: OptionalStatisticOverTime<Weight>[];
}) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const pointColors = [
    palette.accent,
    palette.success,
    palette.attrStr,
    palette.attrDex,
    palette.attrCon,
    palette.attrSta,
    palette.reward,
    palette.steel,
  ];
  const points: lineDataItem[][] = props.sessionStats.map((x) =>
    x.statistics.map(
      (stat): lineDataItem => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        value: stat.value?.convertTo(weightUnit).value.toNumber()!,
        dataPointText: stat.value?.shortLocaleFormat(2) ?? '',
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
      }),
    ),
  );
  const [width, setWidth] = useState(0);
  const legendItems = props.sessionStats.map((stat, i) => ({
    key: stat.title ?? `Series ${i + 1}`,
    color: pointColors[i % pointColors.length],
  }));
  if (!props.sessionStats.length) {
    return undefined;
  }
  return (
    <PixelBox padding={12} innerStyle={{ gap: 8 }} testID="session-stat-card">
      <Text style={{ ...type.label, color: palette.text2 }}>
        {t('workout.sessions.title')}
      </Text>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChart
          dataSet={points.map((x, i) => ({
            data: x,
            color: pointColors[i % pointColors.length],
            dataPointsColor: pointColors[i % pointColors.length],
          }))}
          {...lineGraphProps(
            palette,
            width,
            Math.max(...points.map((x) => x.length)),
          )}
        />
      </View>
      <View
        testID="stats-legend"
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
      >
        {legendItems.map((item) => (
          <View
            key={item.key}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <View
              style={{ width: 10, height: 10, backgroundColor: item.color }}
            />
            <Text style={{ ...type.small, color: palette.text2 }}>
              {item.key}
            </Text>
          </View>
        ))}
      </View>
    </PixelBox>
  );
}
