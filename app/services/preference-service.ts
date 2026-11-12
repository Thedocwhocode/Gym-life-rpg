import { KeyValueStore } from '@/services/key-value-store';
import { EffectsMode } from '@/store/settings';
import { DEFAULT_PALETTE, isPaletteId, PaletteId } from '@/theme/palettes';
import { DayOfWeek, Instant } from '@js-joda/core';
import { match } from 'ts-pattern';

export enum AppRatingResult {
  NotRated = 'NotRated',
  Rated = 'Rated',
  Declined = 'Declined',
}

export interface RemoteBackupSettings {
  endpoint: string;
  apiKey: string;
  includeFeedAccount: boolean;
}

function toBooleanString(val: boolean | undefined) {
  return val ? 'True' : 'False';
}

function fromBooleanString(
  val: string | undefined,
  defaultValue: boolean,
): boolean {
  if (val === undefined || val === null) return defaultValue;
  return val === 'True';
}

export class PreferenceService {
  constructor(private keyValueStore: KeyValueStore) {}

  async getProToken(): Promise<string | undefined> {
    const token = await this.keyValueStore.getItem('proToken');
    return token;
  }

  async setProToken(token?: string): Promise<void> {
    if (__DEV__) {
      return;
    }
    if (token) await this.keyValueStore.setItem('proToken', token);
  }

  async getUseImperialUnits(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('useImperialUnits');
    return fromBooleanString(value, false);
  }

