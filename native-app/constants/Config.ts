import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const debuggerHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    (Constants as any).manifest?.debuggerHost?.split(':')[0];

  if (debuggerHost && Platform.OS !== 'web') {
    return `http://${debuggerHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

export const Config = {
  apiBase: resolveApiBase(),
  appName: 'RentEx',
  supportEmail: 'support@rentex.app',
  currency: 'EUR',
  currencySymbol: '€',
  locale: 'de-DE',
} as const;
