import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { type } from '@/theme/tokens';
import { Pressable, Text, View } from 'react-native';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  badge?: number | undefined;
}

export interface TabsProps<T extends string> {
  tabs: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Abas no topo (Guilda): 44 px, sublinhado accent de 2 px entre 20% e 80% da largura. */
export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: TabsProps<T>) {
  const { palette } = useAppTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        minHeight: 44,
        borderBottomWidth: 1,
        borderBottomColor: palette.line1,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            testID={`tab-${tab.value}`}
            accessibilityRole="tab"
            // ponytail: RN web não traduz accessibilityState.selected em aria-selected.
            aria-selected={active}
            onPress={() => onChange(tab.value)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text
              style={{
                ...type.label,
                color: active ? accentText(palette) : palette.text2,
              }}
            >
              {tab.label}
            </Text>
            {!!tab.badge && (
              <View
                style={{
                  minWidth: 16,
                  height: 16,
                  paddingHorizontal: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: palette.dangerDeep,
                }}
              >
                <Text
                  style={{
                    ...type.micro,
                    lineHeight: 16,
                    color: palette.textOnDanger,
                  }}
                >
                  {tab.badge}
                </Text>
              </View>
            )}
            {active && (
              <View
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  backgroundColor: palette.accent,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
