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
  Modal,
  TextInput,
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
  const [damageModal, setDamageModal] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damageType, setDamageType] = useState('Other');
  const [damageLocation, setDamageLocation] = useState('');
  const [submittingDamage, setSubmittingDamage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

  async function handleDamageSubmit() {
    if (!booking) return;
    if (damageDesc.trim().length < 10) {
      Alert.alert('Fehler', 'Beschreibung muss mindestens 10 Zeichen lang sein.');
      return;
    }
    setSubmittingDamage(true);
    try {
      await api.reportDamage(booking.id, {
        description: damageDesc.trim(),
        type: damageType,
        locationOnCar: damageLocation.trim() || undefined,
      });
      setDamageModal(false);
      setDamageDesc('');
      setDamageLocation('');
      Alert.alert('Gemeldet', 'Ihr Schadenbericht wurde erfolgreich eingereicht.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Meldung fehlgeschlagen.';
      Alert.alert('Fehler', msg);
    } finally {
      setSubmittingDamage(false);
    }
  }

  const meta = STATUS_META[booking.status] || STATUS_META.Pending;
  const car = booking.car;
  const days = daysBetween(booking.startDate, booking.endDate);
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';
  const canPay =
    booking.status !== 'Cancelled' &&
    booking.paymentStatus !== 'Paid' &&
    booking.paymentStatus !== 'Refunded';
  const canReportDamage = booking.status === 'Active' || booking.status === 'Completed';

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
              <DetailRow label="Abholort" value={booking.pickupLocation.name} icon="location-outline" color={colors.tint} colors={colors} />
            )}
            {booking.returnLocation && (
              <DetailRow label="Rückgabeort" value={booking.returnLocation.name} icon="flag-outline" color={colors.tint} colors={colors} />
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
            {formatCurrency(booking.totalAmount)}
          </Text>
        </View>
      </View>

      {booking.payments && booking.payments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Zahlungsverlauf</Text>
          <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
            {booking.payments.map((p: any, i: number) => (
              <View key={p.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.paymentRow}>
                  <View style={styles.paymentLeft}>
                    <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: '600', fontSize: 14 }}>{formatCurrency(p.amount)}</Text>
                      <Text style={{ color: colors.tabIconDefault, fontSize: 12 }}>
                        {p.paymentMethod}{p.paidAt ? ` · ${new Date(p.paidAt).toLocaleDateString('de-AT')}` : ''}
                      </Text>
                    </View>
                  </View>
                  {p.transactionId && (
                    <Text style={{ color: colors.tabIconDefault, fontSize: 11 }} numberOfLines={1}>
                      #{p.transactionId.slice(-8)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

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
                Jetzt bezahlen · {formatCurrency(booking.totalAmount)}
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

      {canReportDamage && (
        <TouchableOpacity
          onPress={() => setDamageModal(true)}
          style={[styles.damageBtn, { borderColor: '#f59e0b' }]}
        >
          <Ionicons name="warning-outline" size={18} color="#f59e0b" />
          <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>Schaden melden</Text>
        </TouchableOpacity>
      )}

      {/* NEW BUTTONS */}
      <View style={{ marginTop: 20, gap: 10 }}>
        <TouchableOpacity
          onPress={() => router.push(`/check-in/${booking.id}`)}
          style={[styles.primaryBtn, { backgroundColor: colors.text }]}
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.background} />
          <Text style={[styles.primaryBtnText, { color: colors.background }]}>Self Check-in starten</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowInstructions(true)}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="help-circle-outline" size={20} color={colors.text} />
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Wie kann ich einchecken?</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions Modal */}
      <Modal visible={showInstructions} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check-in Anleitung</Text>
              <TouchableOpacity onPress={() => setShowInstructions(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.instructionBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.instructionStep, { color: colors.text }]}>1. Zum Standort fahren</Text>
                <Text style={[styles.instructionText, { color: colors.tabIconDefault }]}>
                  {booking.pickupLocation?.address ? `${booking.pickupLocation.address}, ${booking.pickupLocation.city}` : 'Rent-Ex Feldkirch'}
                </Text>
                
                {booking.pickupLocation?.address && (
                  <TouchableOpacity 
                    onPress={() => {
                      const addr = `${booking.pickupLocation?.address}, ${booking.pickupLocation?.city}`;
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);
                    }}
                    style={[styles.mapsBtn, { borderColor: colors.tint }]}
                  >
                    <Ionicons name="map-outline" size={16} color={colors.tint} />
                    <Text style={[styles.mapsBtnText, { color: colors.tint }]}>Route in Google Maps</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.stepDivider} />

                <Text style={styles.instructionStep}>2. Safe-Code nutzen</Text>
                <Text style={[styles.instructionText, { color: colors.tabIconDefault }]}>
                  Geben Sie den Code <Text style={{ fontWeight: '800', color: colors.tint }}>8421</Text> am Tastenfeld des Safes beim Haupteingang ein.
                </Text>

                <View style={styles.stepDivider} />

                <Text style={styles.instructionStep}>3. Schlüssel entnehmen</Text>
                <Text style={[styles.instructionText, { color: colors.tabIconDefault }]}>
                  Entnehmen Sie den Schlüssel für das Fahrzeug ({car?.brand} {car?.model}) mit dem Kennzeichen <Text style={{ fontWeight: '800', color: colors.text }}>{car?.plate || 'unbekannt'}</Text>.
                </Text>

                <View style={styles.stepDivider} />

                <Text style={styles.instructionStep}>4. Fahrzeug prüfen</Text>
                <Text style={[styles.instructionText, { color: colors.tabIconDefault }]}>
                  Überprüfen Sie das Fahrzeug auf Vorschäden und dokumentieren Sie diese ggf. in der App.
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setShowInstructions(false)}
                style={[styles.primaryBtn, { backgroundColor: colors.text, marginTop: 20 }]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.background }]}>Verstanden</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={damageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schaden melden</Text>
              <TouchableOpacity onPress={() => setDamageModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.tabIconDefault }]}>Schadensart</Text>
            <View style={styles.typeRow}>
              {['Scratch', 'Dent', 'Broken Glass', 'Missing Part', 'Other'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setDamageType(t)}
                  style={[
                    styles.typeChip,
                    { borderColor: damageType === t ? colors.tint : colors.border,
                      backgroundColor: damageType === t ? `${colors.tint}22` : 'transparent' },
                  ]}
                >
                  <Text style={{ color: damageType === t ? colors.tint : colors.tabIconDefault, fontSize: 12, fontWeight: '600' }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.tabIconDefault }]}>Beschreibung *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={damageDesc}
              onChangeText={setDamageDesc}
              placeholder="Beschreiben Sie den Schaden genau (mind. 10 Zeichen)..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.inputLabel, { color: colors.tabIconDefault }]}>Ort am Fahrzeug (optional)</Text>
            <TextInput
              style={[styles.singleInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={damageLocation}
              onChangeText={setDamageLocation}
              placeholder="z.B. Vorne links, Hinterstoßstange..."
              placeholderTextColor={colors.tabIconDefault}
            />

            <TouchableOpacity
              onPress={handleDamageSubmit}
              disabled={submittingDamage}
              style={[styles.submitBtn, { backgroundColor: '#f59e0b', opacity: submittingDamage ? 0.7 : 1 }]}
            >
              {submittingDamage ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Schaden einreichen</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
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
  damageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  singleInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    height: 46,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionBox: {
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  instructionStep: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginTop: -8,
  },
  mapsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
