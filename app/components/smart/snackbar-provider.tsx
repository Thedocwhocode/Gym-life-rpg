import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { setCurrentSnackbar } from '@/store/app';
import { accentText } from '@/theme/palettes';
import { fontFamily, size, type } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

/** Toast pixel (TD8): acima da TabBar, ícone + texto + ação opcional, some em 4 s. */
export default function SnackbarProvider(props: { children: ReactNode }) {
  const current = useAppSelector((s) => s.app.currentSnackbar);
  const dispatch = useDispatch();
  const { palette } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const isError = current?.tone === 'error';
  const actionColor = isError ? palette.danger : accentText(palette);

  const runAction = () => {
    if (!current?.dispatchAction) return;
    const actions = Array.isArray(current.dispatchAction)
      ? current.dispatchAction
      : [current.dispatchAction];
    actions.forEach((x) => dispatch(x));
    dispatch(setCurrentSnackbar(undefined));
  };

  return (
    <>
      {props.children}
      <Portal>
        {current ? (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: size.tabbar + bottom + 20,
            }}
          >
            <PixelBox
              tone={isError ? 'danger' : 'raised'}
              bg={isError ? palette.dangerWash : undefined}
              shadow
              padding={0}
              testID="toast"
            >
              <View
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Icon
                  name={isError ? 'alert' : 'check'}
                  size={16}
                  color={isError ? palette.danger : palette.success}
                />
                <Text style={{ ...type.body, color: palette.text1, flex: 1 }}>
                  {current.text}
                </Text>
                {current.action ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={runAction}
                    hitSlop={10}
                    testID="toast-action"
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.monoBold,
                        fontSize: 11,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: actionColor,
                      }}
                    >
                      {current.action}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </PixelBox>
          </View>
        ) : null}
      </Portal>
    </>
  );
}
