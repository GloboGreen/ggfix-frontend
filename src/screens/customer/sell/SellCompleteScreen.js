import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { notify } from '../../../components/confirm';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton } from '../../../components/ui';
import { createSellOrder } from '../../../api/orders';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flexDirection: 'row' },
  thumb: { width: 90, height: 100, borderRadius: 8, backgroundColor: '#E5E7EB', marginLeft: 12 },
  small: { fontSize: 13, color: colors.text, marginTop: 2 },
  heading: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

export default function SellCompleteScreen({ navigation, route }) {
  const p = route.params || {};
  const device = p.device || {};
  const [saving, setSaving] = useState(false);

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
        warrantyCode: p.warrantyCode,
        addressId: p.addressId,
        screeningAnswers: p.screeningAnswers || [],
        conditions: p.conditions || [],
        issues: p.issues || [],
        accessories: p.accessories || [],
      };
      const created = await createSellOrder(payload);
      navigation.replace('SellSuccess', { sellOrder: created });
    } catch (e) {
      notify('Error', e.message);
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card>
          <View style={styles.body}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{device.modelName}</Text>
              <Text style={styles.small}>Color: {device.color}</Text>
              <Text style={styles.small}>Device Condition: {p.deviceCondition || (p.workingCondition === 'DEAD' ? 'Unknown Condition' : 'Good')}</Text>
              <Text style={styles.small}>IMEI: {device.imei || '-'}</Text>
            </View>
            <View style={styles.thumb} />
          </View>
        </Card>

        <Card>
          <Text style={styles.heading}>Device Summary</Text>
          <Text style={styles.small}>Screening Question</Text>
          {(p.screeningAnswers || []).map((a, i) => (
            <View key={i} style={styles.row}><Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" /><Text style={[styles.small, { marginLeft: 6 }]}>{a.answer}</Text></View>
          ))}
          <Text style={[styles.small, { marginTop: 8, fontWeight: '700' }]}>Screen</Text>
          {(p.conditions || []).map((c, i) => (
            <View key={i} style={styles.row}><Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" /><Text style={[styles.small, { marginLeft: 6 }]}>{c.optionLabel}</Text></View>
          ))}
          <Text style={[styles.small, { marginTop: 8, fontWeight: '700' }]}>Accessories ({(p.accessories || []).length})</Text>
          <Text style={[styles.small, { marginTop: 8, fontWeight: '700' }]}>Warranty: {p.warrantyCode || '-'}</Text>
        </Card>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Sell Now →" onPress={submit} loading={saving} />
      </View>
    </View>
  );
}
