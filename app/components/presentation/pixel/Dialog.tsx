import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { steps, type } from '@/theme/tokens';
import { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Modal } from 'react-native-paper';

type Children = { children?: ReactNode; style?: StyleProp<ViewStyle> };

/** Diálogo pixel com a API do Dialog do Paper (Title/Content/Actions/ScrollArea). */
function Dialog({
  visible,
  onDismiss,
  dismissable = true,
  children,
  style,
}: Children & {
  visible: boolean;
  onDismiss?: () => void;
  dismissable?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      dismissable={dismissable}
      onDismiss={() => onDismiss?.()}
      contentContainerStyle={{
        alignSelf: 'center',
        width: '100%',
        maxWidth: 400,
        padding: 16,
      }}
    >
      <PixelBox
        tone="raised"
        steps={steps.dialog}
        shadow
        padding={20}
        testID="modal-surface"
        innerStyle={[{ gap: 12 }, style]}
      >
        {children}
      </PixelBox>
    </Modal>
  );
}

function Title({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { palette } = useAppTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[{ ...type.title, color: palette.text1 }, style]}
    >
      {children}
    </Text>
  );
}

function Content({ children, style }: Children) {
  return <View style={[{ gap: 8 }, style]}>{children}</View>;
}

function ScrollArea({ children, style }: Children) {
  return (
    <ScrollView style={[{ maxHeight: 360 }, style]}>{children}</ScrollView>
  );
}

function Actions({ children, style }: Children) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

Dialog.Title = Title;
Dialog.Content = Content;
Dialog.ScrollArea = ScrollArea;
Dialog.Actions = Actions;
export default Dialog;
