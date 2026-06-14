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
import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export default function DocumentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, refresh } = useAuth();

  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber ?? '');
  const [idNumber, setIdNumber] = useState(user?.idNumber ?? '');
  const [licensePhotoUrl, setLicensePhotoUrl] = useState(user?.licensePhotoUrl ?? '');
  const [idPhotoUrl, setIdPhotoUrl] = useState(user?.idPhotoUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({
        licenseNumber: licenseNumber.trim() || null,
        idNumber: idNumber.trim() || null,
        // photo URLs are updated during the pickImage process
      });
      await refresh();
      if (Platform.OS === 'web') alert('Dokumentdaten wurden aktualisiert.');
      else Alert.alert('Gespeichert', 'Ihre Dokumentdaten wurden aktualisiert.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  }

  async function pickImage(type: 'license' | 'id') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setSaving(true);
    try {
      const asset = result.assets[0];
      
      let file: any;
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        file = await response.blob();
      } else {
        file = {
          uri: asset.uri,
          name: asset.fileName || 'photo.jpg',
          type: asset.mimeType || 'image/jpeg',
        };
      }

      const { url } = await api.uploadDocument(file);
      
      const update: any = {};
      if (type === 'license') {
        update.licensePhotoUrl = url;
        setLicensePhotoUrl(url);
      } else {
        update.idPhotoUrl = url;
        setIdPhotoUrl(url);
      }

      await api.updateProfile(update);
      await refresh();
      
      if (Platform.OS === 'web') alert('Foto wurde erfolgreich hochgeladen.');
      else Alert.alert('Erfolg', 'Foto wurde erfolgreich hochgeladen.');
    } catch (err) {
      setError('Foto-Upload fehlgeschlagen.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const renderField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    icon: React.ComponentProps<typeof Ionicons>['name'],
    placeholder: string,
    photoUrl: string,
    onUpload: () => void
  ) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name={icon} size={20} color={colors.tint} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
      <TouchableOpacity 
        onPress={onUpload}
        disabled={saving}
        style={[styles.uploadRow, { borderColor: colors.border, borderStyle: 'dashed' }]}
      >
        <Ionicons 
          name={photoUrl ? "checkmark-circle" : "camera-outline"} 
          size={18} 
          color={photoUrl ? "#22c55e" : colors.tint} 
        />
        <Text style={[styles.uploadText, { color: photoUrl ? "#22c55e" : colors.text }]}>
          {photoUrl ? 'Foto hochgeladen' : 'Foto hochladen'}
        </Text>
        {photoUrl && <Ionicons name="eye-outline" size={16} color={colors.tabIconDefault} style={{ marginLeft: 'auto' }} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={[styles.infoBox, { backgroundColor: `${colors.tint}15` }]}>
          <Ionicons name="information-circle" size={22} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Geben Sie Ihre Dokumentnummern an und laden Sie die Fotos hoch.
          </Text>
        </View>

        {renderField('Führerschein', licenseNumber, setLicenseNumber, 'card-outline', 'z.B. B123456789', licensePhotoUrl, () => pickImage('license'))}
        {renderField('Personalausweis / Pass', idNumber, setIdNumber, 'person-circle-outline', 'Dokumentnummer', idPhotoUrl, () => pickImage('id'))}

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
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Daten speichern</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  uploadText: { fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    marginTop: 10,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: { color: '#991b1b', flex: 1, fontSize: 13 },
});
