import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, Loader } from '../../../components/ui';
import { getSellOrder } from '../../../api/orders';
import { getBrands, getModelsByBrand, getRamOptions, getStorageOptions } from '../../../api/masterData';
import { listAddresses } from '../../../api/customer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  deviceCard: { borderColor: '#16A34A', borderWidth: 1 },
  summaryCard: { borderColor: '#2563EB', borderWidth: 1 },
  customerCard: { borderColor: '#16A34A', borderWidth: 1 },
  body: { flexDirection: 'row' },
  modelName: { fontSize: 16, fontWeight: '700', color: colors.text },
  small: { fontSize: 13, color: colors.text, marginTop: 2 },
  thumb: { width: 80, height: 90, borderRadius: 8, backgroundColor: '#E5E7EB', marginLeft: 12 },
  photoHeading: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 10, marginBottom: 6 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  photoItem: { width: 92, marginHorizontal: 3, marginBottom: 6 },
  photoBox: { width: '100%', height: 86, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#93C5FD', overflow: 'hidden', backgroundColor: '#F8FAFC' },
  photoLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 3, fontWeight: '600' },
  heading: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginBottom: 8 },
  subHeading: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 10, marginBottom: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 },
  itemText: { marginLeft: 6, fontSize: 12, color: colors.text, flex: 1, lineHeight: 16 },
  custRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  custText: { marginLeft: 8, fontSize: 13, color: colors.text, flex: 1, lineHeight: 18 },
});

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front Side' },
  { key: 'back', label: 'Backside' },
  { key: 'side', label: 'side and Center' },
  { key: 'camera', label: 'Camera' },
  { key: 'other', label: 'side and Center' },
];

const WARRANTY_LABELS = {
  lt_3: 'Less then 3 months',
  '3_6': '3 - 6 months',
  '6_11': '6 - 11 months',
  gt_11: 'More then 11 months',
};

function Check() {
  return <Ionicons name="checkmark-circle-outline" size={15} color="#16A34A" style={{ marginTop: 1 }} />;
}

export default function SellOrderDetailsScreen({ route }) {
  const id = route.params?.sellOrderId || route.params?.id;
  const [order, setOrder] = useState(null);
  const [meta, setMeta] = useState({});
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const so = await getSellOrder(id);
        if (cancelled) return;
        setOrder(so);

        const [models, rams, storages, brands, addresses] = await Promise.all([
          so.brandId ? getModelsByBrand(so.brandId).catch(() => []) : Promise.resolve([]),
          getRamOptions().catch(() => []),
          getStorageOptions().catch(() => []),
          getBrands().catch(() => []),
          listAddresses().catch(() => []),
        ]);
        if (cancelled) return;
        const model = (models || []).find((m) => m.id === so.modelId);
        const brand = (brands || []).find((b) => b.id === so.brandId);
        const ram = (rams || []).find((r) => r.id === so.ramOptionId);
        const storage = (storages || []).find((s) => s.id === so.storageOptionId);
        setMeta({
          modelName: model?.name || (brand?.name ? `${brand.name} device` : 'Device'),
          image: model?.imageUrl || (model?.imageBase64 ? `data:image/png;base64,${model.imageBase64}` : null),
          ramLabel: ram?.label,
          storageLabel: storage?.label,
        });
        if (so.addressId) setAddress((addresses || []).find((a) => a.id === so.addressId) || null);
      } catch (_) {
        // leave order null -> show empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.textSecondary }}>Could not load this sell order.</Text>
    </View>
  );

  const images = order.images || {};
  const photos = PHOTO_SLOTS.filter((s) => images[s.key]);
  const storageLine = [meta.ramLabel, meta.storageLabel].filter(Boolean).join(' / ');
  const conditionText = order.deviceConditionSummary || (order.workingCondition === 'DEAD' ? 'Unknown Condition' : 'Good');
  const warrantyLabel = WARRANTY_LABELS[order.warrantyCode] || order.warrantyCode;
  const phone = address?.mobile ? (String(address.mobile).startsWith('+') ? address.mobile : `+91 ${address.mobile}`) : '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        {/* Device */}
        <Card style={styles.deviceCard}>
          <View style={styles.body}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modelName}>{meta.modelName}</Text>
              {order.color ? <Text style={styles.small}>Color: {order.color}</Text> : null}
              {storageLine ? <Text style={styles.small}>Storage: {storageLine}</Text> : null}
              <Text style={styles.small}>Device Condition: {conditionText}</Text>
              <Text style={styles.small}>IMEI Number : {order.imei || '-'}</Text>
            </View>
            {meta.image ? (
              <Image source={{ uri: meta.image }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={styles.thumb} />
            )}
          </View>

          {photos.length ? (
            <>
              <Text style={styles.photoHeading}>Device Photo's</Text>
              <View style={styles.photoRow}>
                {photos.map((s) => (
                  <View key={s.key} style={styles.photoItem}>
                    <View style={styles.photoBox}>
                      <Image source={{ uri: images[s.key] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                    <Text style={styles.photoLabel} numberOfLines={1}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </Card>

        {/* Device Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.heading}>Device Summary</Text>

          {(order.screeningAnswers || []).length ? (
            <>
              <Text style={styles.subHeading}>Screening Question</Text>
              {order.screeningAnswers.map((a, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[a.answer, a.question].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {(order.conditions || []).length ? (
            <>
              <Text style={styles.subHeading}>Screen</Text>
              {order.conditions.map((c, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[c.optionLabel, c.groupName].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {(order.accessories || []).length ? (
            <>
              <Text style={styles.subHeading}>Accessories</Text>
              {order.accessories.map((a, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[a.label || a.accessoryCode, 'Accessories'].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {warrantyLabel ? (
            <>
              <Text style={styles.subHeading}>Warranty</Text>
              <View style={styles.itemRow}>
                <Check />
                <Text style={styles.itemText}>{warrantyLabel}</Text>
              </View>
            </>
          ) : null}
        </Card>

        {/* Customer Details */}
        {address ? (
          <Card style={styles.customerCard}>
            <Text style={[styles.heading, { color: '#16A34A' }]}>Customer Details</Text>
            <View style={styles.custRow}>
              <Ionicons name="person-outline" size={16} color="#16A34A" style={{ marginTop: 1 }} />
              <Text style={styles.custText}>{[address.fullName, phone].filter(Boolean).join('  |  ')}</Text>
            </View>
            <View style={styles.custRow}>
              <Ionicons name="location-outline" size={16} color="#16A34A" style={{ marginTop: 1 }} />
              <Text style={styles.custText}>{[address.addressLine, address.locality, address.city, address.state, address.pincode].filter(Boolean).join(', ')}</Text>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}
