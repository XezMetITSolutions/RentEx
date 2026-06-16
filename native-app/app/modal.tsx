import React from 'react';
import { StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const NOTIFICATIONS: any[] = [];

export default function NotificationsModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Benachrichtigungen</Text>
        <TouchableOpacity>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>Alle gelesen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {NOTIFICATIONS.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[
              styles.notifCard,
              {
                backgroundColor: colors.card,
                borderLeftColor: n.unread ? n.color : 'transparent',
                borderLeftWidth: n.unread ? 3 : 0,
              },
            ]}
          >
            <View style={[styles.notifIcon, { backgroundColor: `${n.color}22` }]}>
              <Ionicons name={n.icon} size={20} color={n.color} />
            </View>
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={[styles.notifTime, { color: colors.tabIconDefault }]}>{n.time}</Text>
              </View>
              <Text style={[styles.notifBody, { color: colors.tabIconDefault }]}>{n.body}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {NOTIFICATIONS.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.tabIconDefault} />
            <Text style={{ marginTop: 12, color: colors.tabIconDefault }}>
              Keine Benachrichtigungen
            </Text>
          </View>
        )}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: { fontWeight: 'bold', fontSize: 14, flex: 1 },
  notifTime: { fontSize: 11 },
  notifBody: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 80 },
});
