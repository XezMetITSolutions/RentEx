import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import type { Car, Location } from '@/lib/types';
import { addDays, daysBetween, formatCurrency, formatDate, toIsoDate } from '@/lib/format';

export default function NewBookingScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [car, setCar] = useState<Car | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'CONFIG' | 'EXTRAS' | 'REVIEW' | 'SUCCESS'>('CONFIG');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [agbAccepted, setAgbAccepted] = useState(false);

  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(addDays(today, 3));
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  useEffect(() => {
    const id = Number(carId);
    if (!id) {
      setError('Ungültige Fahrzeug-ID');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [carData, locsData] = await Promise.all([
          api.getCar(id),
          api.listLocations()
        ]);
        setCar(carData);
        setLocations(locsData);
        
        if (locsData.length > 0) {
          const defaultLoc = locsData.find(l => l.name.toLowerCase().includes('feldkirch')) || locsData[0];
          setPickupLocation(defaultLoc.name);
          setReturnLocation(defaultLoc.name);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
      } finally {
        setLoading(false);
      }
    })();
  }, [carId]);

  const EXTRAS = [
    { id: 'insurance', name: 'Premium-Versicherung', price: 15, icon: 'shield-checkmark' },
    { id: 'gps', name: 'GPS Navigationssystem', price: 5, icon: 'navigate' },
    { id: 'seat', name: 'Kindersitz', price: 8, icon: 'body' },
  ];

  const days = daysBetween(startDate, endDate);
  const dailyRate = car ? Number(car.dailyRate) || 0 : 0;
  const extrasTotal = selectedExtras.reduce((acc, id) => {
    const extra = EXTRAS.find(e => e.id === id);
    return acc + (extra?.price || 0);
  }, 0) * days;
  const subtotal = dailyRate * days;
  const total = subtotal + extrasTotal;

  async function handleSubmit() {
    if (!car) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await api.createBooking({
        carId: car.id,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        pickupLocation: pickupLocation,
        returnLocation: returnLocation || pickupLocation,
      });
      setBookingId(booking.id);
      setStep('SUCCESS');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Buchung fehlgeschlagen.';
      setError(msg);
      setStep('REVIEW');
    } finally {
      setSubmitting(false);
    }
  }

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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

  if (step === 'SUCCESS') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 30 }]}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={60} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Buchung Erfolgreich!</Text>
        <Text style={styles.successSubtitle}>
          Deine Buchung #{bookingId} wurde erstellt. Wir freuen uns auf dich!
        </Text>
        <TouchableOpacity 
          style={[styles.mainBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.replace(`/booking/${bookingId}`)}
        >
          <Text style={styles.mainBtnText}>ZUR BUCHUNG</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 20 }}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={{ color: colors.tabIconDefault, fontWeight: 'bold' }}>ZURÜCK ZUR ÜBERSICHT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Progress Bar */}
        <View style={styles.progressRow}>
          {['CONFIG', 'EXTRAS', 'REVIEW'].map((s, i) => (
            <View key={s} style={styles.progressStepContainer}>
              <View style={[
                styles.progressDot, 
                { backgroundColor: step === s || ['EXTRAS', 'REVIEW'].includes(step) && i < 1 || step === 'REVIEW' && i < 2 ? colors.tint : colors.border }
              ]} />
              {i < 2 && <View style={[styles.progressLine, { backgroundColor: ['EXTRAS', 'REVIEW'].includes(step) && i < 1 || step === 'REVIEW' && i < 2 ? colors.tint : colors.border }]} />}
            </View>
          ))}
        </View>

        {step === 'CONFIG' && (
          <View style={{ backgroundColor: 'transparent' }}>
            <View style={[styles.carCard, { backgroundColor: colors.card }]}>
              {car.imageUrl ? (
                <Image source={{ uri: car.imageUrl }} style={styles.carImage} />
              ) : (
                <View style={[styles.carImage, { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="car" size={32} color={colors.tabIconDefault} />
                </View>
              )}
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={styles.carName}>{car.brand} {car.model}</Text>
                <Text style={[styles.carCategory, { color: colors.tabIconDefault }]}>{car.category}</Text>
                <Text style={[styles.carPrice, { color: colors.tint }]}>{formatCurrency(dailyRate)} / Tag</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Zeitraum</Text>
            <View style={[styles.dateRow, { backgroundColor: colors.card }]}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.dateLabel, { color: colors.tabIconDefault }]}>Abholung</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity onPress={() => adjustDate('start', -1)} style={[styles.stepBtn, { backgroundColor: colors.background }]}><Ionicons name="remove" size={16} color={colors.text} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => adjustDate('start', 1)} style={[styles.stepBtn, { backgroundColor: colors.background }]}><Ionicons name="add" size={16} color={colors.text} /></TouchableOpacity>
                </View>
              </View>
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.dateLabel, { color: colors.tabIconDefault }]}>RÜCKGABE</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity onPress={() => adjustDate('end', -1)} style={[styles.stepBtn, { backgroundColor: colors.background }]}><Ionicons name="remove" size={16} color={colors.text} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => adjustDate('end', 1)} style={[styles.stepBtn, { backgroundColor: colors.background }]}><Ionicons name="add" size={16} color={colors.text} /></TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Abholort</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={`pickup-${loc.id}`}
                  onPress={() => setPickupLocation(loc.name)}
                  style={[styles.locationChip, { backgroundColor: pickupLocation === loc.name ? colors.tint : colors.card, borderColor: pickupLocation === loc.name ? colors.tint : colors.border }]}
                >
                  <Text style={{ color: pickupLocation === loc.name ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 'EXTRAS' && (
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.stepTitle}>Wähle deine Extras</Text>
            <Text style={styles.stepSubtitle}>Mache deine Fahrt noch komfortabler</Text>
            {EXTRAS.map(extra => (
              <TouchableOpacity 
                key={extra.id} 
                onPress={() => toggleExtra(extra.id)}
                style={[styles.extraCard, { backgroundColor: colors.card, borderColor: selectedExtras.includes(extra.id) ? colors.tint : 'transparent' }]}
              >
                <View style={[styles.extraIcon, { backgroundColor: colors.background }]}>
                  <Ionicons name={extra.icon as any} size={24} color={selectedExtras.includes(extra.id) ? colors.tint : colors.tabIconDefault} />
                </View>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                  <Text style={styles.extraName}>{extra.name}</Text>
                  <Text style={styles.extraPrice}>{formatCurrency(extra.price)} / Tag</Text>
                </View>
                <Ionicons 
                  name={selectedExtras.includes(extra.id) ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={selectedExtras.includes(extra.id) ? colors.tint : colors.border} 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'REVIEW' && (
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.stepTitle}>Prüfen & Bestätigen</Text>
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.tabIconDefault }}>Miete ({days} Tage)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              {selectedExtras.map(id => {
                const e = EXTRAS.find(x => x.id === id);
                return (
                  <View key={id} style={styles.summaryRow}>
                    <Text style={{ color: colors.tabIconDefault }}>{e?.name}</Text>
                    <Text style={styles.summaryValue}>{formatCurrency((e?.price || 0) * days)}</Text>
                  </View>
                );
              })}
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Gesamtbetrag</Text>
                <Text style={[styles.summaryTotalValue, { color: colors.tint }]}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.card, marginTop: 20 }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
              <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>
                Ihre Daten werden sicher verschlüsselt übertragen.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setAgbAccepted(!agbAccepted)}
            >
              <Ionicons 
                name={agbAccepted ? "checkbox" : "square-outline"} 
                size={24} 
                color={agbAccepted ? colors.tint : colors.tabIconDefault} 
              />
              <Text style={styles.checkboxText}>
                Ich akzeptiere die AGB und die Mietbedingungen der Rent-Ex GmbH.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="alert-circle" size={18} color="#991b1b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {step === 'CONFIG' && (
          <TouchableOpacity
            onPress={() => {
              if (!pickupLocation) setError('Bitte wähle einen Abholort.');
              else setStep('EXTRAS');
            }}
            style={[styles.confirmBtn, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.confirmBtnText, { color: colors.background }]}>ZUR AUSWAHL</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
          </TouchableOpacity>
        )}
        {step === 'EXTRAS' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setStep('CONFIG')} style={[styles.confirmBtn, { flex: 1, backgroundColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: 'bold' }}>ZURÜCK</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('REVIEW')} style={[styles.confirmBtn, { flex: 2, backgroundColor: colors.text }]}><Text style={[styles.confirmBtnText, { color: colors.background }]}>ZUR ÜBERSICHT</Text></TouchableOpacity>
          </View>
        )}
        {step === 'REVIEW' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setStep('EXTRAS')} style={[styles.confirmBtn, { flex: 1, backgroundColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: 'bold' }}>ZURÜCK</Text></TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !agbAccepted}
              style={[styles.confirmBtn, { flex: 2, backgroundColor: colors.tint, opacity: (submitting || !agbAccepted) ? 0.5 : 1 }]}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <><Text style={styles.confirmBtnText}>JETZT BUCHEN · {formatCurrency(total)}</Text><Ionicons name="flash" size={18} color="#fff" /></>}
            </TouchableOpacity>
          </View>
        )}
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
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  progressRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  progressStepContainer: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressLine: { width: 40, height: 2 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  extraCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 2 },
  extraIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  extraName: { fontSize: 16, fontWeight: 'bold' },
  extraPrice: { fontSize: 12, color: '#888' },
  infoBox: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 14 },
  successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  successSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 40 },
  mainBtn: { width: '100%', height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, paddingHorizontal: 10 },
  checkboxText: { flex: 1, fontSize: 13, color: '#666' },
});
