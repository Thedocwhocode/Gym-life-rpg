import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { clearLevelUp, selectRpgTitle } from '@/store/rpg';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon, Portal, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import PixelFx from './PixelFx';
import { PIXEL_FX } from './pixel-fx-assets';

export default function LevelUpOverlay() {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const pendingLevelUp = useAppSelector((s) => s.rpg.pendingLevelUp);
  const newLevel = useAppSelector((s) => s.rpg.levelUpNewLevel);
  const title = useAppSelector(selectRpgTitle);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (!pendingLevelUp) return;

    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
    });

    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });
      scale.value = withTiming(0.85, { duration: 500 });
      timerRef.current = setTimeout(() => {
        dispatch(clearLevelUp());
      }, 520);
    }, 2800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingLevelUp]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!pendingLevelUp) return null;

  return (
    <Portal>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, overlayStyle]}
      >
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.amber,
              borderRadius: 4,
              padding: spacing[8],
              alignItems: 'center',
              gap: spacing[4],
              marginHorizontal: spacing[8],
            },
          ]}
        >
          <PixelFx
            fx={PIXEL_FX.levelUp}
            scale={PILLAR_SCALE}
            style={styles.pillar}
          />
          <Icon source="arrowUpward" size={40} color={colors.amber} />
          <Text
            variant="headlineMedium"
            style={{ color: colors.amber, textAlign: 'center' }}
          >
            LEVEL UP!
          </Text>
          <View style={{ alignItems: 'center', gap: spacing[1] }}>
            <Text
              variant="displaySmall"
              style={{ color: colors.onSurface, textAlign: 'center' }}
            >
              NÍVEL {newLevel}
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: colors.primary, textAlign: 'center' }}
            >
              {title.toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
}

// The light pillar rises out of the card's top edge: its ground line (pivot y 114 of 138) sits on the border.
const PILLAR_SCALE = 2;
const [PILLAR_W, PILLAR_H] = PIXEL_FX.levelUp.sheet.frameSize;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  pillar: {
    position: 'absolute',
    left: '50%',
    marginLeft: (-PILLAR_W * PILLAR_SCALE) / 2,
    bottom: '100%',
    marginBottom: -(PILLAR_H - 114) * PILLAR_SCALE,
  },
});
