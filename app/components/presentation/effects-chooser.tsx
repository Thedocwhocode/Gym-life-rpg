import { EffectsMode } from '@/store/settings';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Segmented from '@/components/presentation/pixel/Segmented';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';

interface EffectsChooserProps {
  value: EffectsMode;
  onChange: (mode: EffectsMode) => void;
}

export default function EffectsChooser({
  value,
  onChange,
}: EffectsChooserProps) {
  const { t } = useTranslate();
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingVertical: spacing[2],
        gap: spacing[2],
      }}
    >
      <Text variant="labelLarge">{t('settings.effects.label')}</Text>
      <Segmented
        value={value}
        onChange={(v) => onChange(v)}
        options={[
          {
            value: 'complete',
            label: t('settings.effects.complete'),
            testID: 'effects-complete',
          },
          {
            value: 'reduced',
            label: t('settings.effects.reduced'),
            testID: 'effects-reduced',
          },
          {
            value: 'off',
            label: t('settings.effects.off'),
            testID: 'effects-off',
          },
        ]}
      />
    </View>
  );
}
