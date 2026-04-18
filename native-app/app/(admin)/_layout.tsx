import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function AdminLayout() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: 'transparent',
        },
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Übersicht',
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rentals"
        options={{
          title: 'Mieten',
          headerTitle: 'Mietverträge',
          tabBarIcon: ({ color }) => <TabBarIcon name="clipboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: 'Flotte',
          headerTitle: 'Fahrzeugflotte',
          tabBarIcon: ({ color }) => <TabBarIcon name="car-sport" color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Kunden',
          headerTitle: 'Kunden',
          tabBarIcon: ({ color }) => <TabBarIcon name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mehr',
          headerTitle: 'Mehr',
          tabBarIcon: ({ color }) => <TabBarIcon name="ellipsis-horizontal" color={color} />,
        }}
      />
      <Tabs.Screen name="rental/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="activity" options={{ href: null, headerShown: true, headerTitle: 'Aktivität' }} />
      <Tabs.Screen name="scanner" options={{ href: null, headerShown: true, headerTitle: 'QR Scanner' }} />
    </Tabs>
  );
}
