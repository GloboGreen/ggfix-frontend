import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { login } from '../api/auth';
import colors from '../theme/colors';
import { AUTH_BASE } from '../api/config';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.text, marginBottom: 12 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 999, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  error: { fontSize: 14, color: '#DC2626', marginTop: 8 },
});

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Email and password required');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password, shopSlug.trim() || undefined);
      onLogin(data);
    } catch (e) {
      const msg = e?.message || 'Login failed';
      const isLocalhost = /localhost|127\.0\.0\.1/.test(String(msg));
      if (isLocalhost) {
        const urlMatch = String(msg).match(/URL:\s*(\S+)/i);
        const triedUrl = urlMatch ? urlMatch[1] : '(unknown)';
        setError(
          `Can't reach server (trying localhost). Tried: ${triedUrl}. ` +
            `Current AUTH_BASE: ${AUTH_BASE}. Restart Expo with EXPO_PUBLIC_API_HOST=YOUR_PC_IP (see DEV-NETWORK.md).`
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Repair Shop</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Shop slug (optional)" placeholderTextColor={colors.textSecondary} value={shopSlug} onChangeText={setShopSlug} autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
