import ListItem from '@/components/presentation/pixel/ListItem';
import Button from '@/components/presentation/gesture-wrappers/button';
import ListSwitch from '@/components/presentation/list-switch';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import PaletteChooser from '@/components/presentation/palette-chooser';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { supportedLanguages } from '@/services/tolgee';
import { useAppSelector } from '@/store';
import {
  setPalette,
  setCrashReportsEnabled,
  setFirstDayOfWeek,
  setPreferredLanguage,
  setRestNotifications,
  setShowFeed,
  setUseImperialUnits,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { RpgClass, selectRpgClass, setRpgClass } from '@/store/choices';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Portrait from '@/components/presentation/pixel/Portrait';
import Tag, { type TagTone } from '@/components/presentation/pixel/Tag';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';
import { isBackendConfigured } from '@/services/api-consts';

// ponytail: o bônus descrito só vira número na F6 (multiplicadores DR11).
const RPG_CLASSES: { id: RpgClass; attr: string; tone: TagTone }[] = [
  { id: 'warrior', attr: 'STR', tone: 'str' },
  { id: 'scout', attr: 'DEX', tone: 'dex' },
  { id: 'paladin', attr: 'CON', tone: 'con' },
];

export function WelcomeWizard() {
  const formatDate = useFormatDate();
  const daysOfWeekOptions: SelectButtonOption<DayOfWeek>[] = [
    {
      value: DayOfWeek.SUNDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SUNDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.MONDAY,
      label: formatDate(getDateOnDay(DayOfWeek.MONDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.TUESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.TUESDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.WEDNESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.WEDNESDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.THURSDAY,
      label: formatDate(getDateOnDay(DayOfWeek.THURSDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.FRIDAY,
      label: formatDate(getDateOnDay(DayOfWeek.FRIDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.SATURDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SATURDAY), { weekday: 'long' }),
    },
  ];

  const { t } = useTranslate();
  const dispatch = useDispatch();
  const settings = useAppSelector((state) => state.settings);
  const welcomeWizardCompleted = settings.welcomeWizardCompleted;
  const { palette } = useAppTheme();
  const tx = {
    title: [type.title, { color: palette.text1 }],
    sub: [type.body, { color: palette.text2 }],
    section: [type.label, { color: palette.text2 }],
  };
  const [currentPage, setCurrentPage] = useState(0);
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  const languageOptions: SelectButtonOption<string | undefined>[] = useMemo(
    () => [
      {
        value: undefined,
        label: t('settings.system_default.label'),
      },
      ...supportedLanguages.map((x) => ({ value: x.code, label: x.label })),
    ],
    [t],
  );

  const totalPages = 4;
  const rpgClass = useAppSelector(selectRpgClass);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      dispatch(setWelcomeWizardCompleted(true));
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderClassSelectionPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          accessibilityRole="header"
          style={[styles.pageTitle, tx.title]}
        >
          {t('onboarding.class.title')}
        </Text>
        <Text style={[styles.pageSubtitle, tx.sub]}>
          {t('onboarding.class.subtitle')}
        </Text>
      </View>

      <View style={[styles.settingsSection, { gap: 12 }]}>
        {RPG_CLASSES.map((cls) => {
          const selected = rpgClass === cls.id;
          return (
            <Pressable
              key={cls.id}
              testID={`class-${cls.id}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              // Sem isto o Android junta os filhos: "PORTRAIT, Warrior, [, STR, ], …, ◇".
              accessibilityLabel={`${t(`rpg.class.${cls.id}`)}, ${cls.attr}, ${t(`onboarding.class.${cls.id}.bonus`)}`}
              onPress={() => dispatch(setRpgClass(cls.id))}
              style={styles.classCard}
            >
              <PixelBox
                tone={selected ? 'accent' : 'default'}
                padding={12}
                innerStyle={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <Portrait
                  width={64}
                  height={80}
                  label={t('rpg.sheet.portrait')}
                />
                <View style={{ flex: 1, gap: 6, alignItems: 'flex-start' }}>
                  <Text
                    maxFontSizeMultiplier={TITLE_MAX_SCALE}
                    style={[
                      type.title,
                      { color: selected ? palette.accent : palette.text1 },
                    ]}
                  >
                    {t(`rpg.class.${cls.id}`)}
                  </Text>
                  <Tag tone={cls.tone} size="sm">
                    {cls.attr}
                  </Tag>
                  <Text style={[type.small, { color: palette.text2 }]}>
                    {t(`onboarding.class.${cls.id}.bonus`)}
                  </Text>
                </View>
                <Text
                  aria-hidden
                  style={[
                    type.bodyLg,
                    { color: selected ? palette.accent : palette.line2 },
                  ]}
                >
                  {selected ? '◆' : '◇'}
                </Text>
              </PixelBox>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderCrashReportsPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          accessibilityRole="header"
          style={[styles.pageTitle, tx.title]}
        >
          {t('onboarding.welcome.title')}
        </Text>
        <Text style={[styles.pageSubtitle, tx.sub]}>
          {t('onboarding.welcome.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, tx.section]}>
          {t('onboarding.open_source.title')}
        </Text>
        <Text style={[styles.sectionDescription, tx.sub]}>
          {t('onboarding.open_source.body')}
        </Text>
        <Button
          onPress={() =>
            openUrl('https://github.com/Thedocwhocode/Gym-life-rpg')
          }
        >
          {t('onboarding.open_source.button')}
        </Button>
        <Text style={[styles.sectionTitle, tx.section]}>
          {t('onboarding.crash_reports.title')}
        </Text>
        <Text style={[styles.sectionDescription, tx.sub]}>
          {t('onboarding.crash_reports.explanation')}
        </Text>
        <ListSwitch
          headline={t('onboarding.send_crash_reports.label')}
          supportingText={t('onboarding.send_crash_reports.subtitle')}
          value={settings.crashReportsEnabled}
          onValueChange={(value) => dispatch(setCrashReportsEnabled(value))}
        />
        <Button
          onPress={() =>
            openUrl(
              'https://github.com/Thedocwhocode/Gym-life-rpg/blob/main/PRIVACY.md',
            )
          }
        >
          {t('onboarding.privacy_policy.button')}
        </Button>
      </View>
    </View>
  );

  const renderLocalizationPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          accessibilityRole="header"
          style={[styles.pageTitle, tx.title]}
        >
          {t('settings.localisation.title')}
        </Text>
        <Text style={[styles.pageSubtitle, tx.sub]}>
          {t('settings.localisation.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <ListSwitch
          headline={t('settings.use_imperial_units.label')}
          supportingText={t('settings.use_imperial_units.subtitle')}
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <ListItem
          title={t('settings.first_day_of_week.label')}
          description={t('settings.first_day_of_week.subtitle')}
          trailing={
            <SelectButton
              value={settings.firstDayOfWeek}
              options={daysOfWeekOptions}
              onChange={(value) => dispatch(setFirstDayOfWeek(value))}
            />
          }
        />
        <ListItem
          title={t('settings.set_language.button')}
          description={t('settings.set_language.subtitle')}
          trailing={
            <SelectButton
              value={settings.preferredLanguage}
              options={languageOptions}
              onChange={(value) => dispatch(setPreferredLanguage(value))}
            />
          }
        />
        <PaletteChooser
          value={settings.palette}
          onChange={(palette) => dispatch(setPalette(palette))}
        />
      </View>
    </View>
  );

  const renderNotificationsAndFeedPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          accessibilityRole="header"
          style={[styles.pageTitle, tx.title]}
        >
          {t('onboarding.notifications_and_feed.title')}
        </Text>
        <Text style={[styles.pageSubtitle, tx.sub]}>
          {t('onboarding.notifications_and_feed.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, tx.section]}>
          {t('settings.notifications.title')}
        </Text>
        <ListSwitch
          headline={t('rest.notifications.title')}
          supportingText={t('rest.notifications.subtitle')}
          value={settings.restNotifications}
          onValueChange={(value) => dispatch(setRestNotifications(value))}
        />

        {isBackendConfigured && (
          <>
            <Text style={[styles.sectionTitle, styles.topSpacing, tx.section]}>
              {t('feed.feed.title')}
            </Text>
            <ListSwitch
              headline={t('feed.show_feed.label')}
              supportingText={t('feed.show_feed.subtitle')}
              value={settings.showFeed}
              onValueChange={(value) => dispatch(setShowFeed(value))}
            />
          </>
        )}
      </View>
    </View>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return renderClassSelectionPage();
      case 1:
        return renderCrashReportsPage();
      case 2:
        return renderLocalizationPage();
      case 3:
        return renderNotificationsAndFeedPage();
      default:
        return null;
    }
  };
  return (
    !welcomeWizardCompleted && (
      <Portal>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bgApp }}>
          <View style={[styles.container]}>
            <View style={styles.stepHeader}>
              <Text style={[type.label, { color: palette.text3 }]}>
                {t('onboarding.step.label', {
                  current: currentPage + 1,
                  total: totalPages,
                })}
              </Text>
              <PixelBar
                value={(currentPage + 1) / totalPages}
                segments={totalPages}
                height={6}
                gap={4}
              />
            </View>
            {renderPage()}

            <View style={styles.footer}>
              <AsciiDivider />

              <View style={styles.buttonRow}>
                <Button
                  mode="text"
                  onPress={handlePrevious}
                  disabled={currentPage === 0}
                  style={styles.button}
                >
                  {t('generic.previous.button')}
                </Button>
                <Button
                  mode="contained"
                  testID="welcome-wizard-next"
                  onPress={handleNext}
                  style={styles.button}
                >
                  {currentPage === totalPages - 1
                    ? t('onboarding.get_started.button')
                    : t('generic.next.button')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Portal>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
    marginTop: 20,
  },
  headerSection: {
    marginBottom: 20,
    marginHorizontal: spacing.pageHorizontalMargin,
    gap: 6,
  },
  pageTitle: {},
  pageSubtitle: {},
  stepHeader: {
    gap: 8,
    paddingHorizontal: spacing.pageHorizontalMargin,
    paddingTop: 24,
  },
  settingsSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginTop: spacing[4],
    marginHorizontal: spacing.pageHorizontalMargin,
  },
  sectionDescription: {
    marginBottom: spacing[4],
    marginHorizontal: spacing.pageHorizontalMargin,
  },
  topSpacing: {
    marginTop: spacing[6],
  },
  footer: {
    padding: spacing.pageHorizontalMargin,
    paddingBottom: spacing[8],
    marginTop: 'auto',
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  button: {
    flex: 1,
  },
  classCard: {
    marginHorizontal: spacing.pageHorizontalMargin,
  },
});
