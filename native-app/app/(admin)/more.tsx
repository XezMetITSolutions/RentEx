import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import {
  authenticate,
  isBiometricEnabled,
  isBiometricSupported,
  setBiometricEnabled as persistBiometric,
} from '@/lib/biometric';

export default function MoreScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { staff, signOut } = useAuth();

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

  const confirmLogout = () => {
    Alert.alert('Abmelden', 'Möchten Sie sich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <RNView style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <RNView style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Ionicons name="person" size={28} color="#fff" />
        </RNView>
        <Text style={[styles.name, { color: colors.text }]}>{staff?.name || 'Mitarbeiter'}</Text>
        <Text style={{ color: colors.tabIconDefault, fontSize: 13, marginTop: 2 }}>
          {staff?.email}
        </Text>
        <RNView style={[styles.rolePill, { backgroundColor: colors.tint + '22' }]}>
          <Text style={[styles.roleText, { color: colors.tint }]}>{staff?.role}</Text>
        </RNView>
        {staff?.locationName && (
          <Text style={{ color: colors.tabIconDefault, fontSize: 12, marginTop: 6 }}>
            📍 {staff.locationName}
          </Text>
        )}
      </RNView>

      <Section title="Werkzeuge" colors={colors}>
        <Row
          colors={colors}
          icon="qr-code"
          label="QR-Code scannen"
          onPress={() => router.push('/(admin)/scanner')}
        />
        <Row
          colors={colors}
          icon="time"
          label="Aktivitäts-Protokoll"
          onPress={() => router.push('/(admin)/activity')}
        />
      </Section>

      <Section title="Sicherheit" colors={colors}>
        {biometricAvailable ? (
          <RNView style={[styles.row, { gap: 12 }]}>
            <Ionicons name="finger-print" size={20} color={colors.tint} />
            <RNView style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Biometrische Sperre</Text>
              <Text style={{ color: colors.tabIconDefault, fontSize: 12, marginTop: 2 }}>
                Beim Öffnen authentifizieren
              </Text>
            </RNView>
            <Switch
              value={biometricOn}
              onValueChange={toggleBiometric}
              trackColor={{ true: colors.tint, false: colors.border }}
            />
          </RNView>
        ) : (
          <Row colors={colors} icon="finger-print" label="Biometrie nicht verfügbar" onPress={() => {}} />
        )}
      </Section>

      <Section title="App" colors={colors}>
        <Row colors={colors} icon="notifications-outline" label="Benachrichtigungen" onPress={() => router.push('/modal')} />
        <Row colors={colors} icon="information-circle-outline" label="Info" onPress={() => {}} />
      </Section>

      <TouchableOpacity onPress={confirmLogout} style={[styles.logoutBtn, { borderColor: colors.border }]}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <RNView style={{ marginTop: 20 }}>
      <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>{title}</Text>
      <RNView style={[styles.sectionBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </RNView>
    </RNView>
  );
}

function Row({
  colors,
  icon,
  label,
  onPress,
}: {
  colors: any;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.6}>
      <Ionicons name={icon} size={20} color={colors.tint} />
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: 'bold' },
  rolePill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionBody: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9ca3af55',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
});
