import { Platform } from 'react-native';

// Release builds get their endpoints from EXPO_PUBLIC_* env vars at build time.
// ponytail: no backend URL means the feed is hidden instead of failing at runtime.
export const apiBaseUrl = __DEV__
  ? 'http://127.0.0.1:5264'
  : (process.env.EXPO_PUBLIC_API_URL ?? '');

export const isBackendConfigured = apiBaseUrl !== '';

// Base for share links; empty yields relative links, which still work on web.
export const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL ?? '';

// Importar ficha: o PDF é lido no aparelho (pdfjs), por ora só na web.
export const canImportPdf = Platform.OS === 'web';

export const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || undefined;
