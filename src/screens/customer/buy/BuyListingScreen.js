import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Loader, Empty } from '../../../components/ui';
import { listProducts } from '../../../api/marketplace';
import { getBrandsForCategory, getModelsByBrand } from '../../../api/masterData';

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
  categoryBar: { paddingHorizontal: 4, paddingBottom: 8 },
  categoryLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  categoryName: { fontSize: 16, color: colors.text, fontWeight: '800', marginTop: 2 },
});

export default function BuyListingScreen({ navigation, route }) {
  const { categoryId, categoryCode, categoryName, title } = route?.params || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (categoryName || title) {
      navigation.setOptions({ title: categoryName || title });
    }
  }, [navigation, categoryName, title]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Resolve the selected category to its set of model IDs via brands.
        // Marketplace products carry modelId (no categoryId), so we filter by
        // modelId IN (models reachable from the category's mapped brands).
        let allowedModelIds = null;
        if (categoryId || categoryCode) {
          const brands = await getBrandsForCategory(categoryId || categoryCode).catch(() => []);
          const modelLists = await Promise.all(
            (brands || []).map((b) => getModelsByBrand(b.id).catch(() => [])),
          );
          const ids = new Set();
          modelLists.flat().forEach((m) => { if (m?.id) ids.add(m.id); });
          allowedModelIds = ids;
        }

        const products = await listProducts({ status: 'ACTIVE' }).catch(() => []);
        const filtered = allowedModelIds
          ? (products || []).filter((p) => p.modelId && allowedModelIds.has(p.modelId))
          : (products || []);
        if (!cancelled) setItems(filtered);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [categoryId, categoryCode]);

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.container}>
      {(categoryName || title) ? (
        <View style={styles.categoryBar}>
          <Text style={styles.categoryLabel}>Showing products in</Text>
          <Text style={styles.categoryName}>{categoryName || title}</Text>
        </View>
      ) : null}

      {!items.length ? (
        <Empty text={categoryName ? `No ${categoryName.toLowerCase()} products yet` : 'No products yet'} />
      ) : items.map((p) => (
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
