import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
import type { AdminCustomer } from '@/lib/types';

export default function AdminCustomersScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await api.adminCustomers({ search: search.trim() || undefined });
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { load(); }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.tabIconDefault} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load()}
          placeholder="Name, E-Mail, Telefon…"
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
      </View>

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
              <Ionicons name="people-outline" size={42} color={colors.tabIconDefault} />
              <Text style={{ color: colors.tabIconDefault, marginTop: 8 }}>Keine Kunden gefunden.</Text>
            </View>
          }
          renderItem={({ item }) => <CustomerRow item={item} colors={colors} />}
        />
      )}
    </View>
  );
}

function CustomerRow({ item, colors }: { item: AdminCustomer; colors: any }) {
  const initials = `${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`.toUpperCase();
  return (
    <RNView style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <RNView style={[styles.avatar, { backgroundColor: colors.tint + '22' }]}>
        <Text style={[styles.initials, { color: colors.tint }]}>{initials}</Text>
      </RNView>
      <RNView style={{ flex: 1 }}>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.firstName} {item.lastName}
          </Text>
          {item.isBlacklisted && (
            <RNView style={styles.blk}>
              <Ionicons name="warning" size={10} color="#fff" />
              <Text style={styles.blkText}>Blacklist</Text>
            </RNView>
          )}
        </RNView>
        <Text style={[styles.meta, { color: colors.tabIconDefault }]} numberOfLines={1}>
          {item.email}
        </Text>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={{ color: colors.tabIconDefault, fontSize: 12 }}>
            {item.rentalCount} {item.rentalCount === 1 ? 'Miete' : 'Mieten'}
          </Text>
          {item.city && (
            <>
              <Text style={{ color: colors.tabIconDefault, fontSize: 12 }}>·</Text>
              <Text style={{ color: colors.tabIconDefault, fontSize: 12 }}>{item.city}</Text>
            </>
          )}
        </RNView>
      </RNView>
      {item.phone && (
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.callBtn}>
          <Ionicons name="call" size={18} color={colors.tint} />
        </TouchableOpacity>
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: 'bold', fontSize: 15 },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
  blk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  blkText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  callBtn: { padding: 8 },
});
