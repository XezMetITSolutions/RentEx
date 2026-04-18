import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api } from '@/lib/api';
import type { AdminRentalDetail } from '@/lib/types';

export default function AdminRentalDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rentalId = Number(id);

  const [data, setData] = useState<AdminRentalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [sheet, setSheet] = useState<'checkin' | 'checkout' | null>(null);
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('Voll');
  const [notes, setNotes] = useState('');
  const [damage, setDamage] = useState('');
  const [extra, setExtra] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.adminRental(rentalId);
      setData(d);
    } catch (err: any) {
      Alert.alert('Fehler', err?.message || 'Konnte Mietvertrag nicht laden.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [rentalId, router]);

  useEffect(() => {
    if (rentalId) load();
  }, [rentalId, load]);

  async function submitCheckIn() {
    setSubmitting(true);
    try {
      await api.adminCheckIn(rentalId, {
        pickupMileage: mileage ? Number(mileage) : undefined,
        fuelLevelPickup: fuel || undefined,
        notes: notes || undefined,
      });
      setSheet(null);
      setMileage(''); setNotes('');
      await load();
      Alert.alert('Erfolg', 'Check-in abgeschlossen.');
    } catch (err: any) {
      Alert.alert('Fehler', err?.message || 'Check-in fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCheckOut() {
    setSubmitting(true);
    try {
      await api.adminCheckOut(rentalId, {
        returnMileage: mileage ? Number(mileage) : undefined,
        fuelLevelReturn: fuel || undefined,
        damageReport: damage || undefined,
        extraCharges: extra ? Number(extra) : undefined,
      });
      setSheet(null);
      setMileage(''); setDamage(''); setExtra('');
      await load();
      Alert.alert('Erfolg', 'Check-out abgeschlossen.');
    } catch (err: any) {
      Alert.alert('Fehler', err?.message || 'Check-out fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Mietvertrag' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </>
    );
  }

  const carLabel = data.car ? `${data.car.brand} ${data.car.model}` : '—';
  const fullName = data.customer ? `${data.customer.firstName} ${data.customer.lastName}` : '—';
  const sd = new Date(data.startDate).toLocaleDateString('de-DE');
  const ed = new Date(data.endDate).toLocaleDateString('de-DE');

  const canCheckIn = data.status === 'Confirmed' || data.status === 'Pending';
  const canCheckOut = data.status === 'Active';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: data.contractNumber || `#${data.id}`,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <RNView style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.carTitle, { color: colors.text }]}>{carLabel}</Text>
            <Text style={[styles.carPlate, { color: colors.tabIconDefault }]}>{data.car?.plate || ''}</Text>
            <RNView style={[styles.statusPill, { backgroundColor: statusColor(data.status) + '22', alignSelf: 'flex-start', marginTop: 8 }]}>
              <RNView style={[styles.statusDot, { backgroundColor: statusColor(data.status) }]} />
              <Text style={[styles.statusText, { color: statusColor(data.status) }]}>{data.status}</Text>
            </RNView>
            {data.isOverdue && (
              <Text style={styles.overdue}>⚠ Überfällig</Text>
            )}
          </RNView>

          <Section title="Kunde" colors={colors}>
            <InfoRow colors={colors} icon="person" label="Name" value={fullName} />
            <InfoRow
              colors={colors}
              icon="mail"
              label="E-Mail"
              value={data.customer?.email || '—'}
              onPress={() => data.customer?.email && Linking.openURL(`mailto:${data.customer.email}`)}
            />
            <InfoRow
              colors={colors}
              icon="call"
              label="Telefon"
              value={data.customer?.phone || '—'}
              onPress={() => data.customer?.phone && Linking.openURL(`tel:${data.customer.phone}`)}
            />
            {data.customer?.licenseNumber && (
              <InfoRow colors={colors} icon="card" label="Führerschein" value={data.customer.licenseNumber} />
            )}
          </Section>

          <Section title="Zeitraum" colors={colors}>
            <InfoRow colors={colors} icon="calendar" label="Von" value={sd} />
            <InfoRow colors={colors} icon="calendar-outline" label="Bis" value={ed} />
            <InfoRow colors={colors} icon="time" label="Tage" value={String(data.totalDays)} />
            {data.actualReturnDate && (
              <InfoRow
                colors={colors}
                icon="checkmark-done"
                label="Tatsächl. Rückgabe"
                value={new Date(data.actualReturnDate).toLocaleDateString('de-DE')}
              />
            )}
          </Section>

          <Section title="Standort" colors={colors}>
            <InfoRow colors={colors} icon="navigate" label="Abholung" value={data.pickupLocation || '—'} />
            <InfoRow colors={colors} icon="flag" label="Rückgabe" value={data.returnLocation || '—'} />
          </Section>

          <Section title="Kilometerstand" colors={colors}>
            <InfoRow
              colors={colors}
              icon="speedometer"
              label="Abholung"
              value={data.pickupMileage != null ? `${data.pickupMileage.toLocaleString('de-DE')} km` : '—'}
            />
            <InfoRow
              colors={colors}
              icon="speedometer-outline"
              label="Rückgabe"
              value={data.returnMileage != null ? `${data.returnMileage.toLocaleString('de-DE')} km` : '—'}
            />
          </Section>

          <Section title="Zahlung" colors={colors}>
            <InfoRow colors={colors} icon="cash" label="Tagessatz" value={`${Number(data.dailyRate).toLocaleString('de-DE')} €`} />
            <InfoRow
              colors={colors}
              icon="receipt"
              label="Gesamt"
              value={`${Number(data.totalAmount).toLocaleString('de-DE')} €`}
            />
            <InfoRow colors={colors} icon="wallet" label="Status" value={data.paymentStatus} />
          </Section>

          {data.notes ? (
            <Section title="Notizen" colors={colors}>
              <Text style={{ color: colors.text, padding: 12, lineHeight: 20 }}>{data.notes}</Text>
            </Section>
          ) : null}

          {(canCheckIn || canCheckOut) && (
            <RNView style={{ marginTop: 20, gap: 10 }}>
              {canCheckIn && (
                <TouchableOpacity
                  onPress={() => { setSheet('checkin'); setMileage(''); setNotes(''); setFuel('Voll'); }}
                  style={[styles.primaryBtn, { backgroundColor: '#10b981' }]}
                >
                  <Ionicons name="log-in" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Check-in / Fahrzeug übergeben</Text>
                </TouchableOpacity>
              )}
              {canCheckOut && (
                <TouchableOpacity
                  onPress={() => { setSheet('checkout'); setMileage(''); setDamage(''); setExtra(''); setFuel('Voll'); }}
                  style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
                >
                  <Ionicons name="log-out" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Check-out / Fahrzeug zurücknehmen</Text>
                </TouchableOpacity>
              )}
            </RNView>
          )}
        </ScrollView>

        {sheet && (
          <RNView style={styles.backdrop}>
            <RNView style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <RNView style={styles.sheetHead}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  {sheet === 'checkin' ? 'Check-in' : 'Check-out'}
                </Text>
                <TouchableOpacity onPress={() => setSheet(null)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </RNView>

              <Text style={[styles.lbl, { color: colors.tabIconDefault }]}>Kilometerstand</Text>
              <TextInput
                value={mileage}
                onChangeText={setMileage}
                keyboardType="numeric"
                placeholder="z.B. 45000"
                placeholderTextColor={colors.tabIconDefault}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              />

              <Text style={[styles.lbl, { color: colors.tabIconDefault }]}>Tankfüllung</Text>
              <RNView style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {['Voll', '3/4', '1/2', '1/4', 'Leer'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFuel(f)}
                    style={[
                      styles.fuelChip,
                      { borderColor: colors.border },
                      fuel === f && { backgroundColor: colors.tint, borderColor: colors.tint },
                    ]}
                  >
                    <Text style={{ color: fuel === f ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </RNView>

              {sheet === 'checkin' ? (
                <>
                  <Text style={[styles.lbl, { color: colors.tabIconDefault }]}>Notizen</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Zustand, Hinweise…"
                    placeholderTextColor={colors.tabIconDefault}
                    style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.lbl, { color: colors.tabIconDefault }]}>Schadensbericht</Text>
                  <TextInput
                    value={damage}
                    onChangeText={setDamage}
                    multiline
                    placeholder="Falls vorhanden…"
                    placeholderTextColor={colors.tabIconDefault}
                    style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                  />
                  <Text style={[styles.lbl, { color: colors.tabIconDefault }]}>Zusatzkosten (€)</Text>
                  <TextInput
                    value={extra}
                    onChangeText={setExtra}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.tabIconDefault}
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                  />
                </>
              )}

              <TouchableOpacity
                onPress={sheet === 'checkin' ? submitCheckIn : submitCheckOut}
                disabled={submitting}
                style={[styles.primaryBtn, { backgroundColor: colors.tint, marginTop: 16, opacity: submitting ? 0.7 : 1 }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Bestätigen</Text>
                )}
              </TouchableOpacity>
            </RNView>
          </RNView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <RNView style={{ marginTop: 18 }}>
      <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>{title}</Text>
      <RNView style={[styles.sectionBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </RNView>
    </RNView>
  );
}

function InfoRow({
  colors,
  icon,
  label,
  value,
  onPress,
}: {
  colors: any;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const body = (
    <RNView style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.tabIconDefault} />
      <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
      {onPress ? <Ionicons name="chevron-forward" size={14} color={colors.tabIconDefault} /> : null}
    </RNView>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{body}</TouchableOpacity>
  ) : body;
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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  headerCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  carTitle: { fontSize: 20, fontWeight: 'bold' },
  carPlate: { fontSize: 13, marginTop: 2 },
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
  overdue: { color: '#dc2626', fontWeight: '700', marginTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionBody: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9ca3af55',
  },
  infoLabel: { fontSize: 13, width: 110 },
  infoValue: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 18,
    paddingBottom: 32,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold' },
  lbl: { fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
  },
  multiline: { height: 90, paddingTop: 10, textAlignVertical: 'top' },
  fuelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
});