  async setUseImperialUnits(useImperialUnits: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'useImperialUnits',
      toBooleanString(useImperialUnits),
    );
  }

  async getRestNotifications(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('restNotifications');
    return fromBooleanString(value, true);
  }

  async setRestNotifications(restNotifications: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'restNotifications',
      toBooleanString(restNotifications),
    );
  }

  async getCrashReportsEnabled(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('crashReportsEnabled');
    return fromBooleanString(value, true);
  }

  async setCrashReportsEnabled(crashReportsEnabled: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'crashReportsEnabled',
      toBooleanString(crashReportsEnabled),
    );
  }

  async getWelcomeWizardCompleted(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('welcomeWizardCompleted');
    return fromBooleanString(value, false);
  }

  async setWelcomeWizardCompleted(
    welcomeWizardCompleted: boolean,
  ): Promise<void> {
    await this.keyValueStore.setItem(
      'welcomeWizardCompleted',
      toBooleanString(welcomeWizardCompleted),
    );
  }

  async setShowBodyweight(showBodyweight: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'showBodyweight',
      toBooleanString(showBodyweight),
    );
  }

  async getShowBodyweight(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showBodyweight');
    return fromBooleanString(value, true);
  }

  async setHaptics(haptics: boolean): Promise<void> {
    await this.keyValueStore.setItem('haptics', toBooleanString(haptics));
  }

  async getHaptics(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('haptics');
    return fromBooleanString(value, true);
  }

  async setShowTips(showTips: boolean): Promise<void> {
    await this.keyValueStore.setItem('showTips', toBooleanString(showTips));
  }

  async getShowTips(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showTips');
    return fromBooleanString(value, true);
  }

  async setTipToShow(tipToShow: number): Promise<void> {
    await this.keyValueStore.setItem('tipToShow', tipToShow.toString());
  }

  async getTipToShow(): Promise<number> {
    const value = await this.keyValueStore.getItem('tipToShow');
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 1 : parsed;
  }

  async setShowFeed(showFeed: boolean): Promise<void> {
    await this.keyValueStore.setItem('showFeed', toBooleanString(showFeed));
  }

  async getShowFeed(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showFeed');
    return fromBooleanString(value, true);
  }

  async getHasRequestedNotificationPermission(): Promise<boolean> {
    const value = await this.keyValueStore.getItem(
      'hasRequestedNotificationPermission',
    );
    return fromBooleanString(value, false);
  }

  async setHasRequestedNotificationPermission(
    hasRequested: boolean,
  ): Promise<void> {
    await this.keyValueStore.setItem(
      'hasRequestedNotificationPermission',
      toBooleanString(hasRequested),
    );
  }

  async getAppOpenedCount(): Promise<number> {
    const value = await this.keyValueStore.getItem('appOpenedCount');
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  async setAppOpenedCount(count: number): Promise<void> {
    await this.keyValueStore.setItem('appOpenedCount', count.toString());
  }

  async setAppRatingResult(result: AppRatingResult): Promise<void> {
    await this.keyValueStore.setItem('appRatingResult', result.toString());
  }

  async getAppRatingResult(): Promise<AppRatingResult> {
    const value = await this.keyValueStore.getItem('appRatingResult');
    if (
      value &&
      Object.values(AppRatingResult).includes(value as AppRatingResult)
    ) {
      return value as AppRatingResult;
    }
    return AppRatingResult.NotRated;
  }

  async getRemoteBackupSettings(): Promise<RemoteBackupSettings> {
    const [endpoint, apiKey, includeFeedAccount] = await Promise.all([
      this.keyValueStore.getItem('remoteBackupSettings.Endpoint'),
      this.keyValueStore.getItem('remoteBackupSettings.ApiKey'),
      this.keyValueStore.getItem('remoteBackupSettings.IncludeFeedAccount'),
    ]);
    return {
      endpoint: endpoint ?? '',
      apiKey: apiKey ?? '',
      includeFeedAccount: fromBooleanString(includeFeedAccount, false),
    };
  }

  async setRemoteBackupSettings(settings: RemoteBackupSettings): Promise<void> {
    await this.keyValueStore.setItem(
      'remoteBackupSettings.Endpoint',
      settings.endpoint,
    );
    await this.keyValueStore.setItem(
      'remoteBackupSettings.ApiKey',
      settings.apiKey,
    );
    await this.keyValueStore.setItem(
      'remoteBackupSettings.IncludeFeedAccount',
      toBooleanString(settings.includeFeedAccount),
    );
  }

  async setLastSuccessfulRemoteBackupHash(hash: string): Promise<void> {
    await this.keyValueStore.setItem('lastSuccessfulRemoteBackupHash', hash);
  }

  async getLastSuccessfulRemoteBackupHash(): Promise<string | undefined> {
    return (
      (await this.keyValueStore.getItem('lastSuccessfulRemoteBackupHash')) ??
      undefined
    );
  }

  async setLastBackupTime(time: Instant): Promise<void> {
    await this.keyValueStore.setItem('lastBackupTime', time.toString());
  }

  async getLastBackupTime(): Promise<Instant> {
    const value = await this.keyValueStore.getItem('lastBackupTime');
    if (value) {
      try {
        const date = Instant.parse(value);
        return date;
      } catch {}
    }
    const now = Instant.now();
    await this.setLastBackupTime(now);
    return now;
  }

  async setBackupReminder(showReminder: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'backupReminder',
      toBooleanString(showReminder),
    );
  }

  async getBackupReminder(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('backupReminder');
    return fromBooleanString(value, true);
  }

  async getNotesExpandedByDefault(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('notesExpandedByDefault');
    return fromBooleanString(value, true);
  }

  async setNotesExpandedByDefault(value: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'notesExpandedByDefault',
      toBooleanString(value),
    );
  }

  async getKeepScreenAwakeDuringWorkout(): Promise<boolean> {
    const value = await this.keyValueStore.getItem(
      'keepScreenAwakeDuringWorkout',
    );
    return fromBooleanString(value, true);
  }

  async setKeepScreenAwakeDuringWorkout(value: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'keepScreenAwakeDuringWorkout',
      toBooleanString(value),
    );
  }

  async setPalette(payload: PaletteId): Promise<void> {
    await this.keyValueStore.setItem('palette', payload);
  }

  /**
   * Sem paleta salva, migra o antigo "modo escuro": quem tinha desligado
   * (`forceDarkMode=false`) fica com Pergaminho, os demais com Brasa.
   */
  async getPalette(): Promise<PaletteId> {
    const value = await this.keyValueStore.getItem('palette');
    if (isPaletteId(value)) return value;
    const forceDark = await this.keyValueStore.getItem('forceDarkMode');
    return fromBooleanString(forceDark, true) ? DEFAULT_PALETTE : 'pergaminho';
  }

  async setFirstDayOfWeek(firstDayOfWeek: DayOfWeek): Promise<void> {
    await this.keyValueStore.setItem('firstDayOfWeek', firstDayOfWeek.name());
  }

  async getFirstDayOfWeek(): Promise<DayOfWeek> {
    const value = await this.keyValueStore.getItem('firstDayOfWeek');
    return match(value?.toLowerCase())
      .with('sunday', () => DayOfWeek.SUNDAY)
      .with('monday', () => DayOfWeek.MONDAY)
      .with('tuesday', () => DayOfWeek.TUESDAY)
      .with('wednesday', () => DayOfWeek.WEDNESDAY)
      .with('thursday', () => DayOfWeek.THURSDAY)
      .with('friday', () => DayOfWeek.FRIDAY)
      .with('saturday', () => DayOfWeek.SATURDAY)
      .otherwise(() => DayOfWeek.SUNDAY);
  }

  getPreferredLanguage() {
    return this.keyValueStore.getItem('preferredLanguage');
  }
  setPreferredLanguage(lang: string | undefined) {
    return lang
      ? this.keyValueStore.setItem('preferredLanguage', lang)
      : this.keyValueStore.removeItem('preferredLanguage');
  }

  async getEffectsMode(): Promise<EffectsMode | undefined> {
    const value = await this.keyValueStore.getItem('effectsMode');
    return value === 'complete' || value === 'reduced' || value === 'off'
      ? value
      : undefined;
  }

  async setEffectsMode(value: EffectsMode): Promise<void> {
    await this.keyValueStore.setItem('effectsMode', value);
  }
}
