import type { Palette } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { LineChartPropsType } from 'react-native-gifted-charts';

/** Linha pixel: reta, pontos quadrados, eixos em line-2 e rótulos mono. */
export const lineGraphProps = (
  palette: Palette,
  width: number,
  numberOfPoints: number,
): LineChartPropsType => {
  const calculatedSpacing =
    numberOfPoints > 1 ? width / (numberOfPoints - 1) - 50 : 1;
  const spacing = Math.max(calculatedSpacing, 30);
  const label = {
    color: palette.text3,
    fontFamily: fontFamily.mono,
    fontSize: 11,
  };
  return {
    focusEnabled: true,
    textColor: palette.text2,
    textFontSize: 11,
    xAxisColor: palette.line2,
    yAxisColor: palette.line2,
    xAxisIndicesColor: palette.line2,
    yAxisIndicesColor: palette.line2,
    thickness: 2,
    dataPointsShape: 'rectangular',
    dataPointsWidth: 6,
    dataPointsHeight: 6,
    hideYAxisText: true,
    rulesColor: palette.line1,
    scrollToEnd: true,
    hideRules: true,
    extrapolateMissingValues: false,
    width,
    spacing,
    xAxisLabelTextStyle: label,
    yAxisTextStyle: label,
  };
};
