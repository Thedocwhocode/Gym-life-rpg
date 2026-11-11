import { MaterialBottomTabs as Tabs } from '@/components/presentation/material-bottom-tabs';
import { ScreenTransitionProvider } from '@/components/smart/screen-transition';
import { isBackendConfigured } from '@/services/api-consts';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';

export default function Layout() {
  const { t } = useTranslate();
  const followRequestCount = useAppSelector(selectFollowRequestCount);
  const showFeed = useAppSelector(
    (x) => x.settings.showFeed && isBackendConfigured,
  );
  return (
    <ScreenTransitionProvider>
      <Tabs>
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarLabel: t('rpg.tab.dashboard'),
            tabBarButtonTestID: 'nav__dashboard',
          }}
        />

        <Tabs.Screen
          name="(session)"
          options={{
            tabBarLabel: t('rpg.tab.train'),
            tabBarButtonTestID: 'nav__workout',
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            tabBarLabel: t('rpg.tab.history'),
            tabBarButtonTestID: 'nav__history',
          }}
        />

        <Tabs.Screen
          name="feed"
          redirect={!showFeed}
          options={{
            tabBarLabel: t('rpg.tab.feed'),
            tabBarButtonTestID: 'nav__feed',
            tabBarBadge: followRequestCount || undefined!,
          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            tabBarLabel: t('rpg.tab.stats'),
            tabBarButtonTestID: 'nav__stats',
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: t('rpg.tab.settings'),
            tabBarButtonTestID: 'nav__settings',
          }}
        />
      </Tabs>
    </ScreenTransitionProvider>
  );
}
