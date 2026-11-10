import { PALETTE_IDS, PaletteId } from '@/theme/palettes';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Segmented from '@/components/presentation/pixel/Segmented';
import { spacing } from '@/hooks/useAppTheme';

const LABELS: Record<PaletteId, string> = {
  brasa: 'Brasa',
  ferro: 'Ferro',
  fosforo: 'Fósforo',
  pergaminho: 'Pergaminho',
};

interface PaletteChooserProps {
  value: PaletteId;
  onChange: (palette: PaletteId) => void;
}

export default function PaletteChooser({
  value,
  onChange,
}: PaletteChooserProps) {
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingVertical: spacing[2],
        gap: spacing[2],
      }}
    >
      <Text variant="labelLarge">Paleta</Text>
      <Segmented
        value={value}
        onChange={(v) => onChange(v)}
        options={PALETTE_IDS.map((id) => ({
          value: id,
          label: LABELS[id],
          testID: `palette-${id}`,
        }))}
      />
    </View>
  );
}
