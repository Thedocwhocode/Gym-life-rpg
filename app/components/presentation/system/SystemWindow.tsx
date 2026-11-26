import Scanlines from '@/components/presentation/pixel/Scanlines';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEffectsMode } from '@/hooks/useEffectsMode';
import { sound } from '@/services/sound';
import { systemText, type Palette } from '@/theme/palettes';
import { motion, type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type SystemKind = 'info' | 'quest' | 'warning' | 'recovery' | 'rank';

/** Cor da moldura por tipo (design v1.2, SystemWindow.jsx). */
export function systemColor(p: Palette, kind: SystemKind): string {
  switch (kind) {
    case 'warning':
      return p.danger;
    case 'recovery':
    case 'rank':
      return p.reward;
    default:
      return systemText(p);
  }
}

const CORNER = 10;

/** Janela do "Sistema": moldura de 1 px com cantoneiras, selo [ SISTEMA ] e entrada em scaleY. */
export default function SystemWindow({
  kind = 'info',
  title,
  footer,
  children,
  testID,
}: {
  kind?: SystemKind;
  title?: string | undefined;
  footer?: ReactNode;
  children: ReactNode;
  testID?: string;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const fx = useEffectsMode();
  const color = systemColor(palette, kind);
  const scale = useSharedValue(fx === 'complete' ? 0.2 : 1);
  useEffect(() => {
    scale.value = withTiming(1, { duration: motion.dur3 });
    sound.play('system_notice');
  }, [scale]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  const corner = (pos: object) => (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: CORNER,
        height: CORNER,
        borderColor: color,
        ...pos,
      }}
    />
  );

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="summary"
      style={[
        {
          borderWidth: 1,
          borderColor: color,
          backgroundColor: palette.systemWash,
          padding: 16,
          gap: 12,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Scanlines />
      {corner({ top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3 })}
      {corner({ top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3 })}
      {corner({
        bottom: -1,
        left: -1,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
      })}
      {corner({
        bottom: -1,
        right: -1,
        borderBottomWidth: 3,
        borderRightWidth: 3,
      })}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={{ ...type.label, color }}>[ {t('rpg.system.seal')} ]</Text>
        <Text style={{ ...type.micro, color }}>
          {t(`rpg.system.kind.${kind}`)}
        </Text>
      </View>
      {title ? (
        <Text
          accessibilityRole="header"
          style={{
            ...type.titleSm,
            color: palette.text1,
          }}
        >
          {title}
        </Text>
      ) : null}
      {children}
      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderColor: palette.systemLine,
            paddingTop: 10,
          }}
        >
          {footer}
        </View>
      ) : null}
    </Animated.View>
  );
}
