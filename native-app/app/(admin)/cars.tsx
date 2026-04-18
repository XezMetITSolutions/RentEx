import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api } from '@/lib/api';
import type { AdminCar } from '@/lib/types';

const STATUSES: { key: string; label: string }[] = [
  { key: '', label: 'Alle' },
  { key: 'Available', label: 'Verfügbar' },
  { key: 'Rented', label: 'Vermietet' },
  { key: 'Maintenance', label: 'Wartung' },
  { key: 'Inactive', label: 'Inaktiv' },
];

export default function AdminCarsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [items, setItems] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        const data = await api.adminCars({
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

  useEffect(() => { load(); }, [status]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.tabIconDefault} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load()}
          placeholder="Marke, Modell oder Kennzeichen…"
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={42} color={colors.tabIconDefault} />
              <Text style={{ color: colors.tabIconDefault, marginTop: 8 }}>Keine Fahrzeuge gefunden.</Text>
            </View>
          }
          renderItem={({ item }) => <CarRow item={item} colors={colors} />}
        />
      )}
    </View>
  );
}

function carStatusColor(status: string): string {
  switch (status) {
    case 'Available': return '#10b981';
    case 'Rented': return '#3b82f6';
    case 'Maintenance': return '#f59e0b';
    case 'Inactive': return '#6b7280';
    default: return '#9ca3af';
  }
}

function CarRow({ item, colors }: { item: AdminCar; colors: any }) {
  return (
    <RNView style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <RNView style={[styles.thumb, { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="car" size={24} color={colors.tabIconDefault} />
        </RNView>
      )}
      <RNView style={{ flex: 1 }}>
        <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>
          {item.brand} {item.model}
        </Text>
        <Text style={[styles.carMeta, { color: colors.tabIconDefault }]}>
          {item.plate} · {item.year}
        </Text>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <RNView style={[styles.dot, { backgroundColor: carStatusColor(item.status) }]} />
          <Text style={{ color: carStatusColor(item.status), fontSize: 12, fontWeight: '700' }}>
            {item.status}
          </Text>
          {item.currentMileage != null && (
            <Text style={{ color: colors.tabIconDefault, fontSize: 12, marginLeft: 8 }}>
              {item.currentMileage.toLocaleString('de-DE')} km
            </Text>
          )}
        </RNView>
      </RNView>
      <Text style={[styles.rate, { color: colors.text }]}>
        {Number(item.dailyRate).toLocaleString('de-DE')} €
      </Text>
    </RNView>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  thumb: { width: 70, height: 50, borderRadius: 8 },
  carName: { fontSize: 15, fontWeight: '700' },
  carMeta: { fontSize: 12, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rate: { fontSize: 14, fontWeight: '700' },
});
