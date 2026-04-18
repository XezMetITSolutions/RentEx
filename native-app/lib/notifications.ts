import { Platform } from 'react-native';
import { api } from './api';
import { Storage, StorageKeys } from './storage';

type ExpoNotificationsModule = typeof import('expo-notifications');
type ExpoDeviceModule = typeof import('expo-device');

let cachedModules: {
  Notifications: ExpoNotificationsModule;
  Device: ExpoDeviceModule;
} | null = null;

function loadModules() {
  if (cachedModules) return cachedModules;
  if (Platform.OS === 'web') return null;
  try {
    const Notifications: ExpoNotificationsModule = require('expo-notifications');
    const Device: ExpoDeviceModule = require('expo-device');
    cachedModules = { Notifications, Device };
    return cachedModules;
  } catch {
    return null;
  }
}

export async function initNotifications() {
  const mods = loadModules();
  if (!mods) return;
  const { Notifications } = mods;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'RentEx',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
    });
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const mods = loadModules();
  if (!mods) return null;
  const { Notifications, Device } = mods;
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const { status: asked } = await Notifications.requestPermissionsAsync();
    status = asked;
  }
  if (status !== 'granted') return null;

  try {
    const result = await Notifications.getExpoPushTokenAsync();
    const token = result.data;
    if (!token) return null;
    const prev = await Storage.get(StorageKeys.pushToken);
    if (prev !== token) {
      try {
        await api.registerPushToken(token, Platform.OS);
      } catch {}
      await Storage.set(StorageKeys.pushToken, token);
    }
    return token;
  } catch {
    return null;
  }
}

export async function syncPushTokenOnAuth() {
  await initNotifications();
  return registerForPushNotifications();
}
