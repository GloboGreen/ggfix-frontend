import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerQrCodeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://dummyassets.local/owners/nandha.png' }}
            style={styles.avatar}
          />
          <Text style={styles.shopName}>Green Mobiles</Text>

          <View style={styles.qrBox}>
            <Ionicons name="qr-code-outline" size={200} color="#111827" />
          </View>

          <Text style={styles.owner}>Nandha Kumar S</Text>
          <Text style={styles.meta}>Mobile: 89396159144</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="download-outline" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Download My QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { flex: 1, padding: 16, paddingBottom: 32, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  qrBox: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  owner: { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

