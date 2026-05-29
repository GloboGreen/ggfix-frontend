import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { notify } from '../../../components/confirm';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton } from '../../../components/ui';
import { createSellOrder } from '../../../api/orders';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  deviceCard: { borderColor: '#2563EB', borderWidth: 1 },
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
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front Side' },
  { key: 'back', label: 'Backside' },
  { key: 'side', label: 'side and Center' },
  { key: 'camera', label: 'Camera' },
  { key: 'other', label: 'side and Center' },
];

function Check() {
  return <Ionicons name="checkmark-circle-outline" size={15} color="#16A34A" style={{ marginTop: 1 }} />;
}

export default function SellCompleteScreen({ navigation, route }) {
  const p = route.params || {};
  const device = p.device || {};
  const address = p.address || {};
  const images = p.images || {};
  const [saving, setSaving] = useState(false);

  const storageLine = [device.ramLabel, device.storageLabel].filter(Boolean).join(' / ');
  const photos = PHOTO_SLOTS.filter((s) => images[s.key]);
  const phone = address.mobile ? (String(address.mobile).startsWith('+') ? address.mobile : `+91 ${address.mobile}`) : '';

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        brandId: device.brandId,
        modelId: device.modelId,
        ramOptionId: device.ramOptionId,
        storageOptionId: device.storageOptionId,
        color: device.color,
        imei: device.imei,
        workingCondition: p.workingCondition,
        warrantyCode: p.warranty,
        addressId: p.addressId,
        screeningAnswers: p.screeningAnswers || [],
        conditions: p.conditions || [],
        issues: p.issues || [],
        accessories: p.accessories || [],
        images,
      };
      const created = await createSellOrder(payload);
      navigation.replace('SellSuccess', { sellOrder: created });
    } catch (e) {
      notify('Error', e.message);
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        {/* Device */}
        <Card style={styles.deviceCard}>
          <View style={styles.body}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modelName}>{device.modelName || 'Device'}</Text>
              {device.color ? <Text style={styles.small}>Color: {device.color}</Text> : null}
              {storageLine ? <Text style={styles.small}>Storage: {storageLine}</Text> : null}
              <Text style={styles.small}>Device Condition: {p.deviceCondition || (p.workingCondition === 'DEAD' ? 'Unknown Condition' : 'Good')}</Text>
              <Text style={styles.small}>IMEI Number : {device.imei || '-'}</Text>
            </View>
            {device.imageUrl ? (
              <Image source={{ uri: device.imageUrl }} style={styles.thumb} resizeMode="cover" />
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

          {(p.screeningAnswers || []).length ? (
            <>
              <Text style={styles.subHeading}>Screening Question</Text>
              {(p.screeningAnswers || []).map((a, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[a.answer, a.question].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {(p.conditions || []).length ? (
            <>
              <Text style={styles.subHeading}>Screen</Text>
              {(p.conditions || []).map((c, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[c.optionLabel, c.groupName].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {(p.accessories || []).length ? (
            <>
              <Text style={styles.subHeading}>Accessories</Text>
              {(p.accessories || []).map((a, i) => (
                <View key={i} style={styles.itemRow}>
                  <Check />
                  <Text style={styles.itemText}>{[a.label || a.accessoryCode, 'Accessories'].filter(Boolean).join(', ')}</Text>
                </View>
              ))}
            </>
          ) : null}

          {p.warrantyLabel ? (
            <>
              <Text style={styles.subHeading}>Warranty</Text>
              <View style={styles.itemRow}>
                <Check />
                <Text style={styles.itemText}>{p.warrantyLabel}</Text>
              </View>
            </>
          ) : null}
        </Card>

        {/* Customer Details */}
        {(address.fullName || address.addressLine) ? (
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
      <View style={styles.bottom}>
        <PrimaryButton title="Sell Now →" onPress={submit} loading={saving} style={{ backgroundColor: '#16A34A' }} />
      </View>
    </View>
  );
}
