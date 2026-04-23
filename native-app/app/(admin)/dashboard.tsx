import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { staff } = useAuth();

  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const d = await api.adminDashboard();
      setData(d);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Konnte Dashboard nicht laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const renderSectionHeader = (kicker: string, title: string, action?: string) => (
    <View style={styles.sectionHead}>
      <Text style={[styles.kicker, { color: colors.tint }]}>{kicker}</Text>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {action && <Text style={[styles.actionText, { color: colors.textMuted }]}>{action}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      {/* Staff Greeting */}
      <View style={styles.greetingBlock}>
        <Text style={[styles.greetingKicker, { color: colors.textFaint }]}>SCHICHT · {new Date().toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: 'short' })}</Text>
        <Text style={[styles.greetingName, { color: colors.text }]}>
          {staff?.locationName || 'Station Wien Hbf.'}
        </Text>
        <Text style={[styles.greetingSub, { color: colors.textMuted }]}>
          {data?.rentals.todayPickups || 0} Übergaben · {data?.rentals.todayReturns || 0} Rücknahmen heute
        </Text>
      </View>

      {/* Staff KPIs */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kpiKicker, { color: colors.textFaint }]}>VERFÜGBAR</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{data?.cars.active || 0}</Text>
            <Text style={[styles.kpiTotal, { color: colors.textFaint }]}>/ {data?.cars.total || 0}</Text>
          </View>
          <Text style={[styles.kpiHint, { color: colors.textMuted }]}>Fahrzeuge</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kpiKicker, { color: colors.textFaint }]}>IN MIETE</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{data?.rentals.active || 0}</Text>
          </View>
          <Text style={[styles.kpiHint, { color: data?.rentals.overdue ? colors.tint : colors.textMuted }]}>
            davon {data?.rentals.overdue || 0} überfällig
          </Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kpiKicker, { color: colors.textFaint }]}>WARTUNG</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{data?.cars.maintenance || 0}</Text>
          </View>
          <Text style={[styles.kpiHint, { color: colors.textMuted }]}>Termine fällig</Text>
        </View>
      </View>

      {/* Timeline Section */}
      {renderSectionHeader('HEUTE', 'Übergabe & Rücknahme', 'Kalender →')}
      <View style={[styles.timelineBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.timelineItem} onPress={() => router.push('/(admin)/rentals?status=Confirmed')}>
           <View style={styles.timeInfo}>
              <Text style={[styles.time, { color: colors.text }]}>HEUTE</Text>
              <Text style={[styles.timeTag, { color: colors.tint }]}>AUS</Text>
           </View>
           <View style={[styles.timelineDivider, { backgroundColor: colors.border }]} />
           <View style={styles.itemContent}>
              <Text style={[styles.who, { color: colors.text }]}>{data?.rentals.todayPickups || 0} Abholungen</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>Geplante Fahrzeugübergaben</Text>
           </View>
           <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
        </TouchableOpacity>
        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.timelineItem} onPress={() => router.push('/(admin)/rentals?status=Active')}>
           <View style={styles.timeInfo}>
              <Text style={[styles.time, { color: colors.text }]}>HEUTE</Text>
              <Text style={[styles.timeTag, { color: '#3E6B4A' }]}>EIN</Text>
           </View>
           <View style={[styles.timelineDivider, { backgroundColor: colors.border }]} />
           <View style={styles.itemContent}>
              <Text style={[styles.who, { color: colors.text }]}>{data?.rentals.todayReturns || 0} Rückgaben</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>Erwartete Fahrzeugrücknahmen</Text>
           </View>
           <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={{ marginTop: 24 }}>
        {renderSectionHeader('SCHNELLZUGRIFF', 'Aktionen')}
        <View style={styles.actionsGrid}>
          <ActionTile colors={colors} icon="qr-code-outline" label="Übergabe" onPress={() => router.push('/(admin)/scanner')} />
          <ActionTile colors={colors} icon="shield-checkmark-outline" label="Schaden" onPress={() => {}} />
          <ActionTile colors={colors} icon="speedometer-outline" label="Fahrtenbuch" onPress={() => {}} />
          <ActionTile colors={colors} icon="document-text-outline" label="Protokoll" onPress={() => router.push('/(admin)/activity')} />
        </View>
      </View>

      {/* Monthly Revenue (Small Reward style) */}
      <View style={[styles.revenueCard, { backgroundColor: colors.text }]}>
        <View style={[styles.accentBar, { backgroundColor: colors.tint }]} />
        <Text style={[styles.revenueKicker, { color: colors.tint }]}>UMSATZ MONAT</Text>
        <Text style={[styles.revenueValue, { color: colors.background }]}>
          € {Math.round(data?.revenue.month || 0).toLocaleString('de-AT')}
        </Text>
        <Text style={[styles.revenueDesc, { color: colors.background, opacity: 0.65 }]}>
          Station Wien Hbf. · Aktueller Monat
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ActionTile({ colors, icon, label, onPress }: { colors: any; icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.actionIconBox, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={20} color={colors.tint} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingTop: 10, paddingBottom: 40 },
  greetingBlock: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingKicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  greetingSub: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  kpiKicker: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '800',
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 2,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  kpiTotal: {
    fontSize: 11,
    fontWeight: '600',
  },
  kpiHint: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHead: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  timelineBox: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timelineItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeInfo: {
    width: 48,
  },
  time: {
    fontSize: 13,
    fontWeight: '800',
  },
  timeTag: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  timelineDivider: {
    width: 1,
    height: '100%',
  },
  itemContent: {
    flex: 1,
  },
  who: {
    fontSize: 14,
    fontWeight: '700',
  },
  desc: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 24,
  },
  actionTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  revenueCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 8,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  revenueKicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 10,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  revenueDesc: {
    fontSize: 11,
    fontWeight: '600',
  },
});
