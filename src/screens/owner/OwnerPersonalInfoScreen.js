import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession } from '../../auth/session';

export default function OwnerPersonalInfoScreen() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('Nandhakumar S');
  const [email, setEmail] = useState('snandhakumar56200@gmail.com');
  const [mobile, setMobile] = useState('89396 15914');
  const [additional, setAdditional] = useState('63834 78749');

  useEffect(() => {
    getSession()
      .then((s) => {
        if (s?.name) setFullName(s.name);
        if (s?.email) setEmail(s.email);
        if (s?.phone) setMobile(s.phone);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Image
            source={{ uri: 'https://dummyassets.local/owners/nandha.png' }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.sub}>Green Mobiles</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Field label="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field
            label="Mobile Number (WhatsApp)"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
          <Field
            label="Additional Number"
            value={additional}
            onChangeText={setAdditional}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.button} disabled={loading}>
          <Text style={styles.buttonText}>Updated</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

