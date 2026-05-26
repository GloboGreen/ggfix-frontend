import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, Loader, DangerButton } from '../../../components/ui';
import { confirm, notify } from '../../../components/confirm';
import { getRepairBooking, cancelRepairBooking } from '../../../api/orders';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 12 },
  banner: { backgroundColor: '#D1FAE5', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  bannerTitle: { color: '#16A34A', fontWeight: '700' },
  small: { fontSize: 13, color: colors.text, marginTop: 2 },
  step: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  stepDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  stepActive: { backgroundColor: '#16A34A' },
  stepInactive: { backgroundColor: '#D1D5DB' },
  stepLabel: { fontSize: 13, color: colors.text, flex: 1 },
  bottom: { padding: 12, backgroundColor: '#fff' },
});

const STEPS = ['ORDER_PLACED', 'ORDER_SERVICE_CONFIRMED', 'PICK_UP_ASSIGNED', 'IN_REPAIR', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function RepairOrderDetailsScreen({ navigation, route }) {
  const { bookingId } = route.params || {};
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setB(await getRepairBooking(bookingId)); } catch (_) {}
      setLoading(false);
    })();
  }, [bookingId]);
  if (loading) return <Loader />;
  if (!b) return <View style={styles.container}><Text style={{ padding: 16 }}>Not found</Text></View>;

  const currentStepIdx = STEPS.indexOf(b.status);
  const onCancel = async () => {
    const ok = await confirm({ title: 'Cancel', message: 'Cancel this pickup?', confirmText: 'Yes', cancelText: 'No', destructive: true });
    if (!ok) return;
    try { await cancelRepairBooking(bookingId); navigation.goBack(); } catch (e) { notify('Error', e.message); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Arriving on {b.pickupDate}</Text>
          <Text style={{ color: '#16A34A' }}>{b.pickupSlotStart?.slice(0, 5)} – {b.pickupSlotEnd?.slice(0, 5)}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 12 }}>Pick up Confirmed! Our Pickup Partner will contact you shortly</Text>
        </View>
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{b.modelName || 'Device'}</Text>
          <Text style={styles.small}>Repair: {(b.services || []).map((s) => s.serviceName).join(', ')}</Text>
        </Card>
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Order Status</Text>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={[styles.stepDot, i <= currentStepIdx ? styles.stepActive : styles.stepInactive]} />
              <Text style={styles.stepLabel}>{s.replace(/_/g, ' ')}</Text>
              {i <= currentStepIdx ? <Ionicons name="checkmark-circle" color="#16A34A" size={16} /> : null}
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('RepairOrderHistory', { bookingId })}>
            <Text style={{ color: '#2563EB', fontWeight: '700', marginTop: 6 }}>Order all Updates</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
      <View style={styles.bottom}>
        <DangerButton title="Cancel Request" onPress={onCancel} style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }} />
      </View>
    </View>
  );
}
