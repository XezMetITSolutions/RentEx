import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api } from '@/lib/api';
import type { AdminRental } from '@/lib/types';

const STATUSES: { key: string; label: string }[] = [
  { key: '', label: 'Alle' },
  { key: 'Pending', label: 'Offen' },
  { key: 'Confirmed', label: 'Bestätigt' },
  { key: 'Active', label: 'Aktiv' },
  { key: 'Completed', label: 'Abgeschlossen' },
  { key: 'Cancelled', label: 'Storniert' },
];

export default function AdminRentalsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();

  const [items, setItems] = useState<AdminRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(params.status || '');

  const load = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        const data = await api.adminRentals({
          status: status || undefined,
          search: search.trim() || undefined,
        });
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status, search]
  );

  useEffect(() => {
    load();
  }, [status]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.tabIconDefault} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load()}
          placeholder="Suchen…"
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
      </View>

      <RNView style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUSES}
          keyExtractor={(i) => i.key || 'all'}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const active = status === item.key;
            return (
              <TouchableOpacity
                onPress={() => setStatus(item.key)}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.tint, borderColor: colors.tint },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </RNView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="clipboard-outline" size={42} color={colors.tabIconDefault} />
              <Text style={{ color: colors.tabIconDefault, marginTop: 8 }}>Keine Mieten gefunden.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <RentalCard
              item={item}
              colors={colors}
              onPress={() => router.push(`/(admin)/rental/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'Active': return '#10b981';
    case 'Confirmed': return '#3b82f6';
    case 'Pending': return '#f59e0b';
    case 'Completed': return '#6b7280';
    case 'Cancelled': return '#ef4444';
    default: return '#9ca3af';
  }
}

function RentalCard({
  item,
  colors,
  onPress,
}: {
  item: AdminRental;
  colors: any;
  onPress: () => void;
}) {
  const fullName = item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : '—';
  const carLabel = item.car ? `${item.car.brand} ${item.car.model}` : '—';
  const sd = new Date(item.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  const ed = new Date(item.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.rCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <RNView style={styles.rTop}>
        <RNView style={{ flex: 1 }}>
          <Text style={[styles.rCar, { color: colors.text }]} numberOfLines={1}>{carLabel}</Text>
          <Text style={[styles.rPlate, { color: colors.tabIconDefault }]}>{item.car?.plate || ''}</Text>
        </RNView>
        <RNView style={[styles.statusPill, { backgroundColor: statusColor(item.status) + '22' }]}>
          <RNView style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </RNView>
      </RNView>
      <RNView style={styles.rMeta}>
        <Ionicons name="person" size={13} color={colors.tabIconDefault} />
        <Text style={[styles.rMetaText, { color: colors.text }]}>{fullName}</Text>
      </RNView>
      <RNView style={styles.rMeta}>
        <Ionicons name="calendar" size={13} color={colors.tabIconDefault} />
        <Text style={[styles.rMetaText, { color: colors.text }]}>{sd} → {ed}</Text>
        {item.isOverdue && (
          <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700', marginLeft: 'auto' }}>
            ÜBERFÄLLIG
          </Text>
        )}
      </RNView>
      <RNView style={styles.rFoot}>
        <Text style={{ color: colors.tabIconDefault, fontSize: 12 }}>
          {item.contractNumber || `#${item.id}`}
        </Text>
        <Text style={[styles.rPrice, { color: colors.text }]}>
          {Number(item.totalAmount).toLocaleString('de-DE')} €
        </Text>
      </RNView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filters: { paddingVertical: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  rCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  rTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  rCar: { fontSize: 15, fontWeight: '700' },
  rPlate: { fontSize: 12, marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  rMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rMetaText: { fontSize: 13 },
  rFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#9ca3af55',
  },
  rPrice: { fontSize: 14, fontWeight: '700' },
});
