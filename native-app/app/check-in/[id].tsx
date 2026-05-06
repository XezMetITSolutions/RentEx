
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Booking } from '@/lib/types';

type Step = 'WELCOME' | 'MILEAGE' | 'FUEL' | 'PHOTOS' | 'CONFIRM';

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('WELCOME');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [mileage, setMileage] = useState('');
  const [mileagePhoto, setMileagePhoto] = useState<string | null>(null);
  const [fuelLevel, setFuelLevel] = useState('Full');
  const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ [key: string]: string | null }>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [agbAccepted, setAgbAccepted] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  async function loadBooking() {
    try {
      const data = await api.getBooking(Number(id));
      setBooking(data);
      if (data.car?.currentMileage) {
        setMileage(data.car.currentMileage.toString());
      }
    } catch (err) {
      Alert.alert('Fehler', 'Buchung konnte nicht geladen werden.');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function takePhoto(target: string) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Kamerazugriff erforderlich.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      if (target === 'mileage') setMileagePhoto(uri);
      else if (target === 'fuel') setFuelPhoto(uri);
      else setPhotos(prev => ({ ...prev, [target]: uri }));
    }
  }

  const openMaps = () => {
    if (!booking?.pickupLocation) return;
    const { address, city, name } = booking.pickupLocation;
    const query = encodeURIComponent(`${address || ''} ${city || ''} ${name || ''}`.trim());
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Fehler', 'Google Maps konnte nicht geöffnet werden.');
      });
    }
  };

  async function handleSubmit() {
    if (!agbAccepted) {
      Alert.alert('Hinweis', 'Bitte akzeptieren Sie die Bedingungen.');
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, we would upload photos to a server first.
      // For this demo/setup, we'll simulate it or use the api if it supports base64/uri.
      
      // Construct the damages/photos payload similar to admin check-in
      const damages = [];
      if (mileagePhoto) damages.push({ type: 'PROOF_MILEAGE', description: `KM: ${mileage}`, photoUrl: mileagePhoto, locationOnCar: 'interior' });
      if (fuelPhoto) damages.push({ type: 'PROOF_FUEL', description: `Fuel: ${fuelLevel}`, photoUrl: fuelPhoto, locationOnCar: 'interior' });
      
      Object.entries(photos).forEach(([side, uri]) => {
        if (uri) {
          damages.push({ type: 'CHECKIN_PHOTO', description: `Photo ${side}`, photoUrl: uri, locationOnCar: side });
        }
      });

      // Using the admin check-in API for now or a similar customer one if available
      // Note: customers might need a specific endpoint, but let's try the existing one logic
      await api.reportDamage(Number(id), {
          description: `Self Check-in completed. Mileage: ${mileage}, Fuel: ${fuelLevel}`,
          type: 'Check-in',
      });

      Alert.alert('Erfolg', 'Check-in erfolgreich abgeschlossen! Gute Fahrt.', [
        { text: 'OK', onPress: () => router.replace(`/booking/${id}`) }
      ]);
    } catch (err) {
      Alert.alert('Fehler', 'Check-in fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.tint} /></View>;
  if (!booking) return <View style={styles.center}><Text>Buchung nicht gefunden.</Text></View>;

  const car = booking.car;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Self Check-in</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'WELCOME' && (
          <View style={styles.stepContainer}>
            <View style={styles.heroContainer}>
              <Image source={{ uri: car?.imageUrl || '' }} style={styles.carHero} />
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{car?.plate || car?.licensePlate || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.contentCard}>
              <Text style={[styles.title, { color: colors.text }]}>{car?.brand} {car?.model}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Fahrzeug zur Abholung bereit
              </Text>

              {booking?.pickupLocation && (
                <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.locationInfo}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
                      <Ionicons name="location" size={20} color={colors.tint} />
                    </View>
                    <View style={styles.locationTexts}>
                      <Text style={[styles.locationLabel, { color: colors.textFaint }]}>ABHOLORT</Text>
                      <Text style={[styles.locationName, { color: colors.text }]}>{booking.pickupLocation.name}</Text>
                      <Text style={[styles.locationAddress, { color: colors.textMuted }]}>
                        {booking.pickupLocation.address}, {booking.pickupLocation.city}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.navBtn, { borderColor: colors.tint }]} 
                    onPress={openMaps}
                  >
                    <Ionicons name="navigate" size={18} color={colors.tint} />
                    <Text style={[styles.navBtnText, { color: colors.tint }]}>NAVIGATION</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.infoBox, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
                <Text style={[styles.infoText, { color: colors.tint }]}>
                  Bitte führen Sie den Self Check-in direkt am Fahrzeug durch, um den aktuellen Zustand zu dokumentieren.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: colors.text }]} 
                onPress={() => setStep('MILEAGE')}
              >
                <Text style={[styles.mainBtnText, { color: colors.background }]}>JETZT STARTEN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'MILEAGE' && (
          <View style={styles.stepContainer}>
            <Ionicons name="speedometer-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>Kilometerstand</Text>
            <Text style={styles.label}>Aktueller Stand (km)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
              placeholder="z.B. 12450"
              placeholderTextColor={colors.tabIconDefault}
            />
            <TouchableOpacity 
              style={[styles.photoBtn, { borderColor: colors.tint }]} 
              onPress={() => takePhoto('mileage')}
            >
              {mileagePhoto ? (
                <Image source={{ uri: mileagePhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontWeight: 'bold' }}>FOTO VOM DASHBOARD</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={!mileage || !mileagePhoto}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: (!mileage || !mileagePhoto) ? 0.5 : 1 }]} 
              onPress={() => setStep('FUEL')}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'FUEL' && (
          <View style={styles.stepContainer}>
            <Ionicons name="water-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>Tankfüllung</Text>
            <View style={styles.fuelGrid}>
              {['Full', '3/4', '1/2', '1/4', 'Empty'].map(level => (
                <TouchableOpacity 
                  key={level} 
                  onPress={() => setFuelLevel(level)}
                  style={[
                    styles.fuelChip, 
                    { borderColor: colors.border },
                    fuelLevel === level && { backgroundColor: colors.tint, borderColor: colors.tint }
                  ]}
                >
                  <Text style={[styles.fuelChipText, fuelLevel === level && { color: '#fff' }]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.photoBtn, { borderColor: colors.tint }]} 
              onPress={() => takePhoto('fuel')}
            >
              {fuelPhoto ? (
                <Image source={{ uri: fuelPhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontWeight: 'bold' }}>FOTO TANKANZEIGE</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={!fuelPhoto}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: !fuelPhoto ? 0.5 : 1 }]} 
              onPress={() => setStep('PHOTOS')}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'PHOTOS' && (
          <View style={styles.stepContainer}>
            <Ionicons name="camera-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>Fahrzeug-Fotos</Text>
            <Text style={styles.description}>Bitte fotografieren Sie das Fahrzeug von allen vier Seiten.</Text>
            
            <View style={styles.photoGrid}>
              {['front', 'back', 'left', 'right'].map(side => (
                <TouchableOpacity 
                  key={side} 
                  style={[styles.gridPhotoBtn, { borderColor: colors.border }]} 
                  onPress={() => takePhoto(side)}
                >
                  {photos[side] ? (
                    <Image source={{ uri: photos[side]! }} style={styles.gridPhoto} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={20} color={colors.tabIconDefault} />
                      <Text style={styles.gridPhotoLabel}>{side.toUpperCase()}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              disabled={!photos.front || !photos.back || !photos.left || !photos.right}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: (!photos.front || !photos.back || !photos.left || !photos.right) ? 0.5 : 1 }]} 
              onPress={() => setStep('CONFIRM')}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'CONFIRM' && (
          <View style={styles.stepContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
            <Text style={styles.title}>Abschließen</Text>
            <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
              <Text style={styles.summaryTitle}>Zusammenfassung</Text>
              <Text style={styles.summaryItem}>KM: {mileage} km</Text>
              <Text style={styles.summaryItem}>Tank: {fuelLevel}</Text>
              <Text style={styles.summaryItem}>Fotos: 4/4 vorhanden</Text>
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
                Ich bestätige den Fahrzeugzustand und akzeptiere die AGB.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              disabled={submitting || !agbAccepted}
              style={[styles.mainBtn, { backgroundColor: colors.tint, opacity: (submitting || !agbAccepted) ? 0.5 : 1 }]} 
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.mainBtnText, { color: '#fff' }]}>CHECK-IN ABSCHLIESSEN</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: { p: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  stepContainer: { alignItems: 'center', width: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  heroContainer: { width: '100%', height: 220, marginBottom: 20, position: 'relative' },
  carHero: { width: '100%', height: '100%', borderRadius: 24 },
  plateBadge: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    backgroundColor: '#fff', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee'
  },
  plateText: { fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

  contentCard: { width: '100%' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'left', marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'left' },
  
  locationCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  locationInfo: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  locationTexts: { flex: 1 },
  locationLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  locationName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  locationAddress: { fontSize: 14 },
  
  navBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1.5 
  },
  navBtnText: { fontSize: 13, fontWeight: 'bold' },

  description: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 14, fontWeight: '500' },
  mainBtn: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mainBtnText: { fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: 8, marginTop: 20 },
  input: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  photoBtn: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  fuelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, justifyContent: 'center' },
  fuelChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  fuelChipText: { fontWeight: 'bold' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20, justifyContent: 'center' },
  gridPhotoBtn: { width: '47%', height: 120, borderWidth: 1.5, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden' },
  gridPhoto: { width: '100%', height: '100%' },
  gridPhotoLabel: { fontSize: 10, fontWeight: 'bold', color: '#888' },
  summaryBox: { width: '100%', padding: 20, borderRadius: 20, marginTop: 20 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  summaryItem: { fontSize: 14, marginBottom: 4, color: '#666' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 30, paddingHorizontal: 10 },
  checkboxText: { flex: 1, fontSize: 13, color: '#666' },
});
