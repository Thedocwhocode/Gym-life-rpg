/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { AppIconSource } from '@/components/presentation/ms-icon-source';
import { usePressGesture } from '@/components/presentation/gesture-wrappers/use-press-gesture';
import { I18nManager } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  IconButton as NativeIconButton,
  IconButtonProps,
} from 'react-native-paper';

type ICProps = {
  icon: AppIconSource;
} & Omit<IconButtonProps, 'icon'>;

export default function IconButton({
  onPress,
  onLongPress,
  disabled,
  mirrored,
  style,
  ...rest
}: GesturePressableProps<ICProps> & { mirrored?: boolean }) {
  const gesture = usePressGesture(onPress, onLongPress, disabled);
  return (
    <GestureDetector gesture={gesture}>
      <NativeIconButton
        disabled={disabled!}
        onPress={onPress ? () => {} : undefined!}
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        style={[
          style,
          mirrored
            ? I18nManager.isRTL
              ? { transform: [{ scaleX: -1 }] }
              : {}
            : {},
        ]}
        {...rest}
      />
    </GestureDetector>
  );
}
