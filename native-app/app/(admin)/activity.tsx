import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api } from '@/lib/api';
import type { AdminActivityLog } from '@/lib/types';

export default function AdminActivityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [items, setItems] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.adminActivity();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={42} color={colors.tabIconDefault} />
            <Text style={{ color: colors.tabIconDefault, marginTop: 8 }}>Keine Einträge.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const when = new Date(item.createdAt);
          const whenStr = when.toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          });
          return (
            <RNView style={styles.item}>
              <RNView style={[styles.bullet, { backgroundColor: actionColor(item.action) }]} />
              <RNView style={{ flex: 1 }}>
                <Text style={[styles.action, { color: colors.text }]}>{item.action}</Text>
                <Text style={[styles.desc, { color: colors.tabIconDefault }]}>{item.description}</Text>
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Text style={{ color: colors.tabIconDefault, fontSize: 11 }}>{whenStr}</Text>
                  {item.userName && (
                    <>
                      <Text style={{ color: colors.tabIconDefault, fontSize: 11 }}>·</Text>
                      <Text style={{ color: colors.tabIconDefault, fontSize: 11 }}>{item.userName}</Text>
                    </>
                  )}
                </RNView>
              </RNView>
            </RNView>
          );
        }}
      />
    </View>
  );
}

function actionColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('delete')) return '#ef4444';
  if (a.includes('create') || a.includes('add')) return '#10b981';
  if (a.includes('update') || a.includes('edit')) return '#3b82f6';
  if (a.includes('checkin') || a.includes('checkout')) return '#f59e0b';
  return '#6b7280';
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  bullet: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  action: { fontSize: 14, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});
