import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type CameraModule = typeof import('expo-camera');

export default function ScannerScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();

  const [camMod, setCamMod] = useState<CameraModule | null>(null);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [manualId, setManualId] = useState('');
  const lastScanRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      const mod: CameraModule = require('expo-camera');
      setCamMod(mod);
      mod.Camera.requestCameraPermissionsAsync().then((r) => {
        setPermission(r.granted ? 'granted' : 'denied');
      });
    } catch {
      setPermission('denied');
    }
  }, []);

  function openId(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const match = trimmed.match(/(?:rentals?|mietvertrag)\/(\d+)/i);
    const id = match ? match[1] : (/^\d+$/.test(trimmed) ? trimmed : null);
    if (!id) {
      Alert.alert('Ungültig', 'QR-Code enthält keine gültige Miet-ID.');
      return;
    }
    router.push(`/(admin)/rental/${id}`);
  }

  function handleBarCode(result: { data: string }) {
    if (lastScanRef.current === result.data) return;
    lastScanRef.current = result.data;
    openId(result.data);
    setTimeout(() => { lastScanRef.current = null; }, 2000);
  }

  if (Platform.OS === 'web' || !camMod) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, padding: 24 }]}>
        <Ionicons name="qr-code" size={56} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text, marginTop: 12 }]}>Manuelle Eingabe</Text>
        <Text style={{ color: colors.tabIconDefault, textAlign: 'center', marginBottom: 20 }}>
          {Platform.OS === 'web'
            ? 'QR-Scanner ist in der Web-Version nicht verfügbar.'
            : 'Kamera wird geladen…'}
        </Text>
        <TextInput
          value={manualId}
          onChangeText={setManualId}
          placeholder="Miet-ID"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="numeric"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        <TouchableOpacity
          onPress={() => openId(manualId)}
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.primaryBtnText}>Öffnen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permission === 'unknown') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, padding: 24 }]}>
        <Ionicons name="camera-outline" size={56} color={colors.tabIconDefault} />
        <Text style={[styles.title, { color: colors.text, marginTop: 12 }]}>Kamera nicht erlaubt</Text>
        <Text style={{ color: colors.tabIconDefault, textAlign: 'center', marginBottom: 20 }}>
          Bitte Kamerazugriff in den Einstellungen erlauben.
        </Text>
        <TextInput
          value={manualId}
          onChangeText={setManualId}
          placeholder="Miet-ID manuell eingeben"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="numeric"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        <TouchableOpacity
          onPress={() => openId(manualId)}
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.primaryBtnText}>Öffnen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { CameraView } = camMod;

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCode}
      />
      <RNView pointerEvents="none" style={styles.frame}>
        <RNView style={styles.cornerTL} />
        <RNView style={styles.cornerTR} />
        <RNView style={styles.cornerBL} />
        <RNView style={styles.cornerBR} />
      </RNView>
      <RNView style={styles.hintBar}>
        <Ionicons name="scan" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '600' }}>QR-Code auf Vertrag / Fahrzeug scannen</Text>
      </RNView>
    </View>
  );
}

const cornerSize = 28;
const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  input: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    marginBottom: 14,
  },
  primaryBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  frame: {
    position: 'absolute',
    top: '28%',
    left: '15%',
    right: '15%',
    height: 240,
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: cornerSize, height: cornerSize, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#fff', borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: cornerSize, height: cornerSize, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#fff', borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: cornerSize, height: cornerSize, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#fff', borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: cornerSize, height: cornerSize, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#fff', borderBottomRightRadius: 8 },
  hintBar: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: '#000000aa',
    borderRadius: 12,
  },
});
