import { Text, TextStyle } from 'react-native';
import { useAppTheme, font } from '@/hooks/useAppTheme';
import { fontFamily } from '@/theme/tokens';

interface ItemTitleProps {
  title: string;
  style?: TextStyle;
  testID?: string;
}

export default function ItemTitle({ title, style, testID }: ItemTitleProps) {
  const { colors } = useAppTheme();

  return (
    <Text
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
