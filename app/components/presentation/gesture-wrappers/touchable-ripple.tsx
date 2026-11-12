/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { usePressGesture } from '@/components/presentation/gesture-wrappers/use-press-gesture';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  TouchableRippleProps,
  TouchableRipple as NativeTouchableRipple,
} from 'react-native-paper';

export default function TouchableRipple({
  onPress,
  onLongPress,
  disabled,
  ...rest
}: GesturePressableProps<TouchableRippleProps>) {
  const gesture = usePressGesture(onPress, onLongPress, disabled);
  return (
    <GestureDetector gesture={gesture}>
      <NativeTouchableRipple
        disabled={disabled!}
        onPress={onPress ? () => {} : undefined!}
        // Disable long press since we should be using Holdable for this
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        {...rest}
      />
    </GestureDetector>
  );
}
