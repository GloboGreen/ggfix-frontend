import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, CardTitle, Loader, Badge } from '../../../components/rnr';
import { getRepairBooking } from '../../../api/orders';

// Full in-shop service journey. The entire flow is always shown (matching the
// design); each step lights up + timestamps from the booking's events as the
// shop advances the status. Pickup uses a separate screen.
const SERVICE_PHASES = [
  {
    key: 'SERVICE_ACCEPTED', label: 'Service Accepted', color: 'success',
    steps: [
      { key: 'ORDER_PLACED',        text: 'Your Booking has been placed' },
      { key: 'ASSIGN_TECHNICIAN',   text: 'Assign to Technician' },
      { key: 'ASSIGN_NOT_ACCEPTED', text: 'Assign to technician not accepted', danger: true },
      { key: 'REASSIGN_TECHNICIAN', text: 'Re-Assign to Technician' },
      { key: 'TECHNICIAN_ACCEPTED', text: 'Technician accepted the service' },
    ],
  },
  {
    key: 'IN_SERVICE_PROCESS', label: 'In Service Process', color: 'success',
    steps: [
      { key: 'TECH_WORK_STARTED',   text: 'Technician Work Started' },
      { key: 'TECH_UPLOADED_IMAGES',text: 'Technician uploaded device images' },
      { key: 'TECH_COMPLIANCE',     text: 'Technician compliance issue has been verified and updated.' },
      { key: 'ISSUE_IDENTIFIED',    text: 'A motherboard-related issue was identified. The ticket was updated accordingly, the task was reassigned, and the repair work has now started.' },
      { key: 'WAITING_APPROVAL',    text: 'Waiting for Customer Approval' },
    ],
  },
  {
    key: 'RE_ESTIMATED_CONFIRMED', label: 'Re-Estimated Confirmed', color: 'secondary',
    steps: [
      { key: 'REBOOKING_PLACED',    text: 'Re-Booking has been placed' },
      { key: 'TECH_WORK_RESTARTED', text: 'Technician work started' },
    ],
  },
  {
    key: 'PENDING_SPARE', label: 'Pending', color: 'warning',
    steps: [
      { key: 'WAITING_SPARE',       text: 'Waiting for spare part – not available.' },
      { key: 'SPARE_ORDERED',       text: 'Spare part has been ordered. Service is pending.' },
    ],
  },
  {
    key: 'IN_SERVICE_PROCESS_2', label: 'In Service Process', color: 'success',
    steps: [
      { key: 'TECH_WORK_STARTED_2', text: 'Technician Work Started' },
      { key: 'TECH_WORK_COMPLETED', text: 'Technician work completed' },
    ],
  },
  {
    key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', color: 'success',
    steps: [{ key: 'OUT_FOR_DELIVERY', text: 'Your device is out for delivery.' }],
  },
  {
    key: 'DELIVERY_TO_DEVICE', label: 'Delivery Present Pickup To Device', color: 'success',
    steps: [{ key: 'ON_THE_WAY', text: 'Your device is on the way' }],
  },
  {
    key: 'DELIVERED', label: 'Delivered', color: 'success',
    steps: [{ key: 'DELIVERED', text: 'Your device has been delivered.' }],
  },
];

const COLOR_HEX = { success: '#10B981', secondary: '#2563EB', warning: '#F59E0B' };
const DANGER = '#EF4444';

// Every step key -> its phase index, so booking.status (a granular key) maps to
// the right phase even before earlier steps have individual events.
const STATUS_TO_PHASE = {};
const LABEL_BY_KEY = {};
SERVICE_PHASES.forEach((p, i) => p.steps.forEach((s) => { STATUS_TO_PHASE[s.key] = i; LABEL_BY_KEY[s.key] = s.text; }));
Object.assign(STATUS_TO_PHASE, {
  ORDER_SERVICE_CONFIRMED: 0, IN_REPAIR: 1, IN_SERVICE_PROCESS: 1,
  RE_ESTIMATED: 2, PENDING: 3, OUT_FOR_DELIVERY: 5, DELIVERED: 7,
});

const fmt = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};
const hashed = (n) => (n ? (String(n).startsWith('#') ? n : `#${n}`) : '');

