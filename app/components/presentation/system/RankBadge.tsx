import { useAppTheme } from '@/hooks/useAppTheme';
import type { RankId } from '@/store/journey/rules/ranks';
import type { Palette } from '@/theme/palettes';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

/** Cor do rank sobre a paleta (design v1.2 → tokens existentes). */
export function rankColor(p: Palette, id: RankId): string {
  return {
    E: p.steel,
    D: p.success,
    C: p.accent,
    B: p.dangerStrong,
    A: p.reward,
    S: p.systemStrong,
  }[id];
}

/** Letra do rank num quadrado com borda na cor do rank. */
export default function RankBadge({
  id,
  size = 36,
}: {
  id: RankId;
  size?: number;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const color = rankColor(palette, id);
  return (
    <View
      testID="rank-badge"
      accessible
      accessibilityLabel={t('rpg.rank.label', { id })}
      style={{
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: palette.surface2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ ...type.titleSm, color }}>{id}</Text>
    </View>
  );
}
