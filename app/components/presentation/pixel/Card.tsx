import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { ReactNode, useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

type Base = { children?: ReactNode; style?: StyleProp<ViewStyle> };

/** Card pixel com a API do Card do Paper (Title/Content/Actions). */
function Card({
  children,
  style,
  contentStyle,
  mode,
  onPress,
  onLongPress,
  testID,
}: Base & {
  contentStyle?: StyleProp<ViewStyle>;
  mode?: 'elevated' | 'outlined' | 'contained' | undefined;
  onPress?: (() => void) | undefined;
  onLongPress?: (() => void) | undefined;
  testID?: string | undefined;
  /** Ignorado: compatibilidade com o Paper. */
  container?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const box = (
    <PixelBox
      tone={mode === 'outlined' ? 'sunken' : 'default'}
      padding={0}
      pressed={pressed}
      style={onPress || onLongPress ? undefined : style}
      innerStyle={contentStyle}
      testID={onPress || onLongPress ? undefined : testID}
    >
      {children}
    </PixelBox>
  );
  if (!onPress && !onLongPress) return box;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
    >
      {box}
    </Pressable>
  );
}

function Title({
  title,
  subtitle,
  left,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  left?: (props: { size: number }) => ReactNode;
  right?: (props: { size: number }) => ReactNode;
  /** Ignorado: compatibilidade com o Paper. */
  titleVariant?: string;
}) {
  const { palette } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        minHeight: 56,
      }}
    >
      {left?.({ size: 24 })}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          style={{ ...type.titleSm, color: palette.text1 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...type.small, color: palette.text3 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right?.({ size: 24 })}
    </View>
  );
}

function Content({ children, style }: Base) {
  return (
    <View style={[{ paddingHorizontal: 16, paddingVertical: 12 }, style]}>
      {children}
    </View>
  );
}

function Actions({ children, style }: Base) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          padding: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

Card.Title = Title;
Card.Content = Content;
Card.Actions = Actions;
export default Card;
