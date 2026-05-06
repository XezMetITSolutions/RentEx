
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

type Step = 'WELCOME' | 'MILEAGE' | 'FUEL' | 'DAMAGE_FRONT' | 'DAMAGE_BACK' | 'DAMAGE_LEFT' | 'DAMAGE_RIGHT' | 'SIGNATURE' | 'CONFIRM';

const STEPS: Step[] = ['WELCOME', 'MILEAGE', 'FUEL', 'DAMAGE_FRONT', 'DAMAGE_BACK', 'DAMAGE_LEFT', 'DAMAGE_RIGHT', 'SIGNATURE', 'CONFIRM'];

import SignaturePad from '@/components/SignaturePad';
import DamageSelector, { Damage } from '@/components/DamageSelector';

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('WELCOME');
  const [submitting, setSubmitting] = useState(false);
  const [recognizing, setRecognizing] = useState(false);

  // Form State
  const [mileage, setMileage] = useState('');
  const [mileagePhoto, setMileagePhoto] = useState<string | null>(null);
  const [fuelLevel, setFuelLevel] = useState('Full');
  const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [viewImages, setViewImages] = useState<Record<string, string>>({});

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
      
      // Load car template images
      if (data.car?.checkInTemplate) {
        // We'll simulate fetching template images or use the car image as fallback
        // In a real app, you'd fetch this from the API
        setViewImages({
          front: `https://rent-ex.vercel.app/api/check-in-images/${data.car.checkInTemplate}/front.png`,
          back: `https://rent-ex.vercel.app/api/check-in-images/${data.car.checkInTemplate}/back.png`,
          left: `https://rent-ex.vercel.app/api/check-in-images/${data.car.checkInTemplate}/left.png`,
          right: `https://rent-ex.vercel.app/api/check-in-images/${data.car.checkInTemplate}/right.png`,
        });
      }
    } catch (err) {
      Alert.alert('Fehler', 'Buchung konnte nicht geladen werden.');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function simulateOCR(uri: string) {
    setRecognizing(true);
    // Simulate API call for OCR
    setTimeout(() => {
      // Just keep current mileage or randomly increment slightly for "realism"
      setRecognizing(false);
    }, 1500);
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
      if (target === 'mileage') {
        setMileagePhoto(uri);
        simulateOCR(uri);
      }
      else if (target === 'fuel') setFuelPhoto(uri);
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
    if (!signature) {
      Alert.alert('Hinweis', 'Bitte unterschreiben Sie das Protokoll.');
      return;
    }
    if (!agbAccepted) {
      Alert.alert('Hinweis', 'Bitte akzeptieren Sie die Bedingungen.');
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, photos would be uploaded to S3/Cloudinary first.
      
      const payload = {
          mileage: Number(mileage),
          fuelLevel,
          signature,
          damages: damages.map(d => ({
              type: d.reason,
              description: d.location,
              photoUrl: d.photoUrl,
              locationOnCar: d.side,
              xPosition: d.x,
              yPosition: d.y
          }))
      };

      // Call the API
      await api.post(`/api/mobile/bookings/${id}/checkin`, payload);

      Alert.alert('Erfolg', 'Check-in erfolgreich abgeschlossen! Gute Fahrt.', [
        { text: 'OK', onPress: () => router.replace(`/booking/${id}`) }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Fehler', 'Check-in fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  }

  const nextStep = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const prevStep = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.tint} /></View>;
  if (!booking) return <View style={styles.center}><Text>Buchung nicht gefunden.</Text></View>;

  const car = booking.car;
  const progress = ((STEPS.indexOf(step)) / (STEPS.length - 1)) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Self Check-in</Text>
          <Text style={styles.stepIndicator}>Schritt {STEPS.indexOf(step) + 1} von {STEPS.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.tint }]} />
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
            <Text style={styles.description}>Fotografieren Sie das Dashboard und bestätigen Sie den Wert.</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={mileage}
                onChangeText={setMileage}
                keyboardType="numeric"
                placeholder="00000"
              />
              {recognizing && (
                <View style={styles.ocrLoader}>
                  <ActivityIndicator size="small" color={colors.tint} />
                  <Text style={styles.ocrText}>Lese...</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.photoBtn, mileagePhoto && { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }]} 
              onPress={() => takePhoto('mileage')}
            >
              {mileagePhoto ? (
                <Image source={{ uri: mileagePhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontWeight: 'bold' }}>DASHBOARD FOTO</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={!mileage || !mileagePhoto || recognizing}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: (!mileage || !mileagePhoto || recognizing) ? 0.5 : 1 }]} 
              onPress={nextStep}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'FUEL' && (
          <View style={styles.stepContainer}>
            <Ionicons name="water-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>Tankfüllung</Text>
            <Text style={styles.description}>Wählen Sie den Füllstand und machen Sie ein Foto der Anzeige.</Text>
            
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
                  <Text style={[styles.fuelChipText, fuelLevel === level && { color: '#fff' }]}>{level === 'Full' ? 'VOLL' : level === 'Empty' ? 'LEER' : level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.photoBtn, fuelPhoto && { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }]} 
              onPress={() => takePhoto('fuel')}
            >
              {fuelPhoto ? (
                <Image source={{ uri: fuelPhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontWeight: 'bold' }}>TANKANZEIGE FOTO</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={!fuelPhoto}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: !fuelPhoto ? 0.5 : 1 }]} 
              onPress={nextStep}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step.startsWith('DAMAGE_') && (
          <View style={styles.stepContainer}>
            <Ionicons name="car-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>
              {step === 'DAMAGE_FRONT' ? 'Vorne' : step === 'DAMAGE_BACK' ? 'Hinten' : step === 'DAMAGE_LEFT' ? 'Links' : 'Rechts'}
            </Text>
            <Text style={styles.description}>Markieren Sie eventuelle Schäden auf dem Bild.</Text>
            
            <DamageSelector 
              viewImages={viewImages}
              damages={damages}
              activeSide={step.replace('DAMAGE_', '').toLowerCase() as any}
              onAddDamage={(d) => setDamages([...damages, d])}
              onRemoveDamage={(id) => setDamages(damages.filter(d => d.id !== id))}
            />

            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: colors.text, marginTop: 30 }]} 
              onPress={nextStep}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>NÄCHSTE SEITE</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'SIGNATURE' && (
          <View style={styles.stepContainer}>
            <Ionicons name="create-outline" size={48} color={colors.tint} />
            <Text style={styles.title}>Unterschrift</Text>
            <Text style={styles.description}>Bitte unterschreiben Sie das Protokoll auf dem Display.</Text>
            
            <View style={styles.signatureBox}>
              <SignaturePad 
                onSave={setSignature} 
                onClear={() => setSignature(null)} 
              />
            </View>

            <TouchableOpacity 
              disabled={!signature}
              style={[styles.mainBtn, { backgroundColor: colors.text, opacity: !signature ? 0.5 : 1, marginTop: 20 }]} 
              onPress={nextStep}
            >
              <Text style={[styles.mainBtnText, { color: colors.background }]}>WEITER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'CONFIRM' && (
          <View style={styles.stepContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
            <Text style={styles.title}>Zusammenfassung</Text>
            <Text style={styles.description}>Prüfen Sie Ihre Angaben ein letztes Mal.</Text>
            
            <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>KM-Stand:</Text>
                <Text style={styles.summaryValue}>{mileage} km</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tankfüllung:</Text>
                <Text style={styles.summaryValue}>{fuelLevel}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gemeldete Schäden:</Text>
                <Text style={styles.summaryValue}>{damages.length}</Text>
              </View>
              {signature && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unterschrift:</Text>
                  <Text style={[styles.summaryValue, { color: '#22c55e' }]}>Vorhanden</Text>
                </View>
              )}
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
                Ich bestätige die Richtigkeit der Angaben und akzeptiere die Mietbedingungen.
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
                <Text style={[styles.mainBtnText, { color: '#fff' }]}>JETZT ABSCHLIESSEN</Text>
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
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { fontSize: 10, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
  progressBarContainer: { height: 4, width: '100%', backgroundColor: '#eee' },
  progressBar: { height: '100%' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  stepContainer: { alignItems: 'center', width: '100%', paddingTop: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  heroContainer: { width: '100%', height: 200, marginBottom: 20, position: 'relative' },
  carHero: { width: '100%', height: '100%', borderRadius: 24 },
  plateBadge: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    backgroundColor: '#fff', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee'
  },
  plateText: { fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },

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

  description: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20, paddingHorizontal: 20 },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 14, fontWeight: '500' },
  inputWrapper: { width: '100%', position: 'relative' },
  ocrLoader: { position: 'absolute', right: 20, top: 15, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', padding: 5, borderRadius: 8 },
  ocrText: { fontSize: 10, color: '#2563eb', fontWeight: 'bold' },
  mainBtn: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
  signatureBox: { width: '100%', marginTop: 10 },
  summaryBox: { width: '100%', padding: 20, borderRadius: 20, marginTop: 10, gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, paddingHorizontal: 10 },
  checkboxText: { flex: 1, fontSize: 13, color: '#666' },
});
