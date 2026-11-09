import { StatisticOverTime } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { useTranslate } from '@tolgee/react';
import { useAppSelector } from '@/store';
import { lineGraphProps } from '@/components/presentation/line-graph-props';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { type } from '@/theme/tokens';

export default function BodyweightStatGraphCard(props: {
  bodyweightStats: StatisticOverTime;
}) {
  const weightUnit = usePreferredWeightUnit();
  const { t } = useTranslate();
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const { palette } = useAppTheme();
  const points: lineDataItem[] = props.bodyweightStats.statistics.map(
    (stat): lineDataItem => ({
      value: stat.value.convertTo(weightUnit).value.toNumber(),
      dataPointText: stat.value.shortLocaleFormat(2),
      textShiftY: -10,
      dataPointColor: palette.success,
    }),
  );
  const [width, setWidth] = useState(0);
  if (!showBodyweight || !props.bodyweightStats.statistics.length) {
    return undefined;
  }
  return (
    <PixelBox
      padding={12}
      innerStyle={{ gap: 8 }}
      testID="bodyweight-stat-card"
    >
      <Text style={{ ...type.label, color: palette.text2 }}>
        {t('exercise.bodyweight.label')}
      </Text>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChart
          color={palette.success}
          data={points}
          yAxisOffset={
            props.bodyweightStats.minValue
              .convertTo(weightUnit)
              .value.toNumber() * 0.9
          }
          {...lineGraphProps(palette, width, points.length)}
        />
      </View>
    </PixelBox>
  );
}
