import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Smartphone, Mail, Lock, User, Phone, Store, ShieldCheck } from 'lucide-react-native';
import { login, customerLogin, customerRegister } from '../api/auth';
import { AUTH_BASE } from '../api/config';
import { Button, Input, Label } from '../components/rnr';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('CUSTOMER'); // CUSTOMER | OWNER
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustomer = mode === 'CUSTOMER';

  const handleSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      let data;
      if (mode === 'OWNER') {
        if (!email.trim() || !password.trim()) {
          setError('Email and password required');
          return;
        }
        data = await login(email.trim(), password, shopSlug.trim() || undefined);
      } else if (isRegister) {
        if (!mobile.trim() || !password.trim() || !fullName.trim()) {
          setError('Name, mobile and password required');
          return;
        }
        data = await customerRegister({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          mobile: mobile.trim(),
          password,
        });
      } else {
        if (!mobile.trim() || !password.trim()) {
          setError('Mobile and password required');
          return;
        }
        const trimmed = mobile.trim();
        const looksLikeEmail = trimmed.includes('@') || /[a-zA-Z]/.test(trimmed);
        if (looksLikeEmail) {
          // Fallback: try the shop-side login (email + password) and route by role.
          try {
            data = await login(trimmed, password);
          } catch (innerErr) {
            // Surface a hint instead of a generic 401
            setError(
              `That looks like an email. If you're a shop owner or technician, switch to the "Shop / Tech" tab.`,
            );
            return;
          }
        } else {
          data = await customerLogin({ mobile: trimmed, password });
        }
      }
      onLogin(data);
    } catch (e) {
      const msg = e?.message || 'Authentication failed';
      const isLocalhost = /localhost|127\.0\.0\.1/.test(String(msg));
      if (isLocalhost) {
        const urlMatch = String(msg).match(/URL:\s*(\S+)/i);
        const triedUrl = urlMatch ? urlMatch[1] : '(unknown)';
        setError(
          `Can't reach server (trying localhost). Tried: ${triedUrl}. ` +
            `Current AUTH_BASE: ${AUTH_BASE}. Restart Expo with EXPO_PUBLIC_API_HOST=YOUR_PC_IP.`,
        );
      } else if (mode === 'CUSTOMER' && !isRegister && /unauthorized|invalid/i.test(String(msg))) {
        setError(
          `No customer account found for that mobile. Tap "Create account" below, or switch to the "Shop / Tech" tab if you're a shop user.`,
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={['#00008B', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 70 : 56, paddingBottom: 56, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <View className="flex-row items-center mb-6">
            <View className="h-12 w-12 rounded-2xl bg-white/15 items-center justify-center mr-3">
              <Smartphone size={24} color="#fff" />
            </View>
            <View>
              <Text className="text-white text-2xl font-extrabold">Globo Green</Text>
              <Text className="text-white/80 text-[12px] mt-0.5">Repair · Buy · Sell — at your fingertips</Text>
            </View>
          </View>
          <Text className="text-white text-[26px] font-extrabold leading-8">
            {isRegister ? 'Create your\naccount' : 'Welcome back!'}
          </Text>
          <Text className="text-white/80 text-[13px] mt-2 leading-5">
            {isRegister
              ? 'Sign up to book trusted repairs from nearby shops.'
              : 'Sign in to continue booking nearby repair services.'}
          </Text>
        </LinearGradient>

        <View className="-mt-8 mx-4 bg-card rounded-3xl border border-border p-5"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
          <View className="flex-row bg-background rounded-full p-1 mb-5">
            <Pressable
              onPress={() => setMode('CUSTOMER')}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-full ${isCustomer ? 'bg-primary' : ''}`}
            >
              <User size={15} color={isCustomer ? '#fff' : '#64748B'} />
              <Text className={`ml-1.5 text-[13px] font-bold ${isCustomer ? 'text-white' : 'text-text-muted'}`}>Customer</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('OWNER')}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-full ${!isCustomer ? 'bg-primary' : ''}`}
            >
              <Store size={15} color={!isCustomer ? '#fff' : '#64748B'} />
              <Text className={`ml-1.5 text-[13px] font-bold ${!isCustomer ? 'text-white' : 'text-text-muted'}`}>Shop / Tech</Text>
            </Pressable>
          </View>

          {isCustomer ? (
            <>
              {isRegister ? (
                <View className="mb-3">
                  <Label>Full Name</Label>
                  <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                    <User size={16} color="#64748B" />
                    <Input
                      placeholder="Your full name"
                      value={fullName}
                      onChangeText={setFullName}
                      className="flex-1 bg-transparent border-0 ml-2"
                    />
                  </View>
                </View>
              ) : null}

              <View className="mb-3">
                <Label>Mobile Number</Label>
                <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                  <Phone size={16} color="#64748B" />
                  <Input
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    className="flex-1 bg-transparent border-0 ml-2"
                  />
                </View>
              </View>

              {isRegister ? (
                <View className="mb-3">
                  <Label>Email (optional)</Label>
                  <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                    <Mail size={16} color="#64748B" />
                    <Input
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="flex-1 bg-transparent border-0 ml-2"
                    />
                  </View>
                </View>
              ) : null}

              <View className="mb-1">
                <Label>Password</Label>
                <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                  <Lock size={16} color="#64748B" />
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="flex-1 bg-transparent border-0 ml-2"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View className="mb-3">
                <Label>Email</Label>
                <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                  <Mail size={16} color="#64748B" />
                  <Input
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="flex-1 bg-transparent border-0 ml-2"
                  />
                </View>
              </View>
              <View className="mb-3">
                <Label>Password</Label>
                <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                  <Lock size={16} color="#64748B" />
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="flex-1 bg-transparent border-0 ml-2"
                  />
                </View>
              </View>
              <View className="mb-1">
                <Label>Shop slug (optional)</Label>
                <View className="flex-row items-center bg-background rounded-xl border border-border px-3">
                  <Store size={16} color="#64748B" />
                  <Input
                    placeholder="my-shop"
                    value={shopSlug}
                    onChangeText={setShopSlug}
                    autoCapitalize="none"
                    className="flex-1 bg-transparent border-0 ml-2"
                  />
                </View>
              </View>
            </>
          )}

          {error ? (
            <View className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 mt-3">
              <Text className="text-[12px] text-danger leading-4">{error}</Text>
            </View>
          ) : null}

          <Button
            onPress={handleSubmit}
            loading={loading}
            className="mt-4"
            fullWidth
          >
            {isCustomer && isRegister ? 'Create Account' : 'Log In'}
          </Button>

          {isCustomer ? (
            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-[13px] text-text-muted">
                {isRegister ? 'Already have an account? ' : 'New to Globo Green? '}
              </Text>
              <Pressable onPress={() => setIsRegister((v) => !v)}>
                <Text className="text-[13px] font-bold text-primary">
                  {isRegister ? 'Sign in' : 'Create account'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center justify-center px-6 py-6 mt-2">
          <ShieldCheck size={14} color="#64748B" />
          <Text className="text-[11px] text-text-muted ml-1.5 text-center">
            Trusted by repair shops across India. Secure JWT auth · No spam.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
