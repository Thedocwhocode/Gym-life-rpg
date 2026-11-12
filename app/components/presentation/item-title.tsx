import { Text, TextStyle } from 'react-native';
import { useAppTheme, font } from '@/hooks/useAppTheme';
import { fontFamily, TITLE_MAX_SCALE } from '@/theme/tokens';

interface ItemTitleProps {
  title: string;
  style?: TextStyle;
  testID?: string;
}

export default function ItemTitle({ title, style, testID }: ItemTitleProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      maxFontSizeMultiplier={TITLE_MAX_SCALE}
      style={[
        {
          ...font['text-xl'],
          fontFamily: fontFamily.displayBold,
          flexShrink: 1,
          minWidth: 0,
          textAlign: 'left',
          color: colors.onSurface,
        },
        style,
      ]}
      testID={testID}
    >
      {title}
    </Text>
  );
}
