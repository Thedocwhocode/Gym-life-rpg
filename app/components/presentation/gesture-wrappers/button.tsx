/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { usePressGesture } from '@/components/presentation/gesture-wrappers/use-press-gesture';
import { GestureDetector } from 'react-native-gesture-handler';
import { Button as NativeButton, ButtonProps } from 'react-native-paper';

export default function Button({
  onPress,
  onLongPress,
  disabled,
  ...rest
}: GesturePressableProps<ButtonProps>) {
  const gesture = usePressGesture(onPress, onLongPress, disabled);
  return (
    <GestureDetector gesture={gesture}>
      <NativeButton
        disabled={disabled!}
        onPress={onPress ? () => {} : undefined!}
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        {...rest}
      />
    </GestureDetector>
  );
}
