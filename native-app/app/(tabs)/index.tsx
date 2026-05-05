import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Car } from '@/lib/types';
import { formatCurrency, resolveImageUrl } from '@/lib/format';
import { useAuth } from '@/lib/auth';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'Alle', name: 'Alle', icon: 'apps' },
  { id: 'PKW', name: 'PKW', icon: 'car' },
  { id: 'Kastenwagen', name: 'Kastenwagen', icon: 'bus' },
  { id: 'Bus', name: 'Bus', icon: 'people' },
] as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAuth();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('Alle');
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('Sa., 22. Apr.');
  const [endDate, setEndDate] = useState<string>('So., 23. Apr.');
  const [seats, setSeats] = useState<number>(1);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listCars({
        category: category === 'Alle' ? undefined : category,
        search: search.trim() || undefined,
      });
      setCars(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const filteredCars = useMemo(() => {
    let result = cars;
    if (category !== 'Alle') result = result.filter(c => c.category === category);
    if (seats > 1) result = result.filter(c => (c.seats || 5) >= seats);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q));
    }
    return result;
  }, [cars, category, seats, search]);

  const categoryPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    cars.forEach(c => {
      if (!c.category) return;
      const rate = typeof c.dailyRate === 'string' ? parseFloat(c.dailyRate) : c.dailyRate;
      if (!prices[c.category] || rate < prices[c.category]) {
        prices[c.category] = rate;
      }
    });
    return prices;
  }, [cars]);

  const renderSectionHeader = (kicker: string, title: string, action?: string) => (
    <View style={styles.sectionHead}>
      <Text style={[styles.kicker, { color: colors.tint }]}>{kicker}</Text>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {action && <Text style={[styles.actionText, { color: colors.textMuted }]}>{action}</Text>}
      </View>
    </View>
  );

  const renderCarCard = (car: Car) => (
    <TouchableOpacity
      key={car.id}
      style={[styles.carCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/car/${car.id}`)}
    >
      <View style={styles.carImageContainer}>
        {car.imageUrl ? (
          <Image source={{ uri: resolveImageUrl(car.imageUrl) }} style={styles.carImage} resizeMode="cover" />
        ) : (
          <View style={[styles.carImage, { backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="car-outline" size={48} color={colors.textFaint} />
          </View>
        )}
        <View style={[styles.carTag, { backgroundColor: colors.background, opacity: 0.9 }]}>
          <Text style={[styles.carTagText, { color: colors.text }]}>{car.category?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.carInfo}>
        <View style={styles.carHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.carModel, { color: colors.text }]}>{car.brand} {car.model}</Text>
            <Text style={[styles.carTrim, { color: colors.textMuted }]}>
              {car.fuelType} · {car.transmission}
            </Text>
          </View>
          <View style={styles.ratingRowSmall}>
            <Ionicons name="star" size={12} color={colors.tint} />
            <Text style={[styles.ratingTextSmall, { color: colors.textMuted }]}>
              {car.rating ? `${car.rating} (${car.reviewCount})` : 'Neu'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(car.dailyRate)}</Text>
            <Text style={[styles.priceUnit, { color: colors.textFaint }]}>/Tag</Text>
          </View>
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
               <Ionicons name="people-outline" size={14} color={colors.textFaint} />
               <Text style={[styles.featureText, { color: colors.textFaint }]}>{car.seats}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Logo */}
        <View style={styles.headerRow}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={[styles.profileBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="person" size={18} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting Block */}
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingName, { color: colors.text }]}>Auto finden.</Text>
        </View>

        {/* Interaktif Booking Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.bookingBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.datePickerTrigger}
              onPress={() => setSearchModalVisible(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.tint} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.searchLabel, { color: colors.textFaint }]}> Zeitraum</Text>
                <Text style={[styles.searchValue, { color: colors.text }]}>{startDate.split(',')[0]} – {endDate.split(',')[0]}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.personPickerTrigger}
              onPress={() => setSearchModalVisible(true)}
            >
              <Ionicons name="people-outline" size={18} color={colors.tint} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.searchLabel, { color: colors.textFaint }]}>Personen</Text>
                <Text style={[styles.searchValue, { color: colors.text }]}>{seats === 1 ? 'Beliebig' : `${seats}+`}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.searchGoBtn, { backgroundColor: colors.text }]}
              onPress={() => setSearchModalVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChips}>
            <TouchableOpacity 
               onPress={() => { setStartDate('Sa. 22'); setEndDate('So. 23'); }}
               style={[styles.chip, { borderColor: colors.border }]}
            >
              <Text style={[styles.chipText, { color: colors.textMuted }]}>Wochenende</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               onPress={() => { setSeats(9); setCategory('Transporter'); }}
               style={[styles.chip, { borderColor: colors.border }]}
            >
              <Text style={[styles.chipText, { color: colors.textMuted }]}>9-Sitzer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Category Strip */}
        <View style={{ marginBottom: 8 }}>
          {renderSectionHeader('FAHRZEUGKLASSEN', 'Nach Klasse stöbern')}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryStrip} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {CATEGORIES.map(c => {
            const minPrice = categoryPrices[c.id];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category === c.id ? colors.text : colors.card, borderColor: category === c.id ? colors.text : colors.border }
                ]}
              >
                <Text style={[styles.categoryName, { color: category === c.id ? colors.background : colors.text }]}>{c.name}</Text>
                <Text style={[styles.categoryFrom, { color: category === c.id ? colors.tint : colors.textFaint }]}>
                  {minPrice ? `ab ${formatCurrency(minPrice)}` : 'auf Anfrage'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Fleet Grid */}
        <View style={styles.fleetSection}>
          {renderSectionHeader('FÜR DICH AUSGEWÄHLT', 'Beliebte Fahrzeuge', 'Alle →')}
          {loading ? (
            <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.carList}>
              {filteredCars.map(renderCarCard)}
            </View>
          )}
        </View>

        {/* Rewards Card */}
        <View style={[styles.rewardsCard, { backgroundColor: colorScheme === 'dark' ? '#111' : '#1a1a1a' }]}>
          <View style={[styles.accentBar, { backgroundColor: colors.tint }]} />
          
          {/* Decorative Icon */}
          <View style={styles.rewardsIconWrapper}>
             <Ionicons name="gift-outline" size={64} color="rgba(255,255,255,0.05)" />
          </View>
          
          <View style={styles.rewardsHeader}>
            <Ionicons name="star" size={14} color={colors.tint} />
            <Text style={[styles.rewardsKicker, { color: colors.tint, marginBottom: 0, marginLeft: 6 }]}>KM-GUTHABEN</Text>
          </View>

          <View style={styles.kmValueRow}>
            <Text style={[styles.kmValue, { color: '#fff' }]}>1.240</Text>
            <Text style={[styles.kmUnit, { color: '#fff', opacity: 0.7 }]}>km</Text>
          </View>
          <Text style={[styles.rewardsDesc, { color: '#fff', opacity: 0.8 }]}>
            Lade Freunde ein und verdiene 250 km gratis für jede erfolgreiche Empfehlung.
          </Text>
          <TouchableOpacity 
            style={[styles.rewardBtn, { backgroundColor: colors.tint }]}
            onPress={async () => {
              try {
                await Share.share({
                  message: 'Hey! Melde dich bei RentEx an und wir beide bekommen 250 km gratis für unsere nächste Fahrt. Lade die App herunter: https://rentex.app/invite/1240',
                });
              } catch (error) {
                console.error(error);
              }
            }}
          >
            <Text style={[styles.rewardBtnText, { color: colors.accentInk }]}>Jetzt Freunde einladen</Text>
            <Ionicons name="share-social-outline" size={16} color={colors.accentInk} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* SEARCH MODAL / OVERLAY */}
      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Suche anpassen</Text>
              <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textFaint} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Persons Selection */}
              <Text style={[styles.modalSectionLabel, { color: colors.textFaint }]}>WIE VIELE PERSONEN?</Text>
              <View style={styles.personGrid}>
                {[1, 2, 4, 5, 7, 9].map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setSeats(num)}
                    style={[
                      styles.personBtn,
                      { backgroundColor: seats === num ? colors.tint : (colorScheme === 'dark' ? '#222' : '#F2F2F2'), borderColor: seats === num ? colors.tint : colors.border }
                    ]}
                  >
                    <Text style={[styles.personBtnText, { color: seats === num ? colors.accentInk : colors.text }]}>
                      {num === 1 ? 'Egal' : `${num}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 32 }} />

              {/* Date Selection */}
              <Text style={[styles.modalSectionLabel, { color: colors.textFaint }]}>ZEITRAUM WÄHLEN</Text>
              <View style={styles.dateSelectionRow}>
                <View style={[styles.dateBox, { backgroundColor: colorScheme === 'dark' ? '#222' : '#F2F2F2' }]}>
                  <Text style={[styles.dateBoxLabel, { color: colors.textFaint }]}>ABHOLUNG</Text>
                  <Text style={[styles.dateBoxValue, { color: colors.text }]}>{startDate}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textFaint} style={{ marginHorizontal: 10 }} />
                <View style={[styles.dateBox, { backgroundColor: colorScheme === 'dark' ? '#222' : '#F2F2F2' }]}>
                  <Text style={[styles.dateBoxLabel, { color: colors.textFaint }]}>RÜCKGABE</Text>
                  <Text style={[styles.dateBoxValue, { color: colors.text }]}>{endDate}</Text>
                </View>
              </View>

              <View style={{ height: 40 }} />

              <TouchableOpacity 
                style={[styles.applyBtn, { backgroundColor: colors.text }]}
                onPress={() => setSearchModalVisible(false)}
              >
                <Text style={[styles.applyBtnText, { color: colors.background }]}>Suche aktualisieren</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingBlock: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greetingKicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  bookingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    height: 70,
  },
  datePickerTrigger: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  personPickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  vDivider: {
    width: 1,
    height: '60%',
    marginHorizontal: 5,
  },
  searchLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  searchGoBtn: {
    width: 50,
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  quickChips: {
    flexDirection: 'row',
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHead: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryStrip: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  categoryCard: {
    minWidth: 120,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryFrom: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  fleetSection: {
    marginBottom: 32,
  },
  carList: {
    paddingHorizontal: 20,
    gap: 24,
  },
  carCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  carImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  carTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  carInfo: {
    padding: 14,
  },
  carModel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  carTrim: {
    fontSize: 12,
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 11,
    marginLeft: 2,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  carHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
  ratingTextSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    marginTop: 10,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  personGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personBtn: {
    width: (width - 68) / 3,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
  },
  dateBoxLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
  },
  dateBoxValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rewardsCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  rewardsIconWrapper: {
    position: 'absolute',
    right: -10,
    top: -10,
    zIndex: 1,
    transform: [{ rotate: '15deg' }],
  },
  rewardsKicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 10,
  },
  kmValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  kmValue: {
    fontSize: 34,
    fontWeight: '700',
  },
  kmUnit: {
    fontSize: 14,
    fontWeight: '700',
  },
  rewardsDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  rewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rewardBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
