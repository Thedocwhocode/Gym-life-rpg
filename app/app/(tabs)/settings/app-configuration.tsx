import { View } from 'react-native';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import Button from '@/components/presentation/gesture-wrappers/button';
import ListSwitch from '@/components/presentation/list-switch';
import PaletteChooser from '@/components/presentation/palette-chooser';
import EffectsChooser from '@/components/presentation/effects-chooser';
import { useEffectsMode } from '@/hooks/useEffectsMode';
import { RootState, useAppSelector } from '@/store';
import {
  setCrashReportsEnabled,
  setEffectsMode,
  setKeepScreenAwakeDuringWorkout,
  setNotesExpandedByDefault,
  setPalette,
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useDispatch } from 'react-redux';
import { spacing } from '@/hooks/useAppTheme';
import { isBackendConfigured } from '@/services/api-consts';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const effectsMode = useEffectsMode();

  return (
    <FullHeightScrollView>
      <Stack.Screen
        options={{ title: t('settings.app_configuration.title') }}
      />
      <View>
        <PaletteChooser
          value={settings.palette}
          onChange={(palette) => dispatch(setPalette(palette))}
        />
        <EffectsChooser
          value={effectsMode}
          onChange={(mode) => dispatch(setEffectsMode(mode))}
        />
        <ListSwitch
          testID="setShowBodyweight"
          headline={<T keyName="settings.show_bodyweight.label" />}
          supportingText={<T keyName="settings.show_bodyweight.subtitle" />}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        {isBackendConfigured && (
          <ListSwitch
            headline={<T keyName="feed.show_feed.label" />}
            supportingText={<T keyName="feed.show_feed.subtitle" />}
            value={settings.showFeed}
            onValueChange={(value) => dispatch(setShowFeed(value))}
          />
        )}

        <ListSwitch
          headline={<T keyName="workout.notes_expanded_by_default.label" />}
          supportingText={
            <T keyName="workout.notes_expanded_by_default.subtitle" />
          }
          value={settings.notesExpandedByDefault}
          onValueChange={(value) => dispatch(setNotesExpandedByDefault(value))}
        />
        <ListSwitch
          headline={<T keyName="workout.keep_screen_awake.label" />}
          supportingText={<T keyName="workout.keep_screen_awake.subtitle" />}
          value={settings.keepScreenAwakeDuringWorkout}
          onValueChange={(value) =>
            dispatch(setKeepScreenAwakeDuringWorkout(value))
          }
        />
        <ListSwitch
          headline={<T keyName="settings.show_tips.label" />}
          supportingText={<T keyName="settings.show_tips.subtitle" />}
          value={settings.showTips}
          onValueChange={(value) => dispatch(setShowTips(value))}
        />
        <ListSwitch
          headline={t('onboarding.send_crash_reports.label')}
          supportingText={t('onboarding.send_crash_reports.subtitle')}
          value={settings.crashReportsEnabled}
          onValueChange={(value) => dispatch(setCrashReportsEnabled(value))}
        />

        <Button
          onPress={() => dispatch(setWelcomeWizardCompleted(false))}
          mode="outlined"
          style={{ marginHorizontal: spacing.pageHorizontalMargin }}
        >
          {t('onboarding.start_setup_wizard.button')}
        </Button>
      </View>
    </FullHeightScrollView>
  );
}
