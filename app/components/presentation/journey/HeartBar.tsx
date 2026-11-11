import FxBurst from '@/components/presentation/fx/FxBurst';
import { UI_MOMENTS } from '@/components/presentation/fx/moments';
import Icon from '@/components/presentation/pixel/Icon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

/**
 * Vida do herói (DR8). Mudar `lostKey` toca `ui/heart-lost` sobre o primeiro coração vazio.
 * Corações vazios ficam só no contorno (line-2).
 */
export default function HeartBar({
  hearts,
  max,
  lostKey,
  size = 24,
}: {
  hearts: number;
  max: number;
  lostKey?: number | undefined;
  size?: number;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const heart = UI_MOMENTS.heartLost();
  return (
    <View
      testID="heart-bar"
      accessible
      aria-label={t('rpg.hearts.count', { n: hearts, max })}
      style={{ gap: 6 }}
    >
      <Text style={{ ...type.label, color: palette.barHp }}>
        {t('rpg.hearts.label')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: max }, (_, i) => (
          <View key={i} style={{ width: size, height: size }}>
            <Icon
              name="heart"
              size={size}
              color={i < hearts ? palette.barHp : palette.line2}
            />
            {lostKey !== undefined && lostKey > 0 && i === hearts && (
              <FxBurst
                fx={heart.fx}
                options={heart.options}
                playKey={lostKey}
                x="50%"
                y="50%"
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
