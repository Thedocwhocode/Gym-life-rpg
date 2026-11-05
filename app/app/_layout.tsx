import { Stack } from 'expo-router';
import { AppThemeProvider, useAppTheme } from '@/hooks/useAppTheme';
import Scanlines from '@/components/presentation/pixel/Scanlines';
import { I18nManager, LogBox, Platform } from 'react-native';
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
import LevelUpOverlay from '@/components/presentation/rpg/LevelUpOverlay';
import SessionRewardScreen from '@/components/presentation/rpg/SessionRewardScreen';

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

function RootStack() {
  const { colorScheme } = useAppTheme();
  return (
    <>
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
      <Scanlines />
    </>
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
                    <LevelUpOverlay />
                    <SessionRewardScreen />
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
