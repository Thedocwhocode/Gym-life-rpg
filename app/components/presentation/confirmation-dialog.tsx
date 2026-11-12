import Button from '@/components/presentation/pixel/Button';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { steps, type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

type ConfirmationDialogWithoutAdditionalActionProps = {
  open: boolean;
  headline: ReactNode;
  textContent: ReactNode;
  cancelText?: string;
  okText?: string;
  preventCancel?: boolean;
  /** Ação destrutiva: título e OK em danger. */
  danger?: boolean;
  additionalActionText?: undefined;
  onAdditionalAction?: undefined;
  onCancel: () => void;
  onOk: () => void;
};

type WithAdditionalActions = {
  additionalActionText: string;
  onAdditionalAction: () => void;
};

type ConfirmationDialogProps =
  | ConfirmationDialogWithoutAdditionalActionProps
  | (Omit<
      ConfirmationDialogWithoutAdditionalActionProps,
      'additionalActionText' | 'onAdditionalAction'
    > &
      WithAdditionalActions);

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {
    open,
    headline,
    textContent,
    cancelText,
    okText,
    onCancel,
    onOk,
    preventCancel,
    danger,
    additionalActionText,
    onAdditionalAction,
  } = props;
  const { palette } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Portal>
      <Modal
        visible={open}
        dismissable={!preventCancel}
        onDismiss={() => {
          if (!preventCancel) {
            onCancel();
          }
        }}
        contentContainerStyle={{
          alignSelf: 'center',
          width: '100%',
          maxWidth: 340,
          padding: 16,
        }}
      >
        <PixelBox
          tone="raised"
          steps={steps.dialog}
          shadow
          padding={20}
          innerStyle={{ gap: 12 }}
        >
          <Text
            maxFontSizeMultiplier={TITLE_MAX_SCALE}
            accessibilityRole="header"
            style={{
              ...type.title,
              color: danger ? palette.dangerStrong : palette.text1,
            }}
          >
            {headline}
          </Text>
          <Text style={{ ...type.body, color: palette.text2 }}>
            {textContent}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button
              testID="action-cancel"
              variant="ghost"
              size="sm"
              onPress={onCancel}
            >
              {cancelText ?? t('generic.cancel.button')}
            </Button>
            {additionalActionText && (
              <Button
                testID="action-additional"
                variant="secondary"
                size="sm"
                onPress={onAdditionalAction}
              >
                {additionalActionText}
              </Button>
            )}
            <Button
              testID="action-ok"
              variant={danger ? 'danger' : 'primary'}
              size="sm"
              onPress={onOk}
            >
              {okText ?? t('generic.ok.button')}
            </Button>
          </View>
        </PixelBox>
      </Modal>
    </Portal>
  );
}
