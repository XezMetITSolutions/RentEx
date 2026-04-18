import { Platform } from 'react-native';

const memoryStore = new Map<string, string>();

function webStorageAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export const Storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (webStorageAvailable()) return window.localStorage.getItem(key);
      return memoryStore.get(key) ?? null;
    }
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (webStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
      memoryStore.set(key, value);
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (webStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
      memoryStore.delete(key);
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};

export const StorageKeys = {
  authToken: 'rentex.auth.token',
  authUser: 'rentex.auth.user',
  authRole: 'rentex.auth.role',
  staffUser: 'rentex.staff.user',
  biometricEnabled: 'rentex.auth.biometric',
  theme: 'rentex.theme',
  lastEmail: 'rentex.auth.lastEmail',
  lastStaffEmail: 'rentex.staff.lastEmail',
  pushToken: 'rentex.push.token',
} as const;
