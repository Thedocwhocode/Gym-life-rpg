import Icon from '@/components/presentation/pixel/Icon';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, size } from '@/theme/tokens';
import { Pressable, Text, View } from 'react-native';

export interface TabBarItem {
  key: string;
  label: string;
  icon: PixelIconName;
  badge?: number | undefined;
  testID?: string | undefined;
}

export interface TabBarProps {
  tabs: TabBarItem[];
  active: string;
  onChange: (key: string) => void;
  /** Inset inferior (área segura). */
  bottomInset?: number | undefined;
}

/** Barra de 6 abas: 64 px, aba ativa em accent com indicador de 2 px no topo (design-spec §B navigation). */
export default function TabBar({
  tabs,
  active,
  onChange,
  bottomInset = 0,
}: TabBarProps) {
  const { palette } = useAppTheme();
  return (
    <View
      testID="nav"
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        minHeight: size.tabbar + bottomInset,
        paddingBottom: bottomInset,
        backgroundColor: palette.surface1,
        borderTopWidth: 1,
        borderTopColor: palette.line1,
      }}
    >
      {tabs.map((tab) => {
        const on = tab.key === active;
        const color = on ? palette.accent : palette.text3;
        return (
          <Pressable
            key={tab.key}
            testID={tab.testID}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(tab.key)}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -1,
                height: 2,
                width: on ? 24 : 0,
                backgroundColor: palette.accent,
              }}
            />
            <View>
              <Icon name={tab.icon} size={24} color={color} />
              {tab.badge ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
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
                      fontFamily: fontFamily.monoBold,
                      fontSize: 10,
                      color: palette.textOnDanger,
                    }}
                  >
                    {tab.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            {/* ponytail: 10 px em vez dos 9 do export (DR18 pede rótulo ≥ 10 px). */}
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fontFamily.monoBold,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
