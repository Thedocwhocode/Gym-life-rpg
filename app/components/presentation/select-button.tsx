import { DayOfWeek, Period } from '@js-joda/core';
import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Menu } from 'react-native-paper';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { steps, type } from '@/theme/tokens';
import { Pressable, Text } from 'react-native';

export interface SelectButtonOption<T> {
  value: T;
  label: string;
  disabledAndHidden?: true;
}
interface SelectButtonProps<T> {
  value: T;
  options: SelectButtonOption<T>[];
  onChange: (value: T) => void;
  testID?: string;
  /** sm = 32 px, md = 40 px. */
  size?: 'sm' | 'md';
}
/** Select pixel: caixa raised com chevron accent; as opções abrem num Menu. */
export default function SelectButton<
  T extends number | string | Period | undefined | DayOfWeek,
>({ value, options, onChange, testID, size = 'md' }: SelectButtonProps<T>) {
  const { palette } = useAppTheme();
  const valueLabel = options.find((x) => isEqual(x.value, value))?.label;
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => {
        setOpen(false);
      }}
      anchor={
        <Pressable
          testID={testID}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={valueLabel}
          onPress={() => setOpen(true)}
        >
          <PixelBox
            tone="raised"
            steps={steps.control}
            padding={0}
            innerStyle={{
              minHeight: size === 'sm' ? 32 : 40,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...type.body, color: palette.text1, flexShrink: 1 }}
            >
              {valueLabel}
            </Text>
            <Icon
              name="chevron-right"
              rotate={open ? 270 : 90}
              size={16}
              color={accentText(palette)}
            />
          </PixelBox>
        </Pressable>
      }
      anchorPosition="bottom"
    >
      <ScrollView>
        {options.map(
          (option) =>
            !option.disabledAndHidden && (
              <Menu.Item
                key={option.label}
                title={option.label}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                trailingIcon={option.value === value ? 'check' : undefined!}
              />
            ),
        )}
      </ScrollView>
    </Menu>
  );
}

function isEqual<T extends number | string | Period | undefined | DayOfWeek>(
  a: T,
  b: T,
): boolean {
  if (a === b) {
    return true;
  }
  if (a && typeof a === 'object' && a.equals(b)) {
    return true;
  }
  return false;
}
