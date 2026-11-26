import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Portal } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export default function AppBottomSheet({
  children,
  sheetRef,
  backgroundStyle,
  handleIndicatorStyle,
  snapPoints,
  ...rest
}: BottomSheetProps & {
  sheetRef: React.RefObject<BottomSheetMethods | null>;
}) {
  const { palette } = useAppTheme();
  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints ?? ['40%', '70%', '80%']}
        backgroundStyle={[
          // v1.1: folha "raised" quadrada, como o PixelBox (sem cantos arredondados).
          {
            backgroundColor: palette.surface2,
            borderRadius: 0,
            borderTopWidth: 2,
            borderColor: palette.line2,
          },
          backgroundStyle,
        ]}
        handleIndicatorStyle={[
          {
            backgroundColor: palette.lineControl,
            width: 40,
            height: 4,
            borderRadius: 0,
          },
          handleIndicatorStyle,
        ]}
        {...rest}
      >
        {children}
      </BottomSheet>
    </Portal>
  );
}
