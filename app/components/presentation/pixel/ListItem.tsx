import Icon from '@/components/presentation/pixel/Icon';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { type } from '@/theme/tokens';
import { ReactNode, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

export interface ListItemProps {
  title: ReactNode;
  description?: ReactNode | undefined;
  icon?: PixelIconName | undefined;
  /** Elemento à esquerda no lugar do ícone (rádio, checkbox). */
  leading?: ReactNode | undefined;
  titleColor?: string | undefined;
  /** Texto curto à direita (ex.: "3/20"). */
  meta?: string | undefined;
  trailing?: ReactNode | undefined;
  onPress?: (() => void) | undefined;
  onLongPress?: (() => void) | undefined;
  danger?: boolean | undefined;
  /** Padrão: aparece quando há `onPress` e nenhum `trailing`. */
  chevron?: boolean | undefined;
  disabled?: boolean | undefined;
  focus?: boolean | undefined;
  testID?: string | undefined;
}

/** Linha de configuração: altura mín. 56, borda inferior 1 px. */
export default function ListItem({
  title,
  description,
  icon,
  leading,
  titleColor,
  meta,
  trailing,
  onPress,
  onLongPress,
  danger = false,
  chevron,
  disabled = false,
  focus = false,
  testID,
}: ListItemProps) {
  const { palette } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const showChevron = chevron ?? (!!onPress && !trailing);
  return (
    <Pressable
      testID={testID}
      // No web, role="button" vira <button>; com controle no `trailing` daria botão aninhado.
      accessibilityRole={
        onPress && !(Platform.OS === 'web' && trailing) ? 'button' : undefined
      }
      accessibilityState={{ disabled }}
      disabled={disabled || (!onPress && !onLongPress)}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        minHeight: 56,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderBottomWidth: 1,
        borderBottomColor: palette.line1,
        backgroundColor: focus
          ? palette.accentWash
          : pressed
            ? palette.surface2
            : 'transparent',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {leading}
      {icon && (
        <Icon
          name={icon}
          size={24}
          color={danger ? palette.dangerStrong : accentText(palette)}
        />
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          style={{
            ...type.bodyLg,
            color:
              titleColor ?? (danger ? palette.dangerStrong : palette.text1),
          }}
        >
          {title}
        </Text>
        {!!description && (
          <Text style={{ ...type.small, color: palette.text3 }}>
            {description}
          </Text>
        )}
      </View>
      {!!meta && (
        <Text style={{ ...type.label, color: palette.text3 }}>{meta}</Text>
      )}
      {trailing}
      {showChevron && (
        <Icon name="chevron-right" size={24} color={palette.text3} />
      )}
    </Pressable>
  );
}
