import { ExerciseStatistics } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { lineGraphProps } from '@/components/presentation/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';

export default function ExerciseStatGraphCard(props: {
  exerciseStats: ExerciseStatistics;
  title: string;
}) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { palette } = useAppTheme();
  const oneRepMax = props.exerciseStats.oneRepMaxStatistics;
  const hasNegative = oneRepMax.minValue.value.lt(0);
  const minValue = oneRepMax.minValue.convertTo(weightUnit).value.toNumber();
  const exercisePoints: lineDataItem[] =
    props.exerciseStats.statistics.statistics.map(
      (stat): lineDataItem => ({
        value: stat.value.convertTo(weightUnit).value.toNumber(),
        dataPointText: stat.value.shortLocaleFormat(2),
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
        dataPointColor: palette.accent,
      }),
    );
  const oneRepMaxPoints: lineDataItem[] = oneRepMax.statistics.map(
    (stat): lineDataItem => ({
      value: stat.value.convertTo(weightUnit).value.toNumber(),
      textShiftY: -10,
      label: formatDate(stat.dateTime.toLocalDate(), {
        day: 'numeric',
        month: 'short',
      }),
      dataPointColor: palette.danger,
      dataPointText: stat.value.shortLocaleFormat(2),
    }),
  );
  const [width, setWidth] = useState(0);
  return (
    <PixelBox padding={12} innerStyle={{ gap: 8 }}>
      <Text
        maxFontSizeMultiplier={TITLE_MAX_SCALE}
        style={{ ...type.titleSm, color: palette.text1 }}
      >
        {props.title}
      </Text>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChart
          data={oneRepMaxPoints}
          color1={palette.danger}
          strokeDashArray1={[4, 4]}
          data2={exercisePoints}
          color2={palette.accent}
          {...lineGraphProps(palette, width, exercisePoints.length)}
          negativeStepValue={hasNegative ? -0.2 * minValue : undefined!}
          mostNegativeValue={hasNegative ? minValue : undefined!}
          noOfSectionsBelowXAxis={hasNegative ? 5 : 0}
        />
      </View>
    </PixelBox>
  );
}
