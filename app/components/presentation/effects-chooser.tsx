import { EffectsMode } from '@/store/settings';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Segmented from '@/components/presentation/pixel/Segmented';
import { spacing } from '@/hooks/useAppTheme';

interface EffectsChooserProps {
  value: EffectsMode;
  onChange: (mode: EffectsMode) => void;
}

export default function EffectsChooser({
  value,
  onChange,
}: EffectsChooserProps) {
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingVertical: spacing[2],
        gap: spacing[2],
      }}
    >
      <Text variant="labelLarge">Efeitos</Text>
      <Segmented
        value={value}
        onChange={(v) => onChange(v)}
        options={[
          { value: 'complete', label: 'Completo', testID: 'effects-complete' },
          { value: 'reduced', label: 'Reduzido', testID: 'effects-reduced' },
          { value: 'off', label: 'Desligado', testID: 'effects-off' },
        ]}
      />
    </View>
  );
}
