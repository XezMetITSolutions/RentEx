import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import { Config } from '@/constants/Config';
import {
  authenticate,
  isBiometricEnabled,
  isBiometricSupported,
  setBiometricEnabled as persistBiometric,
} from '@/lib/biometric';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await isBiometricSupported();
      setBiometricAvailable(supported);
      if (supported) setBiometricOn(await isBiometricEnabled());
    })();
  }, []);

  async function toggleBiometric(next: boolean) {
    if (next) {
      const ok = await authenticate('Biometrischen Login aktivieren');
      if (!ok) return;
    }
    await persistBiometric(next);
    setBiometricOn(next);
  }

  async function handleLogout() {
    const doLogout = async () => {
      setLoggingOut(true);
      try {
        await signOut();
      } finally {
        setLoggingOut(false);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Abmelden?')) await doLogout();
    } else {
      Alert.alert('Abmelden', 'Möchten Sie sich wirklich abmelden?', [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Abmelden', style: 'destructive', onPress: doLogout },
      ]);
    }
  }

  const MenuItem = ({
    icon,
    label,
    onPress,
    danger,
    value,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: () => void;
    danger?: boolean;
    value?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#fee2e2' : `${colors.tint}22` }]}>
        <Ionicons name={icon} size={18} color={danger ? '#991b1b' : colors.tint} />
      </View>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Text style={[styles.menuLabel, { color: danger ? '#991b1b' : colors.text }]}>{label}</Text>
        {value && (
          <Text style={[styles.menuValue, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '?'}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {user?.email}
          </Text>
          {user?.phone && (
            <Text style={[styles.email, { color: colors.tabIconDefault }]}>{user.phone}</Text>
          )}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>KONTO</Text>
      <MenuItem
        icon="person-outline"
        label="Profil bearbeiten"
        onPress={() => router.push('/profile/edit')}
      />
      <MenuItem
        icon="lock-closed-outline"
        label="Passwort ändern"
        onPress={() => router.push('/profile/password')}
      />
      <MenuItem
        icon="document-text-outline"
        label="Meine Dokumente"
        onPress={() => router.push('/profile/documents')}
        value="Führerschein, Ausweis"
      />

      <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>EINSTELLUNGEN</Text>
      <MenuItem
        icon="notifications-outline"
        label="Benachrichtigungen"
        onPress={() => router.push('/modal')}
      />
      <MenuItem
        icon="language-outline"
        label="Sprache"
        value="Deutsch"
        onPress={() => {}}
      />
      <MenuItem
        icon="moon-outline"
        label="Theme"
        value={colorScheme === 'dark' ? 'Dunkel' : 'Hell'}
        onPress={() => {}}
      />
      {biometricAvailable && (
        <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={[styles.menuIcon, { backgroundColor: `${colors.tint}22` }]}>
            <Ionicons name="finger-print" size={18} color={colors.tint} />
          </View>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Biometrische Sperre</Text>
            <Text style={[styles.menuValue, { color: colors.tabIconDefault }]}>
              Fingerabdruck / Face ID beim Öffnen
            </Text>
          </View>
          <Switch
            value={biometricOn}
            onValueChange={toggleBiometric}
            trackColor={{ true: colors.tint, false: colors.border }}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>SUPPORT</Text>
      <MenuItem
        icon="help-circle-outline"
        label="Hilfe & FAQ"
        onPress={() => Linking.openURL('https://rentex.app/faq').catch(() => {})}
      />
      <MenuItem
        icon="mail-outline"
        label="Kontakt"
        value={Config.supportEmail}
        onPress={() => Linking.openURL(`mailto:${Config.supportEmail}`).catch(() => {})}
      />
      <MenuItem
        icon="document-outline"
        label="AGB & Datenschutz"
        onPress={() => Linking.openURL('https://rentex.app/agb').catch(() => {})}
      />

      <View style={{ height: 20 }} />
      <MenuItem
        icon="log-out-outline"
        label={loggingOut ? 'Abmelden…' : 'Abmelden'}
        onPress={handleLogout}
        danger
      />

      <Text style={[styles.version, { color: colors.tabIconDefault }]}>
        {Config.appName} · v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  name: { fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 14, marginBottom: 8, marginLeft: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  menuValue: { fontSize: 12, marginTop: 1 },
  version: { textAlign: 'center', marginTop: 24, fontSize: 12 },
});
