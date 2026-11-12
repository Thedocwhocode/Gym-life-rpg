import { Tabs, useRouter } from 'expo-router';
import { isBackendConfigured } from '@/services/api-consts';
import { CommonActions } from '@react-navigation/core';
import { PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { useAppSelector } from '@/store';
import TabBar from '@/components/presentation/pixel/TabBar';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';

/** Ícone de cada aba, pela rota (design-spec §B TabBar). */
const TAB_ICONS: Record<string, PixelIconName> = {
  dashboard: 'shield',
  '(session)': 'zap',
  history: 'book-open',
  feed: 'users',
  stats: 'chart-bar',
  settings: 'user',
};

export function MaterialBottomTabs({ children }: PropsWithChildren) {
  const showFeed = useAppSelector(
    (x) => x.settings.showFeed && isBackendConfigured,
  );
  const { dismissTo } = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // DR20: troca de aba sem transição (prevalece sobre o pixel-dissolve do D.7).
        animation: 'none',
      }}
      tabBar={({ navigation, state, descriptors, insets }) => {
        const routes = state.routes.filter(
          (x) => showFeed || !x.name.includes('feed'),
        );
        const activeKey = state.routes[state.index]?.key ?? '';
        return (
          <TabBar
            active={activeKey}
            bottomInset={insets.bottom}
            tabs={routes.map((route) => {
              const { options } = descriptors[route.key];
              return {
                key: route.key,
                label: String(
                  options.tabBarLabel ?? options.title ?? route.name,
                ),
                icon: TAB_ICONS[route.name] ?? 'info-box',
                badge:
                  typeof options.tabBarBadge === 'number'
                    ? options.tabBarBadge
                    : undefined,
                testID: options.tabBarButtonTestID,
              };
            })}
            onChange={(key) => {
              const route = state.routes.find((r) => r.key === key);
              if (!route) return;
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) return;

              // No web, tocar a aba atual volta ao topo da pilha.
              const shouldPopToTop =
                Platform.OS === 'web' && state.routes[state.index]?.key === key;

              if (shouldPopToTop) {
                navigation.navigate(route.name, route.params);
                dismissTo(('/' + route.name) as '/');
              } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error tipo do CommonActions com exactOptionalPropertyTypes
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            }}
          />
        );
      }}
    >
      {children}
    </Tabs>
  );
}

MaterialBottomTabs.Screen = Tabs.Screen;
