import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Loader, Empty } from '../../../components/ui';
import { listProducts } from '../../../api/marketplace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
  body: { flexDirection: 'row', padding: 12 },
  thumb: { width: 80, height: 90, borderRadius: 8, backgroundColor: '#FCA5A5', marginRight: 12 },
  field: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  val: { fontSize: 13, color: colors.text },
  price: { fontSize: 13, color: '#16A34A', fontWeight: '700' },
  dist: { fontSize: 12, color: '#16A34A', position: 'absolute', right: 12, top: 12, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', borderTopColor: '#F0F4F8', borderTopWidth: 1 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
});

export default function BuyListingScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setItems(await listProducts({ status: 'ACTIVE' })); } catch (_) {}
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loader />;
  if (!items.length) return <Empty text="No products yet" />;
  return (
    <ScrollView style={styles.container}>
      {items.map((p) => (
        <TouchableOpacity key={p.id} style={styles.card} onPress={() => navigation.navigate('BuyProductDetails', { productId: p.id })}>
          <View style={styles.body}>
            <View style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text><Text style={styles.field}>Model: </Text><Text style={styles.val}>{p.title}</Text></Text>
              <Text><Text style={styles.field}>Storage: </Text><Text style={styles.val}>{p.storageLabel || '-'}</Text></Text>
              <Text><Text style={styles.field}>Shop Name: </Text><Text style={styles.val}>{p.shopName || '-'}</Text></Text>
              <Text><Text style={styles.field}>Location: </Text><Text style={styles.val}>{p.location || ''}</Text></Text>
              <Text style={styles.price}>Price: ₹{Number(p.price).toLocaleString()}</Text>
            </View>
            <Text style={styles.dist}>{p.distanceKm != null ? `${p.distanceKm.toFixed(1)} Km` : ''}</Text>
          </View>
          <View style={styles.actionsRow}>
            <View style={styles.action}><Ionicons name="eye-outline" color="#16A34A" size={16} /><Text style={{ marginLeft: 4, color: '#16A34A', fontWeight: '700' }}>View</Text></View>
            <View style={styles.action}><Ionicons name="call-outline" color="#2563EB" size={16} /><Text style={{ marginLeft: 4, color: '#2563EB', fontWeight: '700' }}>Call Shop</Text></View>
            <View style={styles.action}><Ionicons name="location-outline" color="#F59E0B" size={16} /><Text style={{ marginLeft: 4, color: '#F59E0B', fontWeight: '700' }}>Location</Text></View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
