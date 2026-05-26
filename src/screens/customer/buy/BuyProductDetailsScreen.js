import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, Loader, PrimaryButton } from '../../../components/ui';
import { notify } from '../../../components/confirm';
import { getProduct, addToCart } from '../../../api/marketplace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { height: 200, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1 },
  body: { padding: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  price: { fontSize: 16, fontWeight: '700', color: '#16A34A' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  iconWrap: { width: 30 },
  rowLabel: { width: 100, color: colors.textSecondary },
  rowVal: { flex: 1, color: colors.text, fontWeight: '600' },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

export default function BuyProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params || {};
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    (async () => { try { setP(await getProduct(productId)); } catch (_) {} setLoading(false); })();
  }, [productId]);
  const add = async () => {
    setAdding(true);
    try {
      await addToCart(productId, 1);
      notify('Added', 'Added to cart');
    } catch (e) { notify('Error', e.message); }
    finally { setAdding(false); }
  };
  if (loading) return <Loader />;
  if (!p) return <View style={styles.container}><Text style={{ padding: 16 }}>Not found</Text></View>;
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.hero}>
          <Ionicons name="phone-portrait" size={120} color="#9CA3AF" />
        </View>
        <View style={styles.body}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.title, { flex: 1 }]}>{p.title}</Text>
            <Text style={styles.price}>Price : ₹{Number(p.price).toLocaleString()}</Text>
          </View>
          <Card>
            <View style={styles.row}><View style={styles.iconWrap}><Ionicons name="phone-portrait-outline" size={18} color={colors.text} /></View><Text style={styles.rowLabel}>Condition:</Text><Text style={styles.rowVal}>{p.conditionLabel || 'Good'}</Text></View>
            <View style={styles.row}><View style={styles.iconWrap}><Ionicons name="save-outline" size={18} color={colors.text} /></View><Text style={styles.rowLabel}>Storage:</Text><Text style={styles.rowVal}>{p.storageLabel || '-'}</Text></View>
            <View style={styles.row}><View style={styles.iconWrap}><Ionicons name="color-palette-outline" size={18} color={colors.text} /></View><Text style={styles.rowLabel}>Color:</Text><Text style={styles.rowVal}>{p.color || '-'}</Text></View>
            <View style={styles.row}><View style={styles.iconWrap}><Ionicons name="cellular-outline" size={18} color={colors.text} /></View><Text style={styles.rowLabel}>Network:</Text><Text style={styles.rowVal}>{p.network || '-'}</Text></View>
          </Card>
          <Card>
            <Text style={{ color: '#2563EB', fontWeight: '700' }}>Shop Information</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 6 }}>🏬 {p.shopName}</Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>Shop Address: {p.shopAddress}</Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>📞 {p.shopPhone}</Text>
          </Card>
        </View>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Add to Cart →" onPress={add} loading={adding} />
      </View>
    </View>
  );
}
