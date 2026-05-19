import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarketplaceSellScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Sell (Marketplace)</Text>
      <Text style={styles.hint}>Create listing via API: POST /marketplace/products. Dropdowns from GET /master/brands, /master/models.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#202124', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#9AA0A6' },
});
