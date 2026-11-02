import { Platform } from 'react-native';

// Release builds get their endpoints from EXPO_PUBLIC_* env vars at build time.
// ponytail: no backend URL means feed and AI planner are hidden instead of failing at runtime.
export const apiBaseUrl = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5264'
    : 'http://127.0.0.1:5264'
  : (process.env.EXPO_PUBLIC_API_URL ?? '');

export const isBackendConfigured = apiBaseUrl !== '';

// Base for share links; empty yields relative links, which still work on web.
export const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL ?? '';

export const revenueCatApiKey =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY,
  }) || undefined;

// The AI planner needs the backend and, on native, RevenueCat to sell "pro".
export const isProAvailable =
  isBackendConfigured && (Platform.OS === 'web' || !!revenueCatApiKey);

export const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || undefined;
