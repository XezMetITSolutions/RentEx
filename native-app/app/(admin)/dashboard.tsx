import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';

export default function AdminDashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { staff } = useAuth();

  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const d = await api.adminDashboard();
      setData(d);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Konnte Dashboard nicht laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      <View style={styles.hero}>
        <Text style={[styles.hello, { color: colors.tabIconDefault }]}>Hallo</Text>
        <Text style={styles.name}>{staff?.name || 'Mitarbeiter'}</Text>
        {staff?.locationName ? (
          <RNView style={[styles.locBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="location" size={12} color={colors.tint} />
            <Text style={[styles.locText, { color: colors.text }]}>{staff.locationName}</Text>
          </RNView>
        ) : null}
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
          <Text style={{ color: '#991b1b' }}>{error}</Text>
        </View>
      )}

      {data && (
        <>
          <Text style={styles.sectionTitle}>Heute</Text>
          <View style={styles.row}>
            <StatCard
              color={colors}
              icon="log-in"
              label="Abholungen"
              value={data.rentals.todayPickups}
              onPress={() => router.push('/(admin)/rentals?status=Confirmed')}
            />
            <StatCard
              color={colors}
              icon="log-out"
              label="Rückgaben"
              value={data.rentals.todayReturns}
              onPress={() => router.push('/(admin)/rentals?status=Active')}
            />
          </View>

          <Text style={styles.sectionTitle}>Mieten</Text>
          <View style={styles.row}>
            <StatCard color={colors} icon="flash" label="Aktiv" value={data.rentals.active} />
            <StatCard color={colors} icon="hourglass" label="Ausstehend" value={data.rentals.pending} />
          </View>
          <View style={styles.row}>
            <StatCard
              color={colors}
              icon="alert-circle"
              label="Überfällig"
              value={data.rentals.overdue}
              accent={data.rentals.overdue > 0 ? '#dc2626' : undefined}
            />
            <StatCard color={colors} icon="calendar" label="Monat" value={data.rentals.monthCount} />
          </View>

          <Text style={styles.sectionTitle}>Flotte</Text>
          <View style={styles.row}>
            <StatCard color={colors} icon="car-sport" label="Gesamt" value={data.cars.total} />
            <StatCard color={colors} icon="checkmark-circle" label="Verfügbar" value={data.cars.active} />
          </View>
          <View style={styles.row}>
            <StatCard color={colors} icon="construct" label="Wartung" value={data.cars.maintenance} />
            <StatCard
              color={colors}
              icon="cash"
              label="Umsatz (Monat)"
              value={`${Math.round(data.revenue.month).toLocaleString('de-DE')} €`}
              small
            />
          </View>

          <Text style={styles.sectionTitle}>Schnellzugriff</Text>
          <QuickAction
            colors={colors}
            icon="qr-code"
            label="QR-Code scannen"
            onPress={() => router.push('/(admin)/scanner')}
          />
          <QuickAction
            colors={colors}
            icon="time"
            label="Aktivitäts-Protokoll"
            onPress={() => router.push('/(admin)/activity')}
          />
        </>
      )}
    </ScrollView>
  );
}

function StatCard({
  color,
  icon,
  label,
  value,
  accent,
  small,
  onPress,
}: {
  color: any;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number | string;
  accent?: string;
  small?: boolean;
  onPress?: () => void;
}) {
  const inner = (
    <View style={[styles.card, { backgroundColor: color.card, borderColor: color.border }]}>
      <RNView style={styles.cardHead}>
        <Ionicons name={icon} size={16} color={accent || color.tint} />
        <Text style={[styles.cardLabel, { color: color.tabIconDefault }]}>{label}</Text>
      </RNView>
      <Text style={[styles.cardValue, small && { fontSize: 20 }, accent ? { color: accent } : null]}>
        {value}
      </Text>
    </View>
  );
  return onPress ? (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress} activeOpacity={0.7}>
      {inner}
    </TouchableOpacity>
  ) : (
    inner
  );
}

function QuickAction({
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
    <TouchableOpacity
      onPress={onPress}
      style={[styles.qa, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <RNView style={[styles.qaIcon, { backgroundColor: colors.tint + '22' }]}>
        <Ionicons name={icon} size={20} color={colors.tint} />
      </RNView>
      <Text style={[styles.qaLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  hero: { marginBottom: 20 },
  hello: { fontSize: 13 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  locText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardLabel: { fontSize: 12, fontWeight: '500' },
  cardValue: { fontSize: 26, fontWeight: 'bold' },
  errorBox: { padding: 12, borderRadius: 10, marginBottom: 12 },
  qa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  qaIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
});
