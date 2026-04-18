import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    if (password.length < 6) {
      setError('Passwort mindestens 6 Zeichen.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.message || 'Registrierung fehlgeschlagen.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Registrierung', msg);
    } finally {
      setLoading(false);
    }
  }

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ComponentProps<typeof Ionicons>['name'],
    opts?: {
      secure?: boolean;
      keyboard?: 'default' | 'email-address' | 'phone-pad';
      autoComplete?: any;
      onToggleSecure?: () => void;
      secureToggled?: boolean;
      placeholder?: string;
    }
  ) => (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name={icon} size={20} color={colors.tabIconDefault} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={opts?.placeholder}
          placeholderTextColor={colors.tabIconDefault}
          secureTextEntry={opts?.secure && !opts?.secureToggled}
          keyboardType={opts?.keyboard || 'default'}
          autoCapitalize={opts?.keyboard === 'email-address' ? 'none' : 'words'}
          autoComplete={opts?.autoComplete}
          style={[styles.input, { color: colors.text }]}
        />
        {opts?.secure && opts.onToggleSecure && (
          <TouchableOpacity onPress={opts.onToggleSecure}>
            <Ionicons
              name={opts.secureToggled ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.tabIconDefault}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Konto erstellen</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            In 30 Sekunden loslegen.
          </Text>
        </View>

        {renderInput('Vorname', firstName, setFirstName, 'person-outline', { placeholder: 'Max' })}
        {renderInput('Nachname', lastName, setLastName, 'person-outline', { placeholder: 'Mustermann' })}
        {renderInput('E-Mail', email, setEmail, 'mail-outline', {
          keyboard: 'email-address',
          autoComplete: 'email',
          placeholder: 'name@example.com',
        })}
        {renderInput('Telefon (optional)', phone, setPhone, 'call-outline', {
          keyboard: 'phone-pad',
          autoComplete: 'tel',
          placeholder: '+49 …',
        })}
        {renderInput('Passwort', password, setPassword, 'lock-closed-outline', {
          secure: true,
          secureToggled: showPwd,
          onToggleSecure: () => setShowPwd(!showPwd),
          autoComplete: 'password-new',
          placeholder: 'min. 6 Zeichen',
        })}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="alert-circle" size={18} color="#991b1b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={[styles.primaryBtn, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Registrieren</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={{ color: colors.tabIconDefault }}>Bereits registriert? </Text>
          <Link href="/(auth)/login" replace>
            <Text style={[styles.linkText, { color: colors.tint }]}>Anmelden</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 14 },
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
    marginTop: 14,
  },
  errorText: { color: '#991b1b', flex: 1, fontSize: 13 },
  primaryBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontWeight: '600' },
});
