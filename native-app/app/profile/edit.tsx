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
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, refresh } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [postalCode, setPostalCode] = useState(user?.postalCode ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Vor- und Nachname sind erforderlich.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        postalCode: postalCode.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
      });
      await refresh();
      if (Platform.OS === 'web') router.back();
      else Alert.alert('Gespeichert', 'Ihr Profil wurde aktualisiert.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  }

  const renderField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    icon: React.ComponentProps<typeof Ionicons>['name'],
    keyboard?: 'default' | 'phone-pad' | 'number-pad'
  ) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name={icon} size={18} color={colors.tabIconDefault} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholderTextColor={colors.tabIconDefault}
          keyboardType={keyboard}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {renderField('Vorname', firstName, setFirstName, 'person-outline')}
        {renderField('Nachname', lastName, setLastName, 'person-outline')}
        {renderField('Telefon', phone, setPhone, 'call-outline', 'phone-pad')}
        {renderField('Adresse', address, setAddress, 'home-outline')}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            {renderField('PLZ', postalCode, setPostalCode, 'pin-outline', 'number-pad')}
          </View>
          <View style={{ flex: 2 }}>
            {renderField('Stadt', city, setCity, 'business-outline')}
          </View>
        </View>
        {renderField('Land', country, setCountry, 'earth-outline')}

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
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Speichern</Text>}
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
    height: 48,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
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
