import { Platform } from 'react-native';
import { Storage, StorageKeys } from './storage';

type LocalAuthModule = typeof import('expo-local-authentication');

let cached: LocalAuthModule | null = null;

function load(): LocalAuthModule | null {
  if (cached) return cached;
  if (Platform.OS === 'web') return null;
  try {
    const mod: LocalAuthModule = require('expo-local-authentication');
    cached = mod;
    return mod;
  } catch {
    return null;
  }
}

export async function isBiometricSupported(): Promise<boolean> {
  const mod = load();
  if (!mod) return false;
  const [hw, enrolled] = await Promise.all([
    mod.hasHardwareAsync(),
    mod.isEnrolledAsync(),
  ]);
  return hw && enrolled;
}

export async function isBiometricEnabled(): Promise<boolean> {
  const v = await Storage.get(StorageKeys.biometricEnabled);
  return v === '1';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await Storage.set(StorageKeys.biometricEnabled, enabled ? '1' : '0');
}

export async function authenticate(prompt: string = 'Bitte authentifizieren'): Promise<boolean> {
  const mod = load();
  if (!mod) return true;
  const supported = await isBiometricSupported();
  if (!supported) return true;
  const res = await mod.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: 'Abbrechen',
    disableDeviceFallback: false,
  });
  return res.success;
}
