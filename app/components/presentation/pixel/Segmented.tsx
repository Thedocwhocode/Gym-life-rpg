import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { steps, type } from '@/theme/tokens';
import { Pressable, Text } from 'react-native';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  testID?: string | undefined;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string | undefined;
}

/** Escolha única entre 2 e 4 opções; a ativa fica em accent. */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedProps<T>) {
  const { palette } = useAppTheme();
  return (
    <PixelBox
      testID={testID}
      tone="sunken"
      steps={steps.control}
      padding={2}
      innerStyle={{ flexDirection: 'row', gap: 2 }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={o.testID}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 36,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 8,
              backgroundColor: active ? palette.accent : 'transparent',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...type.label,
                color: active ? palette.textOnAccent : palette.text2,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </PixelBox>
  );
}
