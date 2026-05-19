import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerKycIntroScreen({ navigation }) {
  const cards = [
    { icon: 'id-card-outline', title: 'Aadhar Card', desc: 'Keep your Aadhar card ready for identity verification.' },
    { icon: 'card-outline', title: 'PAN Card', desc: 'Keep your PAN card ready for tax verification.' },
    { icon: 'document-text-outline', title: 'GST Certificate', desc: 'GST certificate for business verification.' },
    { icon: 'receipt-outline', title: 'Udayam Certificate', desc: 'Udayam certificate for business registration.' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Let’s begin your KYC process</Text>
        <Text style={styles.subtitle}>Keep following documents handy before proceeding</Text>

        <View style={styles.cardGrid}>
          {cards.map((c) => (
            <View key={c.title} style={styles.card}>
              <Ionicons name={c.icon} size={32} color="#2563EB" />
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OwnerKycUpload')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#4B5563', marginBottom: 16 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 6 },
  cardDesc: { fontSize: 11, color: '#4B5563', marginTop: 4, textAlign: 'center' },
  button: {
    marginTop: 16,
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

