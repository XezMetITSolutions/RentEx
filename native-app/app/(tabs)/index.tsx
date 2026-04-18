import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Car } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'Alle', name: 'Alle', icon: 'apps' },
  { id: 'Kompakt', name: 'Kompakt', icon: 'car' },
  { id: 'Mittelklasse', name: 'Mittelklasse', icon: 'car-sport' },
  { id: 'SUV', name: 'SUV', icon: 'trail-sign' },
  { id: 'Premium', name: 'Premium', icon: 'diamond' },
  { id: 'Transporter', name: 'Transporter', icon: 'bus' },
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

  const [startDate, setStartDate] = useState<string>('Morgen');
  const [endDate, setEndDate] = useState<string>('In 3 Tagen');
  const [seats, setSeats] = useState<number>(1);

  const filteredCars = useMemo(() => {
    let result = cars;
    // Category filter
    if (category !== 'Alle') {
      result = result.filter(c => c.category === category);
    }
    // Capacity filter
    if (seats > 1) {
      result = result.filter(c => (c.seats || 5) >= seats);
    }
    // Text search (still useful for brand)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cars, category, seats, search]);

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
          <Image source={{ uri: car.imageUrl }} style={styles.carImage} resizeMode="cover" />
        ) : (
          <View style={[styles.carImage, { backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="car-outline" size={48} color={colors.textFaint} />
          </View>
        )}
        <View style={[styles.carTag, { backgroundColor: colors.tint }]}>
          <Text style={[styles.carTagText, { color: colors.accentInk }]}>{car.seats || 5} SITZE</Text>
        </View>
      </View>
      <View style={styles.carInfo}>
        <Text style={[styles.carModel, { color: colors.text }]}>{car.brand} {car.model}</Text>
        <Text style={[styles.carTrim, { color: colors.textMuted }]}>
          {car.category} · {car.fuelType} · {car.transmission}
        </Text>
        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(car.dailyRate)}</Text>
            <Text style={[styles.priceUnit, { color: colors.textFaint }]}>/Tag</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.tint} />
            <Text style={[styles.ratingText, { color: colors.textMuted }]}>4.8</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      {/* Greeting Block */}
      <View style={styles.greetingBlock}>
        <Text style={[styles.greetingKicker, { color: colors.textFaint }]}>RUND UM FELDKIRCH</Text>
        <Text style={[styles.greetingName, { color: colors.text }]}>
          Auto finden.
        </Text>
      </View>

      {/* Modern Reservation Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.bookingBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.datePickerTrigger}>
            <Ionicons name="calendar-outline" size={18} color={colors.tint} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.searchLabel, { color: colors.textFaint }]}> Zeitraum</Text>
              <Text style={[styles.searchValue, { color: colors.text }]}>{startDate} – {endDate}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity 
            style={styles.personPickerTrigger}
            onPress={() => setSeats(prev => prev === 9 ? 1 : (prev === 1 ? 5 : (prev === 5 ? 7 : 9)))}
          >
            <Ionicons name="people-outline" size={18} color={colors.tint} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.searchLabel, { color: colors.textFaint }]}>Personen</Text>
              <Text style={[styles.searchValue, { color: colors.text }]}>{seats === 1 ? 'Beliebig' : `${seats}+ Plätze`}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.searchGoBtn, { backgroundColor: colors.text }]}>
            <Ionicons name="search" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChips}>
          <TouchableOpacity 
             onPress={() => { setStartDate('Sa.'); setEndDate('So.'); }}
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
          <TouchableOpacity 
             onPress={() => { setCategory('Premium'); }}
             style={[styles.chip, { borderColor: colors.border }]}
          >
            <Text style={[styles.chipText, { color: colors.textMuted }]}>Luxus</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Category Strip */}
      {renderSectionHeader('FAHRZEUGKLASSEN', 'Nach Klasse stöbern')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryStrip} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCategory(c.id)}
            style={[
              styles.categoryCard,
              { backgroundColor: category === c.id ? colors.text : colors.card, borderColor: category === c.id ? colors.text : colors.border }
            ]}
          >
            <Text style={[styles.categoryName, { color: category === c.id ? colors.background : colors.text }]}>{c.name}</Text>
            <Text style={[styles.categoryFrom, { color: category === c.id ? colors.accentSoft : colors.textFaint }]}>ab € 29/Tag</Text>
          </TouchableOpacity>
        ))}
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
      <View style={[styles.rewardsCard, { backgroundColor: colors.text }]}>
        <View style={[styles.accentBar, { backgroundColor: colors.tint }]} />
        <Text style={[styles.rewardsKicker, { color: colors.tint }]}>KM-GUTHABEN</Text>
        <View style={styles.kmValueRow}>
          <Text style={[styles.kmValue, { color: colors.background }]}>1.240</Text>
          <Text style={[styles.kmUnit, { color: colors.background, opacity: 0.55 }]}>km</Text>
        </View>
        <Text style={[styles.rewardsDesc, { color: colors.background, opacity: 0.65 }]}>
          Lade Freunde ein und verdiene 250 km pro Empfehlung.
        </Text>
        <TouchableOpacity style={[styles.rewardBtn, { backgroundColor: colors.tint }]}>
          <Text style={[styles.rewardBtnText, { color: colors.accentInk }]}>Freund einladen</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accentInk} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 10 },
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  goldBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  kmText: {
    fontSize: 11,
    letterSpacing: 0.2,
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
    gap: 16,
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
