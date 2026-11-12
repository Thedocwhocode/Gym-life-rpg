import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import Tabs from '@/components/presentation/pixel/Tabs';
import Feed from '@/components/smart/feed';
import { FeedFollowers } from '@/components/smart/feed-followers';
import { FeedFollowing } from '@/components/smart/feed-following';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

type GuildTab = 'feed' | 'following' | 'followers';

export default function FeedIndexPage() {
  const { t } = useTranslate();
  const followRequests = useAppSelector(selectFollowRequestCount);
  const [tab, setTab] = useState<GuildTab>('feed');

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={headerOptions(t('rpg.tab.feed'), t('rpg.feed.eyebrow'))}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'feed', label: t('feed.feed.title') },
          { value: 'following', label: t('feed.following.title') },
          {
            value: 'followers',
            label: t('feed.followers.title'),
            badge: followRequests,
          },
        ]}
      />
      <View style={{ flex: 1 }}>
        {tab === 'feed' && <Feed />}
        {tab === 'following' && <FeedFollowing />}
        {tab === 'followers' && <FeedFollowers />}
      </View>
    </View>
  );
}
