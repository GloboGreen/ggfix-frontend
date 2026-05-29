import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { Card, Loader } from '../../../components/rnr';
import { getRepairBooking } from '../../../api/orders';

// Doorstep-pickup status flow (distinct from the in-shop service flow). The
// shop advances these from the owner app; each step lights up + timestamps from
// the booking's events.
const PICKUP_STEPS = [
  { key: 'ORDER_PLACED',            label: 'Order Placed' },
  { key: 'ORDER_SERVICE_CONFIRMED', label: 'Order Service Confirmed' },
  { key: 'PICKUP_ASSIGNED',         label: 'Pick Up Present Assigned' },
  { key: 'ESTIMATE_PROCESSING',     label: 'Pick Up Present Repair Estimated Value Processing' },
  { key: 'ESTIMATE_ACCEPTED',       label: 'Customer Repair Estimated Value Accepted' },
  { key: 'DEVICE_RECEIVED',         label: 'Repair Device Received to Pickup Present' },
  { key: 'DEVICE_DELIVERY_TO_SHOP', label: 'Pickup Present Repair Device Delivery to Shop' },
  { key: 'DEVICE_RETURNED',         label: 'Repair Device Return to Customer Home' },
];

const fmt = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};
const hashed = (n) => (n ? (String(n).startsWith('#') ? n : `#${n}`) : '');

export default function RepairPickupStatusScreen({ route }) {
  const { bookingId } = route.params || {};
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try { setB(await getRepairBooking(bookingId)); } catch (_) {}
  }, [bookingId]);

  // Refresh on focus + poll every 10s so shop updates appear in near real time.
  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => { await load(); if (active) setLoading(false); })();
    timer.current = setInterval(load, 10000);
    return () => { active = false; if (timer.current) clearInterval(timer.current); };
  }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loader label="Loading pickup status..." />;

  const statusUpper = (b?.status || '').toUpperCase();
  const events = b?.events || [];
  const eventByStatus = {};
  events.forEach((e) => { const k = (e.status || '').toUpperCase(); if (!eventByStatus[k]) eventByStatus[k] = e; });

  let currentIdx = -1;
  for (let i = PICKUP_STEPS.length - 1; i >= 0; i -= 1) {
    if (eventByStatus[PICKUP_STEPS[i].key]) { currentIdx = i; break; }
  }
  if (currentIdx === -1) currentIdx = PICKUP_STEPS.findIndex((s) => s.key === statusUpper);
  if (currentIdx === -1) currentIdx = 0;
  const currentLabel = PICKUP_STEPS[currentIdx]?.label || (b?.status || '').replace(/_/g, ' ');

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
    >
      <Card className="rounded-2xl mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-extrabold text-text">Pick Up</Text>
          <Text className="text-[11px] text-text-muted">Order ID: {hashed(b?.bookingNumber)}</Text>
        </View>
        <View className="flex-row items-center mt-2">
          <Text className="text-[11px] text-text-muted mr-1">Status:</Text>
          <Text className="text-[12px] font-extrabold text-success">{currentLabel}</Text>
        </View>
        <Text className="text-[10px] text-text-muted mt-1">Live status from your shop. Pull to refresh.</Text>
      </Card>

      <Card className="rounded-2xl">
        {PICKUP_STEPS.map((step, i) => {
          const ev = eventByStatus[step.key];
          const reached = i <= currentIdx || !!ev;
          const isCurrent = i === currentIdx;
          const isLast = i === PICKUP_STEPS.length - 1;
          return (
            <View key={step.key} className="flex-row">
              {/* Rail */}
              <View className="items-center mr-3" style={{ width: 28 }}>
                <View
                  className={`h-7 w-7 rounded-full items-center justify-center ${
                    isCurrent ? 'bg-primary' : reached ? 'bg-success' : 'bg-background border border-border'
                  }`}
                >
                  {reached && !isCurrent ? (
                    <Check size={14} color="#fff" strokeWidth={3} />
                  ) : (
                    <View className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-border'}`} />
                  )}
                </View>
                {!isLast ? <View className={`flex-1 w-0.5 my-1 ${i < currentIdx ? 'bg-success' : 'bg-border'}`} /> : null}
              </View>
              {/* Label */}
              <View className="flex-1 pb-4">
                <Text className={`text-[13px] ${reached ? 'font-extrabold text-text' : 'text-text-muted'}`}>
                  {step.label}
                </Text>
                {isCurrent ? <Text className="text-[10px] font-bold text-primary mt-0.5">CURRENT</Text> : null}
                {ev?.createdAt ? (
                  <Text className="text-[10px] text-text-muted mt-0.5">{fmt(ev.createdAt)}</Text>
                ) : null}
                {ev?.note ? <Text className="text-[11px] text-text mt-0.5">{ev.note}</Text> : null}
              </View>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}
