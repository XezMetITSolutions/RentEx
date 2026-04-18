import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, ApiError } from '@/lib/api';

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!current || !next || !confirm) return setError('Bitte alle Felder ausfüllen.');
    if (next.length < 6) return setError('Neues Passwort mindestens 6 Zeichen.');
    if (next !== confirm) return setError('Passwort-Bestätigung stimmt nicht überein.');

    setSaving(true);
    setError(null);
    try {
      await api.changePassword(current, next);
      if (Platform.OS === 'web') router.back();
      else Alert.alert('Erfolg', 'Passwort wurde geändert.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ändern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  }

  const renderField = (
    label: string,
    value: string,
    setValue: (v: string) => void
  ) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.tabIconDefault} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="••••••••"
          placeholderTextColor={colors.tabIconDefault}
          secureTextEntry
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20 }}
      >
        {renderField('Aktuelles Passwort', current, setCurrent)}
        {renderField('Neues Passwort', next, setNext)}
        {renderField('Passwort bestätigen', confirm, setConfirm)}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="alert-circle" size={18} color="#991b1b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.primaryBtn, { backgroundColor: colors.tint, opacity: saving ? 0.7 : 1 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Passwort ändern</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  errorText: { color: '#991b1b', flex: 1, fontSize: 13 },
  primaryBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
