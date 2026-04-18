import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  View as RNView,
  Text as RNText,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { Storage, StorageKeys } from '@/lib/storage';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signIn, signInAsStaff } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Storage.get(StorageKeys.lastEmail).then((v) => {
      if (v) setEmail(v);
    });
    setError(null);
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      let success = false;
      try {
        await signIn(email.trim(), password);
        success = true;
      } catch (err: any) {
        if (err.code === 'NETWORK') throw err;
      }
      
      if (!success) {
        try {
          await signInAsStaff(email.trim(), password);
        } catch (staffErr: any) {
          throw staffErr;
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Anmeldung fehlgeschlagen.';
      setError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Anmeldung', msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/sports_car.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <RNView style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <RNView style={styles.header}>
            <RNView style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.logoImage} 
              />
            </RNView>
            <RNText style={styles.title}>RentEx</RNText>
            <RNText style={styles.subtitle}>Premium Autovermietung</RNText>
          </RNView>

          <RNView style={styles.formContainer}>
            <RNText style={styles.formTitle}>Willkommen zurück</RNText>
            
            <RNView style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
              />
            </RNView>

            <RNView style={[styles.inputWrap, { marginTop: 16 }]}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry={!showPwd}
                autoComplete="password"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </RNView>

            {error && (
              <RNView style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                <RNText style={styles.errorText}>{error}</RNText>
              </RNView>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.primaryBtn, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <RNText style={styles.primaryBtnText}>Anmelden</RNText>
              )}
            </TouchableOpacity>

            <RNView style={styles.footerRow}>
              <RNText style={styles.footerText}>Neu bei RentEx? </RNText>
              <Link href="/(auth)/register" replace asChild>
                <TouchableOpacity>
                  <RNText style={styles.linkText}>Jetzt registrieren</RNText>
                </TouchableOpacity>
              </Link>
            </RNView>
          </RNView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 24, 
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  formContainer: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    color: '#ffffff',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(153, 27, 27, 0.5)',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  errorText: { color: '#fca5a5', flex: 1, fontSize: 13 },
  primaryBtn: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  linkText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
