import { View } from 'react-native';
import ListItem from '@/components/presentation/pixel/ListItem';
import { resolvePixelIcon } from '@/components/presentation/pixel-icon-map';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ListSwitch from '@/components/presentation/list-switch';
import { GymLifeRpg } from '@/gen/proto';
import { useActionEffect } from '@/hooks/useActionEffect';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import { useAppSelector } from '@/store';
import { patchFeedState } from '@/store/feed';
import {
  beginFeedImport,
  exportData,
  importData,
  setBackupReminder,
} from '@/store/settings';
import { setStatsIsDirty } from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function BackupAndRestorePage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const backupReminders = useAppSelector((s) => s.settings.backupReminder);
  const { push } = useRouter();
  const [feedImportDialogOpen, setFeedImportDialogOpen] = useState(false);
  const [feedExportDialogOpen, setFeedExportDialogOpen] = useState(false);
  return (
    <FullHeightScrollView>
      <Stack.Screen
        options={{ title: t('backup.export_backup_restore.title') }}
      />
      <View>
        <ListItem
          title={t('backup.backup_data.title')}
          description={t('backup.backup_data.subtitle')}
          icon={resolvePixelIcon('backup').name}
          onPress={() => setFeedExportDialogOpen(true)}
        />
        <ListItem
          title={t('backup.restore_data.title')}
          description={t('backup.restore_data.subtitle')}
          icon={resolvePixelIcon('history').name}
          onPress={() => {
            dispatch(importData());
            dispatch(setStatsIsDirty(true));
          }}
        />
        <ListItem
          title={t('backup.automatic_remote.title')}
          description={t('backup.automatic_remote.subtitle')}
          icon={resolvePixelIcon('cloudUpload').name}
          onPress={() =>
            push('/(tabs)/settings/backup-and-restore/remote-backup')
          }
        />
        <ListItem
          title={t('backup.plaintext_export.title')}
          description={t('backup.plaintext_export.subtitle')}
          icon={resolvePixelIcon('description').name}
          onPress={() =>
            push('/(tabs)/settings/backup-and-restore/plain-text-export')
          }
        />
        <ListSwitch
          headline={<T keyName="backup.reminders.title" />}
          supportingText={<T keyName="backup.reminders.subtitle" />}
          value={backupReminders}
          onValueChange={(value) => dispatch(setBackupReminder(value))}
        />
      </View>
      <ImportFeedDialog
        open={feedImportDialogOpen}
        setOpen={setFeedImportDialogOpen}
      />
      <ExportFeedDialog
        open={feedExportDialogOpen}
        setOpen={setFeedExportDialogOpen}
      />
    </FullHeightScrollView>
  );
}

interface DialogProps {
  open: boolean;
  setOpen: (o: boolean) => void;
}

function ImportFeedDialog({ open, setOpen }: DialogProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const [importedFeedState, setImportedFeedState] =
    useState<GymLifeRpg.Ui.Models.IFeedStateDaoV1>();

  const importFeedData = () => {
    if (!importedFeedState) {
      setOpen(false);
      return;
    }
    dispatch(patchFeedState(fromFeedStateDao(importedFeedState)));
    setOpen(false);
  };
  useActionEffect(beginFeedImport, (action) => {
    setImportedFeedState(action.payload);
    setOpen(true);
  });
  return (
    <ConfirmationDialog
      headline={t('feed.import_data.confirm.title')}
      textContent={
        <LimitedHtml
          value={t('feed.import_data.confirm.body')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      onOk={importFeedData}
      okText={t('generic.import.button')}
      onCancel={() => setOpen(false)}
      cancelText={t('feed.dont_import.button')}
      open={open}
    />
  );
}

function ExportFeedDialog({ open, setOpen }: DialogProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const exportWithFeed = () => {
    dispatch(exportData({ includeFeed: true }));
    setOpen(false);
  };
  const exportWithoutFeed = () => {
    dispatch(exportData({ includeFeed: false }));
    setOpen(false);
  };
  return (
    <ConfirmationDialog
      headline={t('feed.backup_account.title')}
      textContent={
        <LimitedHtml
          value={t('feed.backup_account.confirm.body')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      okText={t('feed.include_feed.label')}
      onOk={exportWithFeed}
      additionalActionText={t('backup.just_my_data.button')}
      onAdditionalAction={exportWithoutFeed}
      cancelText={t('generic.cancel.button')}
      onCancel={() => setOpen(false)}
      open={open}
    />
  );
}
