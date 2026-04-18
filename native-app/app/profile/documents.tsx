import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const DOCUMENTS = [
  { id: 'license', label: 'Führerschein', required: true, icon: 'card-outline' as const },
  { id: 'id', label: 'Personalausweis / Pass', required: true, icon: 'person-circle-outline' as const },
  { id: 'insurance', label: 'Versicherungsnachweis', required: false, icon: 'shield-checkmark-outline' as const },
];

export default function DocumentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  function handleUpload(label: string) {
    const msg = `Upload für "${label}" wird in Kürze verfügbar sein. Sie können Ihre Dokumente aktuell über die Website hochladen.`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Bald verfügbar', msg);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={[styles.infoBox, { backgroundColor: `${colors.tint}15` }]}>
        <Ionicons name="information-circle" size={22} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          Um ein Fahrzeug abzuholen, benötigen wir gültige Ausweisdokumente. Alle Daten werden verschlüsselt gespeichert.
        </Text>
      </View>

      {DOCUMENTS.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          onPress={() => handleUpload(doc.label)}
          style={[styles.docCard, { backgroundColor: colors.card }]}
        >
          <View style={[styles.docIcon, { backgroundColor: `${colors.tint}22` }]}>
            <Ionicons name={doc.icon} size={22} color={colors.tint} />
          </View>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={styles.docLabel}>{doc.label}</Text>
            <Text style={[styles.docStatus, { color: colors.tabIconDefault }]}>
              {doc.required ? 'Erforderlich · Noch nicht hochgeladen' : 'Optional'}
            </Text>
          </View>
          <View style={[styles.uploadBtn, { backgroundColor: colors.tint }]}>
            <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: { fontSize: 15, fontWeight: '600' },
  docStatus: { fontSize: 12, marginTop: 3 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
