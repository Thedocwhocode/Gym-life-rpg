import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import {
  pixelIcons,
  type PixelIconName,
} from '@/components/presentation/pixel-icons.generated';
import PaletteChooser from '@/components/presentation/palette-chooser';
import PixelGallery from '@/components/presentation/pixel/PixelGallery';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { setPalette } from '@/store/settings';
import { useDispatch } from 'react-redux';
import { Redirect, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

// Dev-only screen: renders the redesign primitives side by side with the export, and is what the
// visual-regression spec (tests/cypress-tests/cypress/e2e/visual.cy.js) screenshots.
// Strings are not translated on purpose: nobody outside development ever sees this screen.

const SAMPLE = 'MISSÃO CONCLUÍDA · 1.234 XP';
const FONTS = [
  'PixelifySans_500Medium',
  'PixelifySans_600SemiBold',
  'SpaceMono_400Regular',
  'SpaceMono_700Bold',
] as const;

export default function DevGallery() {
  const { colors } = useAppTheme();
  const palette = useAppSelector((state) => state.settings.palette);
  const dispatch = useDispatch();
  if (!__DEV__) return <Redirect href="/(tabs)/settings" />;

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: 'Galeria (dev)' }} />
      <View testID="dev-gallery" style={styles.page}>
        <Text variant="titleMedium">Fontes</Text>
        <View testID="gallery-fonts" style={styles.section}>
          {FONTS.map((fontFamily) => (
            <View key={fontFamily}>
              <Text
                style={[styles.caption, { color: colors.onSurfaceVariant }]}
              >
                {fontFamily}
              </Text>
              <Text
                style={{ fontFamily, fontSize: 20, color: colors.onSurface }}
              >
                {SAMPLE}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="titleMedium">
          Ícones ({Object.keys(pixelIcons).length})
        </Text>
        <View testID="gallery-icons" style={styles.grid}>
          {(Object.keys(pixelIcons) as PixelIconName[]).map((name) => (
            <View key={name} style={styles.cell}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path d={pixelIcons[name]} fill={colors.onSurface} />
              </Svg>
              <Text
                numberOfLines={1}
                style={[styles.caption, { color: colors.onSurfaceVariant }]}
              >
                {name}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="titleMedium">Primitivos</Text>
        <PaletteChooser
          value={palette}
          onChange={(next) => dispatch(setPalette(next))}
        />
        <PixelGallery />
      </View>
    </FullHeightScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 16 },
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 72, alignItems: 'center', gap: 4 },
  caption: { fontSize: 10 },
});
