import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import Button from '@/components/presentation/pixel/Button';
import ListItem from '@/components/presentation/pixel/ListItem';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Portrait from '@/components/presentation/pixel/Portrait';
import Tag, { TagTone } from '@/components/presentation/pixel/Tag';
import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { isProAvailable } from '@/services/api-consts';
import { useAppSelector } from '@/store';
import { RpgClass, selectRpgLevel, selectRpgTitle } from '@/store/rpg';
import { accentText } from '@/theme/palettes';
import { steps, type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import * as Application from 'expo-application';
import { Href, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

const REPO = 'https://github.com/Thedocwhocode/Gym-life-rpg';

const CLASS_TAG: Record<RpgClass, { tone: TagTone; attr: string }> = {
  warrior: { tone: 'str', attr: 'STR' },
  scout: { tone: 'dex', attr: 'DEX' },
  paladin: { tone: 'con', attr: 'CON' },
};

interface Row {
  title: string;
  description: string;
  icon: PixelIconName;
  onPress: () => void;
  testID?: string;
  external?: boolean;
}

function Section({ label, rows }: { label: string; rows: Row[] }) {
  return (
    <View style={{ gap: 4 }}>
      <AsciiDivider label={label} />
      <View>
        {rows.map((r) => (
          <ListItem
            key={r.title}
            testID={r.testID}
            title={r.title}
            description={r.description}
            icon={r.icon}
            meta={r.external ? '↗' : undefined}
            chevron={!r.external}
            onPress={r.onPress}
          />
        ))}
      </View>
    </View>
  );
}

function HeroCard() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const level = useAppSelector(selectRpgLevel);
  const title = useAppSelector(selectRpgTitle);
  const rpgClass = useAppSelector((s) => s.rpg.rpgClass);
  const tag = rpgClass ? CLASS_TAG[rpgClass] : undefined;
  return (
    <PixelBox
      tone="raised"
      padding={14}
      innerStyle={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}
    >
      <Portrait label="sprite" width={64} height={80} />
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ ...type.titleSm, color: palette.text1 }}>{title}</Text>
        <Text style={{ ...type.small, color: palette.text2 }}>
          {t('rpg.hero.class_level', {
            class: rpgClass ? t(`rpg.class.${rpgClass}`) : t('rpg.class.none'),
            level,
          })}
        </Text>
        {tag && (
          <View style={{ flexDirection: 'row' }}>
            <Tag tone={tag.tone}>
              {t('rpg.hero.class_tag', { attr: tag.attr })}
            </Tag>
          </View>
        )}
      </View>
    </PixelBox>
  );
}

export default function Settings() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const { push } = useRouter();
  const [appInfoOpen, setAppInfoOpen] = useState(false);

  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };
  const go = (href: Href) => () => push(href);

  const appVersion =
    Application.nativeApplicationVersion ??
    Application.nativeBuildVersion ??
    'Unknown';

  const bugReportUrl = `${REPO}/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&app-version=${encodeURIComponent(appVersion)}&platform=${Platform.OS}&os-version=${Platform.Version}`;

  const configuration: Row[] = [
    {
      title: t('plan.manage.title'),
      description: t('plan.manage.subtitle'),
      icon: 'list-box',
      onPress: go('/(tabs)/settings/program-list'),
    },
    {
      title: t('exercise.manage.button'),
      description: t('exercise.manage.subtitle'),
      icon: 'human-run',
      onPress: go('/(tabs)/settings/manage-exercises'),
    },
    {
      title: t('settings.app_configuration.title'),
      description: t('settings.app_configuration.subtitle'),
      icon: 'sliders',
      onPress: go('/(tabs)/settings/app-configuration'),
      testID: 'appConfiguration',
    },
    {
      title: t('settings.localisation.title'),
      description: t('settings.localisation.subtitle'),
      icon: 'map',
      onPress: go('/(tabs)/settings/localization'),
      testID: 'localization',
    },
    {
      title: t('settings.notifications.title'),
      description: t('settings.notifications.subtitle'),
      icon: 'notification',
      onPress: go('/(tabs)/settings/notifications'),
    },
    {
      title: t('backup.export_backup_restore.title'),
      description: t('backup.export_backup_restore.subtitle'),
      icon: 'save',
      onPress: go('/(tabs)/settings/backup-and-restore'),
    },
  ];

  const support: Row[] = [
    {
      title: t('settings.feature_request.title'),
      description: t('settings.feature_request.subtitle'),
      icon: 'gift',
      external: true,
      onPress: () =>
        openUrl(
          `${REPO}/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md`,
        ),
    },
    {
      title: t('settings.bug_report.title'),
      description: t('settings.bug_report.subtitle'),
      icon: 'alert',
      external: true,
      onPress: () => openUrl(bugReportUrl),
    },
    {
      title: t('settings.translation.title'),
      description: t('settings.translation.subtitle'),
      icon: 'message',
      external: true,
      onPress: () =>
        openUrl(
          `${REPO}/issues/new?assignees=&labels=translation&projects=&template=translation-suggestion.md`,
        ),
    },
    {
      title: t('settings.app_info.title'),
      description: t('settings.app_info.subtitle'),
      icon: 'info-box',
      onPress: () => setAppInfoOpen(true),
    },
  ];

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 20, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={headerOptions(t('rpg.tab.settings'), t('rpg.hero.eyebrow'))}
      />
      <HeroCard />
      <Section label={t('settings.configuration.title')} rows={configuration} />
      {isProAvailable && (
        <Section
          label={t('settings.pro_features.title')}
          rows={[
            {
              title: t('ai.planner.title'),
              description: t('ai.planner.subtitle'),
              icon: 'zap',
              onPress: go('/(tabs)/settings/ai/planner'),
            },
          ]}
        />
      )}
      {__DEV__ && (
        <Section
          label="Dev"
          rows={[
            {
              title: 'Galeria (dev)',
              description: 'Primitivos pixel',
              icon: 'dashboard',
              onPress: go('/(tabs)/settings/dev-gallery'),
              testID: 'devGallery',
            },
          ]}
        />
      )}
      <Section label={t('settings.support.title')} rows={support} />

      <Portal>
        <Modal
          visible={appInfoOpen}
          onDismiss={() => setAppInfoOpen(false)}
          contentContainerStyle={{
            alignSelf: 'center',
            width: '90%',
            maxWidth: 340,
          }}
        >
          <PixelBox
            tone="raised"
            steps={steps.dialog}
            shadow
            padding={20}
            innerStyle={{ gap: 12 }}
          >
            <Text style={{ ...type.titleSm, color: palette.text1 }}>
              {t('settings.app_info.title')}
            </Text>
            <Text style={{ ...type.body, color: palette.text2 }}>
              {t('rpg.hero.app_info_body')}{' '}
              <Text
                accessibilityRole="link"
                style={{ color: accentText(palette) }}
                onPress={() => openUrl(REPO)}
              >
                GitHub ↗
              </Text>
            </Text>
            <Text style={{ ...type.small, color: palette.text3 }}>
              {t('rpg.hero.app_version', { version: appVersion })}
            </Text>
            <Button
              size="sm"
              style={{ alignSelf: 'flex-end' }}
              onPress={() => setAppInfoOpen(false)}
            >
              {t('generic.close.button')}
            </Button>
          </PixelBox>
        </Modal>
      </Portal>
    </FullHeightScrollView>
  );
}
