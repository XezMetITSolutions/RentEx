import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Car } from '@/lib/types';
import { addDays, daysBetween, formatCurrency, formatDate, toIsoDate } from '@/lib/format';

export default function NewBookingScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(addDays(today, 3));
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');

  useEffect(() => {
    const id = Number(carId);
    if (!id) {
      setError('Ungültige Fahrzeug-ID');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await api.getCar(id);
        setCar(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
      } finally {
        setLoading(false);
      }
    })();
  }, [carId]);

  const days = daysBetween(startDate, endDate);
  const dailyRate = car ? Number(car.dailyRate) || 0 : 0;
  const subtotal = dailyRate * days;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  async function handleSubmit() {
    if (!car) return;
    if (endDate <= startDate) {
      setError('Rückgabedatum muss nach Abholung liegen.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await api.createBooking({
        carId: car.id,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        pickupLocation: pickupLocation.trim() || undefined,
        returnLocation: returnLocation.trim() || undefined,
      });
      if (Platform.OS === 'web') {
        router.replace(`/booking/${booking.id}`);
      } else {
        Alert.alert('Buchung erfolgreich', `Ihre Buchung #${booking.id} wurde erstellt.`, [
          { text: 'OK', onPress: () => router.replace(`/booking/${booking.id}`) },
        ]);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Buchung fehlgeschlagen.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function adjustDate(which: 'start' | 'end', delta: number) {
    if (which === 'start') {
      const next = addDays(startDate, delta);
      if (next < new Date(new Date().setHours(0, 0, 0, 0))) return;
      setStartDate(next);
      if (endDate <= next) setEndDate(addDays(next, 1));
    } else {
      const next = addDays(endDate, delta);
      if (next <= startDate) return;
      setEndDate(next);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Text>{error || 'Fahrzeug nicht gefunden'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View style={[styles.carCard, { backgroundColor: colors.card }]}>
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
            <Text style={[styles.carCategory, { color: colors.tabIconDefault }]}>{car.category}</Text>
            <Text style={[styles.carPrice, { color: colors.tint }]}>
              {formatCurrency(dailyRate)} / Tag
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Zeitraum</Text>
        <View style={[styles.dateRow, { backgroundColor: colors.card }]}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.dateLabel, { color: colors.tabIconDefault }]}>Abholung</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => adjustDate('start', -1)}
                style={[styles.stepBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustDate('start', 1)}
                style={[styles.stepBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.dateLabel, { color: colors.tabIconDefault }]}>Rückgabe</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => adjustDate('end', -1)}
                style={[styles.stepBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustDate('end', 1)}
                style={[styles.stepBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={[styles.daysText, { color: colors.tabIconDefault }]}>
          {days} {days === 1 ? 'Tag' : 'Tage'}
        </Text>

        <Text style={styles.sectionTitle}>Abhol- / Rückgabeort</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="location-outline" size={20} color={colors.tabIconDefault} />
          <TextInput
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder="Abholort (optional)"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
          <Ionicons name="location-outline" size={20} color={colors.tabIconDefault} />
          <TextInput
            value={returnLocation}
            onChangeText={setReturnLocation}
            placeholder="Rückgabeort (optional)"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <Text style={styles.sectionTitle}>Zusammenfassung</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.tabIconDefault }}>
              {formatCurrency(dailyRate)} × {days} {days === 1 ? 'Tag' : 'Tage'}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.tabIconDefault }}>Service-Gebühr (5%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(serviceFee)}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Gesamt</Text>
            <Text style={[styles.summaryTotalValue, { color: colors.tint }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="alert-circle" size={18} color="#991b1b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.confirmBtn, { backgroundColor: colors.tint, opacity: submitting ? 0.7 : 1 }]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Buchung bestätigen · {formatCurrency(total)}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  carCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  carImage: { width: 80, height: 80, borderRadius: 10 },
  carName: { fontSize: 16, fontWeight: 'bold' },
  carCategory: { fontSize: 12, marginTop: 2 },
  carPrice: { fontSize: 15, fontWeight: 'bold', marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 18, marginBottom: 10 },
  dateRow: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  dateLabel: { fontSize: 12 },
  dateValue: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  stepperRow: { flexDirection: 'row', gap: 8, marginTop: 10, backgroundColor: 'transparent' },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: { width: 1, alignSelf: 'stretch' },
  daysText: { marginTop: 6, fontSize: 12, textAlign: 'right' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14 },
  summaryCard: { padding: 16, borderRadius: 14 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  summaryValue: { fontWeight: '600' },
  summaryDivider: { height: 1, marginVertical: 10 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  errorText: { color: '#991b1b', flex: 1, fontSize: 13 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 12,
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
