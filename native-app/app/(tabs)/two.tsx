import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDateRange } from '@/lib/format';

const STATUS_META: Record<BookingStatus, { color: string; label: string }> = {
  Pending: { color: '#f59e0b', label: 'Ausstehend' },
  Confirmed: { color: '#22c55e', label: 'Bestätigt' },
  Active: { color: '#3b82f6', label: 'Aktiv' },
  Completed: { color: '#64748b', label: 'Abgeschlossen' },
  Cancelled: { color: '#ef4444', label: 'Storniert' },
};

export default function BookingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const visible = bookings.filter((b) => {
    if (filter === 'active') return ['Pending', 'Confirmed', 'Active'].includes(b.status);
    if (filter === 'past') return ['Completed', 'Cancelled'].includes(b.status);
    return true;
  });

  const renderBooking = (booking: Booking) => {
    const meta = STATUS_META[booking.status] || STATUS_META.Pending;
    const car = booking.car;
    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.bookingCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/booking/${booking.id}`)}
      >
        {car?.imageUrl ? (
          <Image source={{ uri: car.imageUrl }} style={styles.carThumbnail} />
        ) : (
          <View style={[styles.carThumbnail, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="car" size={28} color={colors.tabIconDefault} />
          </View>
        )}
        <View style={styles.bookingInfo}>
          <Text style={styles.carName} numberOfLines={1}>
            {car ? `${car.brand} ${car.model}` : `Buchung #${booking.id}`}
          </Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.tabIconDefault} />
            <Text style={[styles.bookingDate, { color: colors.tabIconDefault }]}>
              {formatDateRange(booking.startDate, booking.endDate)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${meta.color}22` }]}>
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            <Text style={[styles.price, { color: colors.tint }]}>{formatCurrency(booking.totalPrice)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20, paddingTop: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      <View style={styles.tabRow}>
        {([
          { k: 'all', label: 'Alle' },
          { k: 'active', label: 'Aktiv' },
          { k: 'past', label: 'Vergangen' },
        ] as const).map((t) => {
          const active = filter === t.k;
          return (
            <TouchableOpacity
              key={t.k}
              onPress={() => setFilter(t.k)}
              style={[
                styles.filterChip,
                { backgroundColor: active ? colors.tint : colors.card, borderColor: active ? colors.tint : colors.border },
              ]}
            >
              <Text style={{ color: active ? '#fff' : colors.text, fontWeight: active ? '700' : '500' }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
          <Ionicons name="warning" size={16} color="#991b1b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 60 }} />
      ) : visible.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>Keine Buchungen gefunden</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={[styles.exploreBtn, { backgroundColor: colors.tint }]}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Jetzt entdecken</Text>
          </TouchableOpacity>
        </View>
      ) : (
        visible.map(renderBooking)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  bookingCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  carThumbnail: { width: 80, height: 80, borderRadius: 12 },
  bookingInfo: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center' },
  carName: { fontSize: 16, fontWeight: 'bold' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bookingDate: { fontSize: 13 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  price: { fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 15, fontSize: 16 },
  exploreBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: { color: '#991b1b', flex: 1, fontSize: 13 },
});
