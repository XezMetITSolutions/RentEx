import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
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

const CATEGORIES = [
  { id: 'Alle', name: 'Alle', icon: 'apps' },
  { id: 'Elektro', name: 'Elektro', icon: 'flash' },
  { id: 'SUV', name: 'SUV', icon: 'car' },
  { id: 'Sportwagen', name: 'Sportwagen', icon: 'flame' },
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
        category,
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
    if (!search.trim()) return cars;
    const q = search.toLowerCase().trim();
    return cars.filter(
      (c) =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        (c.category ?? '').toLowerCase().includes(q)
    );
  }, [cars, search]);

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[number] }) => {
    const active = category === item.id;
    return (
      <TouchableOpacity
        onPress={() => setCategory(item.id)}
        style={[
          styles.categoryCard,
          {
            backgroundColor: active ? colors.tint : colors.card,
            borderColor: active ? colors.tint : colors.border,
          },
        ]}
      >
        <Ionicons name={item.icon as any} size={18} color={active ? '#fff' : colors.tint} />
        <Text style={[styles.categoryName, { color: active ? '#fff' : colors.text }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCar = (car: Car) => (
    <TouchableOpacity
      key={car.id}
      style={[styles.carCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/car/${car.id}`)}
    >
      {car.imageUrl ? (
        <Image source={{ uri: car.imageUrl }} style={styles.carImage} resizeMode="cover" />
      ) : (
        <View style={[styles.carImage, styles.carImagePlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="car" size={60} color={colors.tabIconDefault} />
        </View>
      )}
      <View style={styles.carInfo}>
        <View style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.carName}>
            {car.brand} {car.model}
          </Text>
          <View style={styles.specRow}>
            {!!car.category && (
              <View style={[styles.specTag, { backgroundColor: colors.background }]}>
                <Text style={[styles.specText, { color: colors.tabIconDefault }]}>{car.category}</Text>
              </View>
            )}
            {!!car.fuelType && (
              <View style={[styles.specTag, { backgroundColor: colors.background }]}>
                <Ionicons name="water-outline" size={11} color={colors.tabIconDefault} />
                <Text style={[styles.specText, { color: colors.tabIconDefault }]}>{car.fuelType}</Text>
              </View>
            )}
            {!!car.transmission && (
              <View style={[styles.specTag, { backgroundColor: colors.background }]}>
                <Ionicons name="cog-outline" size={11} color={colors.tabIconDefault} />
                <Text style={[styles.specText, { color: colors.tabIconDefault }]}>{car.transmission}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.tint }]}>
            {formatCurrency(car.dailyRate)}
            <Text style={styles.perDay}>/Tag</Text>
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>4.9</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      {user && (
        <View style={styles.greeting}>
          <Text style={[styles.greetingHi, { color: colors.tabIconDefault }]}>Hallo,</Text>
          <Text style={styles.greetingName}>{user.firstName} 👋</Text>
        </View>
      )}

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} style={{ marginLeft: 15 }} />
          <TextInput
            placeholder="Marke, Modell oder Kategorie…"
            placeholderTextColor={colors.tabIconDefault}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.tint }]} onPress={load}>
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategorien</Text>
      </View>
      <FlatList
        data={CATEGORIES as unknown as (typeof CATEGORIES)[number][]}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {search ? 'Suchergebnisse' : category === 'Alle' ? 'Empfohlen' : category}
        </Text>
        <Text style={[styles.resultCount, { color: colors.tabIconDefault }]}>
          {filteredCars.length} Fahrzeuge
        </Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#fee2e2', marginHorizontal: 20 }]}>
          <Ionicons name="warning" size={16} color="#991b1b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.carsGrid}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : filteredCars.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="car-outline" size={48} color={colors.tabIconDefault} />
            <Text style={{ color: colors.tabIconDefault, marginTop: 10 }}>Keine Fahrzeuge gefunden</Text>
          </View>
        ) : (
          filteredCars.map(renderCar)
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  greetingHi: { fontSize: 14 },
  greetingName: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  searchSection: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    height: 55,
  },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16 },
  filterBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  resultCount: { fontSize: 13 },
  categoriesList: { paddingLeft: 20, paddingBottom: 10 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryName: { marginLeft: 8, fontWeight: '500', fontSize: 13 },
  carsGrid: { paddingHorizontal: 20 },
  carCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  carImage: { width: '100%', height: 200 },
  carImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  carInfo: { padding: 15, backgroundColor: 'transparent' },
  carName: { fontSize: 18, fontWeight: 'bold' },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specText: { fontSize: 11 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  price: { fontSize: 20, fontWeight: 'bold' },
  perDay: { fontSize: 14, fontWeight: 'normal', color: '#94a3b8' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rating: { marginLeft: 4, fontWeight: 'bold' },
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
