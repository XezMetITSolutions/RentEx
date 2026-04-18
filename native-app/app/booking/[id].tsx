import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDate, daysBetween } from '@/lib/format';

const STATUS_META: Record<BookingStatus, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  Pending: { color: '#f59e0b', label: 'Ausstehend', icon: 'time-outline' },
  Confirmed: { color: '#22c55e', label: 'Bestätigt', icon: 'checkmark-circle-outline' },
  Active: { color: '#3b82f6', label: 'Aktiv', icon: 'car-sport-outline' },
  Completed: { color: '#64748b', label: 'Abgeschlossen', icon: 'flag-outline' },
  Cancelled: { color: '#ef4444', label: 'Storniert', icon: 'close-circle-outline' },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const bookingId = Number(id);
    if (!bookingId) {
      setError('Ungültige Buchungs-ID');
      setLoading(false);
      return;
    }
    try {
      const data = await api.getBooking(bookingId);
      setBooking(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url && url.includes('booking/')) load();
    });
    return () => sub.remove();
  }, [load]);

  async function handlePay() {
    if (!booking) return;
    setPaying(true);
    try {
      const { url } = await api.startCheckout(booking.id);
      if (!url) throw new Error('Keine Zahlungs-URL erhalten.');
      const result = await WebBrowser.openAuthSessionAsync(url, 'rentex://booking');
      if (result.type === 'success' || result.type === 'dismiss') {
        await load();
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error)?.message || 'Zahlung konnte nicht gestartet werden.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Fehler', msg);
    } finally {
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    const doCancel = async () => {
      setCancelling(true);
      try {
        const updated = await api.cancelBooking(booking.id);
        setBooking(updated);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Stornierung fehlgeschlagen.';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Fehler', msg);
      } finally {
        setCancelling(false);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Buchung wirklich stornieren?')) await doCancel();
    } else {
      Alert.alert('Stornieren', 'Buchung wirklich stornieren?', [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Stornieren', style: 'destructive', onPress: doCancel },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!booking || error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.tabIconDefault} />
        <Text style={{ marginTop: 12, color: colors.tabIconDefault, textAlign: 'center' }}>
          {error ?? 'Buchung nicht gefunden'}
        </Text>
      </View>
    );
  }

  const meta = STATUS_META[booking.status] || STATUS_META.Pending;
  const car = booking.car;
  const days = daysBetween(booking.startDate, booking.endDate);
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';
  const canPay =
    booking.status !== 'Cancelled' &&
    booking.paymentStatus !== 'Paid' &&
    booking.paymentStatus !== 'Refunded';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.tint} />}
    >
      <View style={[styles.statusBanner, { backgroundColor: `${meta.color}22` }]}>
        <Ionicons name={meta.icon} size={24} color={meta.color} />
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text style={[styles.statusTitle, { color: meta.color }]}>{meta.label}</Text>
          <Text style={[styles.statusSubtitle, { color: meta.color }]}>
            Buchung #{booking.id}
          </Text>
        </View>
      </View>

      {car && (
        <TouchableOpacity
          onPress={() => router.push(`/car/${car.id}`)}
          style={[styles.carCard, { backgroundColor: colors.card }]}
        >
          {car.imageUrl ? (
            <Image source={{ uri: car.imageUrl }} style={styles.carImage} />
          ) : (
            <View style={[styles.carImage, { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="car" size={32} color={colors.tabIconDefault} />
            </View>
          )}
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={styles.carName}>
              {car.brand} {car.model}
            </Text>
            <Text style={[styles.carMeta, { color: colors.tabIconDefault }]}>
              {[car.category, car.fuelType].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Zeitraum</Text>
      <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
        <DetailRow label="Abholung" value={formatDate(booking.startDate)} icon="play-outline" color={colors.tint} colors={colors} />
        <DetailRow label="Rückgabe" value={formatDate(booking.endDate)} icon="stop-outline" color={colors.tint} colors={colors} />
        <DetailRow label="Dauer" value={`${days} ${days === 1 ? 'Tag' : 'Tage'}`} icon="hourglass-outline" color={colors.tint} colors={colors} />
      </View>

      {(booking.pickupLocation || booking.returnLocation) && (
        <>
          <Text style={styles.sectionTitle}>Standort</Text>
          <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
            {booking.pickupLocation && (
              <DetailRow label="Abholort" value={booking.pickupLocation} icon="location-outline" color={colors.tint} colors={colors} />
            )}
            {booking.returnLocation && (
              <DetailRow label="Rückgabeort" value={booking.returnLocation} icon="flag-outline" color={colors.tint} colors={colors} />
            )}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Zahlung</Text>
      <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
        <DetailRow
          label="Status"
          value={booking.paymentStatus}
          icon="card-outline"
          color={booking.paymentStatus === 'Paid' ? '#22c55e' : colors.tint}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Gesamtpreis</Text>
          <Text style={[styles.totalValue, { color: colors.tint }]}>
            {formatCurrency(booking.totalPrice)}
          </Text>
        </View>
      </View>

      {canPay && (
        <TouchableOpacity
          onPress={handlePay}
          disabled={paying}
          style={[styles.payBtn, { backgroundColor: colors.tint, opacity: paying ? 0.7 : 1 }]}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                Jetzt bezahlen · {formatCurrency(booking.totalPrice)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {canCancel && (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={cancelling}
          style={[styles.cancelBtn, { borderColor: '#ef4444' }]}
        >
          {cancelling ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Buchung stornieren</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  statusTitle: { fontSize: 16, fontWeight: 'bold' },
  statusSubtitle: { fontSize: 12, marginTop: 2, opacity: 0.9 },
  carCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  carImage: { width: 64, height: 64, borderRadius: 10 },
  carName: { fontSize: 16, fontWeight: 'bold' },
  carMeta: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 10 },
  detailCard: { padding: 14, borderRadius: 14, marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 8 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 10,
  },
});
