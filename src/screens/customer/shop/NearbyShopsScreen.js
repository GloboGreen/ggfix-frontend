import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Loader, Empty } from '../../../components/ui';
import { listNearbyShops } from '../../../api/shops';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { backgroundColor: '#fff', margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  hero: { height: 130, backgroundColor: '#E5E7EB' },
  openTag: { position: 'absolute', left: 10, top: 10, backgroundColor: '#16A34A', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 11, fontWeight: '700' },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  addr: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  dist: { fontSize: 12, color: '#16A34A', position: 'absolute', right: 12, top: 12, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', borderTopColor: '#F0F4F8', borderTopWidth: 1, marginTop: 10, paddingTop: 6 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
});

export default function NearbyShopsScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setShops(await listNearbyShops()); } catch (_) {}
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loader />;
  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput style={styles.searchInput} placeholder="Search Shop Name" placeholderTextColor={colors.textSecondary} />
      </View>
      {shops.length === 0 ? (
        <Empty text="No shops nearby" />
      ) : (
        <ScrollView>
          {shops.map((s) => (
            <TouchableOpacity key={s.id} style={styles.card} onPress={() => navigation.navigate('ShopDetails', { shopId: s.id })}>
              <View style={styles.hero}>
                <Text style={styles.openTag}>Open Now</Text>
                <Text style={styles.dist}>{s.distanceKm != null ? `${s.distanceKm.toFixed(1)} km` : ''}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.addr}>{s.address || s.city}</Text>
                <View style={styles.actionsRow}>
                  <View style={styles.action}><Ionicons name="call-outline" size={16} color="#16A34A" /><Text style={{ marginLeft: 4, color: '#16A34A', fontWeight: '600', fontSize: 13 }}>Call Shop</Text></View>
                  <View style={styles.action}><Ionicons name="location-outline" size={16} color="#16A34A" /><Text style={{ marginLeft: 4, color: '#16A34A', fontWeight: '600', fontSize: 13 }}>Directions</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
