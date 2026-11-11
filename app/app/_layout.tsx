import { Stack } from 'expo-router';
import { AppThemeProvider, useAppTheme } from '@/hooks/useAppTheme';
import Scanlines from '@/components/presentation/pixel/Scanlines';
import { I18nManager, LogBox, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppStateProvider } from '@/components/smart/app-state-provider';
import SnackbarProvider from '@/components/smart/snackbar-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/utils/date-locale';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import ServicesProvider from '@/components/smart/services-provider';
import { useFonts } from 'expo-font';
import {
  PixelifySans_500Medium,
  PixelifySans_600SemiBold,
} from '@expo-google-fonts/pixelify-sans';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import RewardDialog from '@/components/smart/reward-dialog';

void SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  /.*is not a valid icon name.*/,
  /Open debugger to view warnings./,
  /.*useInsertionEffect.*/,
  /.*Failed to fetch inbox.*/,
  /.*Failed to update profile*/,
]);

if (Platform.OS === 'android') {
  I18nManager.swapLeftAndRightInRTL(true);
}

/** DR20: na web o app vira uma coluna de 560 px centralizada (header e abas inclusos). */
const WEB_COLUMN = 560;

function RootStack() {
  const { colorScheme, palette } = useAppTheme();
  return (
    <View
      style={
        Platform.OS === 'web'
          ? { flex: 1, backgroundColor: palette.bgSunken }
          : { flex: 1 }
      }
    >
      <View
        style={
          Platform.OS === 'web'
            ? {
                flex: 1,
                width: '100%',
                maxWidth: WEB_COLUMN,
                alignSelf: 'center',
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: palette.line1,
              }
            : { flex: 1 }
        }
      >
        <Stack
          screenOptions={{
            headerShown: false,
            statusBarStyle:
              Platform.OS === 'android'
                ? colorScheme === 'dark'
                  ? 'light'
                  : 'dark'
                : undefined,
            gestureEnabled: false,
          }}
        />
      </View>
      <Scanlines />
    </View>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Redesign fonts (theme/tokens.ts fontFamily).
    PixelifySans_500Medium,
    PixelifySans_600SemiBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <ServicesProvider>
              <AppThemeProvider>
                <AppStateProvider>
                  <SnackbarProvider>
                    <RewardDialog />
                    <RootStack />
                  </SnackbarProvider>
                </AppStateProvider>
              </AppThemeProvider>
            </ServicesProvider>
          </SafeAreaProvider>
        </Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});