export default function RepairOrderHistoryScreen({ route }) {
  const { bookingId } = route.params || {};
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try { setB(await getRepairBooking(bookingId)); } catch (_) {}
  }, [bookingId]);

  // Refetch on focus + poll every 10s so shop status updates appear in near
  // real time without the customer having to reopen the app.
  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => { await load(); if (active) setLoading(false); })();
    timer.current = setInterval(load, 10000);
    return () => { active = false; if (timer.current) clearInterval(timer.current); };
  }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loader label="Loading history..." />;

  const statusUpper = (b?.status || '').toUpperCase();
  const events = b?.events || [];
  const eventByStatus = {};
  let latest = null;
  events.forEach((e) => {
    const k = (e.status || '').toUpperCase();
    if (!eventByStatus[k]) eventByStatus[k] = e;
    if (!latest || new Date(e.createdAt || 0) >= new Date(latest.createdAt || 0)) latest = e;
  });
  const currentKey = (latest?.status || '').toUpperCase();
  const currentLabel = latest?.note || LABEL_BY_KEY[currentKey] || (b?.status || '').replace(/_/g, ' ');

  // Progress = furthest of (status-derived phase, furthest phase that has an event).
  let statusPhase = STATUS_TO_PHASE[statusUpper];
  if (statusPhase == null) statusPhase = -1;
  let eventPhase = -1;
  SERVICE_PHASES.forEach((ph, i) => {
    if (ph.steps.some((s) => eventByStatus[s.key])) eventPhase = Math.max(eventPhase, i);
  });
  let currentPhaseIdx = Math.max(statusPhase, eventPhase);
  if (currentPhaseIdx < 0) currentPhaseIdx = 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
    >
      <Card className="rounded-2xl mb-3">
        <Text className="text-[10px] text-text-muted uppercase tracking-widest">Tracking ID</Text>
        <Text className="text-[15px] font-extrabold text-text mt-0.5">{hashed(b?.bookingNumber)}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-[11px] text-text-muted mr-1">Current:</Text>
          <Badge variant="softSuccess">{currentLabel || 'Booking placed'}</Badge>
        </View>
        <Text className="text-[10px] text-text-muted mt-1">Live status from your shop. Pull to refresh.</Text>
      </Card>

      <Card className="rounded-2xl">
        <CardTitle className="mb-2">Service History</CardTitle>
        {SERVICE_PHASES.map((phase, i) => {
          const reached = i <= currentPhaseIdx;
          const isLast = i === SERVICE_PHASES.length - 1;
          const hex = COLOR_HEX[phase.color] || COLOR_HEX.success;
          let phaseDate = '';
          for (const s of phase.steps) {
            const ev = eventByStatus[s.key];
            if (ev?.createdAt) { phaseDate = fmt(ev.createdAt); break; }
          }
          return (
            <View key={phase.key} className="flex-row">
              {/* Rail */}
              <View className="items-center mr-3" style={{ width: 18 }}>
                <View
                  style={{
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: reached ? hex : '#FFFFFF',
                    borderWidth: reached ? 0 : 2, borderColor: '#CBD5E1',
                    marginTop: 2,
                  }}
                />
                {!isLast ? (
                  <View className="flex-1 my-1" style={{ width: 2, backgroundColor: i < currentPhaseIdx ? hex : '#E2E8F0' }} />
                ) : null}
              </View>

              {/* Content */}
              <View className="flex-1 pb-4">
                <View className="flex-row items-center justify-between">
                  <Text className={`text-[13px] flex-1 pr-2 ${reached ? 'font-extrabold text-text' : 'font-bold text-text-muted'}`}>
                    {phase.label}
                  </Text>
                  {phaseDate ? <Text className="text-[10px] text-text-muted">{phaseDate}</Text> : null}
                </View>

                {phase.steps.map((step) => {
                  const ev = eventByStatus[step.key];
                  const done = !!ev || i < currentPhaseIdx;
                  const isCurrent = step.key === currentKey;
                  return (
                    <View key={step.key} className="mt-1.5">
                      <View className="flex-row items-center">
                        <Text
                          className={`text-[11px] flex-1 ${step.danger ? '' : (done ? 'text-text' : 'text-text-muted')} ${isCurrent ? 'font-extrabold' : ''}`}
                          style={step.danger ? { color: DANGER } : undefined}
                        >
                          {ev?.note || step.text}
                        </Text>
                        {isCurrent ? (
                          <View className="bg-success/15 rounded-full px-1.5 py-0.5 ml-1">
                            <Text className="text-[8px] font-extrabold text-success">NOW</Text>
                          </View>
                        ) : null}
                      </View>
                      {ev?.createdAt ? (
                        <Text className="text-[9px] text-text-muted mt-0.5">{fmt(ev.createdAt)}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}
