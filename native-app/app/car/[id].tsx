import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';
import type { Car } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

const { width } = Dimensions.get('window');

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carId = Number(id);
    if (!carId) {
      setError('Ungültige Fahrzeug-ID');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await api.getCar(carId);
        setCar(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Laden fehlgeschlagen.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !car) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.tabIconDefault} />
        <Text style={{ marginTop: 12, color: colors.tabIconDefault, textAlign: 'center' }}>
          {error ?? 'Fahrzeug nicht gefunden'}
        </Text>
      </View>
    );
  }

  const spec = (icon: React.ComponentProps<typeof Ionicons>['name'], label: string, value?: string | number | null) => {
    if (!value) return null;
    return (
      <View style={[styles.specCard, { backgroundColor: colors.card }]}>
        <Ionicons name={icon} size={22} color={colors.tint} />
        <Text style={[styles.specLabel, { color: colors.tabIconDefault }]}>{label}</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {car.imageUrl ? (
          <Image source={{ uri: car.imageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="car" size={80} color={colors.tabIconDefault} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.model}>{car.model}</Text>
            </View>
            <View style={styles.ratingBig}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>

          {!!car.category && (
            <View style={[styles.categoryBadge, { backgroundColor: `${colors.tint}22` }]}>
              <Text style={[styles.categoryText, { color: colors.tint }]}>{car.category}</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Spezifikationen</Text>
          <View style={styles.specGrid}>
            {spec('water-outline', 'Kraftstoff', car.fuelType)}
            {spec('cog-outline', 'Getriebe', car.transmission)}
            {spec('people-outline', 'Sitze', car.seats)}
            {spec('calendar-outline', 'Baujahr', car.year)}
          </View>

          {!!car.description && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Beschreibung</Text>
              <Text style={[styles.description, { color: colors.tabIconDefault }]}>{car.description}</Text>
            </>
          )}

          {car.features && car.features.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Ausstattung</Text>
              <View style={styles.featureList}>
                {car.features.map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text style={[styles.priceLabel, { color: colors.tabIconDefault }]}>Tagespreis</Text>
          <Text style={[styles.priceValue, { color: colors.tint }]}>
            {formatCurrency(car.dailyRate)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/booking/new?carId=${car.id}`)}
          style={[styles.bookBtn, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.bookBtnText}>Jetzt buchen</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width, height: 280 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  brand: { fontSize: 14, opacity: 0.6 },
  model: { fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  ratingBig: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    paddingTop: 6,
  },
  ratingText: { fontWeight: 'bold', fontSize: 15 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 12,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  specCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  specLabel: { fontSize: 12, marginTop: 4 },
  specValue: { fontSize: 15, fontWeight: '600' },
  description: { marginTop: 10, fontSize: 14, lineHeight: 20 },
  featureList: { marginTop: 10, gap: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 14,
  },
  priceLabel: { fontSize: 12 },
  priceValue: { fontSize: 22, fontWeight: 'bold' },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
