import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { authenticate, isBiometricEnabled, isBiometricSupported } from '@/lib/biometric';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [biometricNeeded, setBiometricNeeded] = useState<boolean | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const promptedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!role) {
      setBiometricNeeded(false);
      promptedRef.current = false;
      return;
    }
    if (biometricNeeded !== null) return;
    (async () => {
      const enabled = await isBiometricEnabled();
      const supported = enabled ? await isBiometricSupported() : false;
      setBiometricNeeded(enabled && supported);
    })();
  }, [role, loading, biometricNeeded]);

  useEffect(() => {
    if (!biometricNeeded || promptedRef.current) return;
    promptedRef.current = true;
    (async () => {
      const ok = await authenticate('Bitte entsperren Sie RentEx');
      if (ok) {
        setBiometricNeeded(false);
      } else {
        setBiometricError('Authentifizierung fehlgeschlagen.');
      }
    })();
  }, [biometricNeeded]);

  useEffect(() => {
    if (loading) return;
    if (biometricNeeded) return;
    const top = segments[0] as string | undefined;
    const sub = segments[1] as string | undefined;
    const inAuth = top === '(auth)';
    const inAdmin = top === '(admin)';
    const inTabs = top === '(tabs)';
    const isBooking = top === 'booking';
    const isProfileRoot = top === 'profile';

    if (!role) {
      // Guest allowed in auth, discovery tabs (index), and car details
      // But if they try to go deep into bookings, admin, or profile root, redirect
      const isPublicTab = inTabs && (sub === undefined || sub === 'index');
      const isCarDetail = top === 'car';
      
      if (!isPublicTab && !isCarDetail && !inAuth) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (role === 'staff') {
      if (inAuth || inTabs) router.replace('/(admin)/dashboard');
    } else if (role === 'customer') {
      if (inAuth || inAdmin) router.replace('/(tabs)');
    }
  }, [role, loading, segments, router, biometricNeeded]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="car/[id]" options={{ headerShown: true, headerTitle: '' }} />
        <Stack.Screen name="booking/new" options={{ headerShown: true, headerTitle: 'Buchung' }} />
        <Stack.Screen name="booking/[id]" options={{ headerShown: true, headerTitle: 'Buchung' }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {role && biometricNeeded && (
        <View style={[lockStyles.overlay, { backgroundColor: colors.background }]}>
          <View style={[lockStyles.lockIcon, { backgroundColor: colors.tint }]}>
            <Ionicons name="lock-closed" size={36} color="#fff" />
          </View>
          <Text style={lockStyles.title}>RentEx gesperrt</Text>
          <Text style={{ color: colors.tabIconDefault, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 }}>
            Authentifizieren Sie sich, um fortzufahren.
          </Text>
          {biometricError && (
            <Text style={{ color: '#dc2626', marginTop: 12 }}>{biometricError}</Text>
          )}
          <TouchableOpacity
            onPress={async () => {
              setBiometricError(null);
              promptedRef.current = true;
              const ok = await authenticate('Bitte entsperren Sie RentEx');
              if (ok) setBiometricNeeded(false);
              else setBiometricError('Authentifizierung fehlgeschlagen.');
            }}
            style={[lockStyles.btn, { backgroundColor: colors.tint }]}
          >
            <Ionicons name="finger-print" size={20} color="#fff" />
            <Text style={lockStyles.btnText}>Entsperren</Text>
          </TouchableOpacity>
        </View>
      )}
      {(loading || biometricNeeded === null) && role && (
        <View style={[lockStyles.overlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.tint} />
        </View>
      )}
    </ThemeProvider>
  );
}

const lockStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
