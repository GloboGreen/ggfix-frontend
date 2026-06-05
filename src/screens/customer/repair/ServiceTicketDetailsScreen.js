import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  CalendarClock,
  IndianRupee,
  FileText,
  Camera,
  ShieldCheck,
  Wrench,
  UserCog,
  PackageX,
} from 'lucide-react-native';
import {
  Card,
  Loader,
  Badge,
  EmptyState,
} from '../../../components/rnr';
import { getServiceTicket } from '../../../api/orders';

const fmtDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const fmtMoney = (v) => {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return `₹${n.toLocaleString()}`;
};

// repair_status_colors per spec. Status keys here are upper-snake to match the
// values written by ticket-service + repair-bookings mirror.
const STATUS_VARIANT = {
  CREATED: 'softWarning',
  ORDER_PLACED: 'softWarning',
  PICKUP_PRESENT: 'softWarning',
  REPAIR_DEVICE_RECEIVED: 'softSecondary',
  IN_DIAGNOSIS: 'softSecondary',
  SHOP_SERVICE_ACCEPTED: 'softSuccess',
  ASSIGN_TECHNICIAN: 'softPrimary',
  TECHNICIAN_ASSIGNED: 'softPrimary',
  QUOTED: 'softPrimary',
  APPROVED: 'softSuccess',
  IN_REPAIR: 'softWarning',
  READY: 'softSuccess',
  COMPLETED: 'softSuccess',
  DELIVERED: 'softSuccess',
  CANCELLED: 'softDanger',
};

function parseJsonSafe(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function PriceLine({ index, label, amount }) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="h-5 w-5 rounded-full bg-primary/10 items-center justify-center mr-2">
        <Text className="text-[10px] font-bold text-primary">{index}</Text>
      </View>
      <Text className="text-[12px] text-text flex-1" numberOfLines={1}>{label || 'Item'}</Text>
      <Text className="text-[12px] font-bold text-text">{fmtMoney(amount) || '-'}</Text>
    </View>
  );
}

function SectionCard({ icon: Icon, color, title, children }) {
  return (
    <Card className="rounded-2xl mb-3">
      <View className="flex-row items-center mb-2">
        {Icon ? <Icon size={14} color={color || '#7C3AED'} /> : null}
        <Text className="ml-1.5 text-[13px] font-extrabold text-text">{title}</Text>
      </View>
      {children}
    </Card>
  );
}

export default function ServiceTicketDetailsScreen({ navigation, route }) {
  const { ticketId, fromOrders } = route.params || {};
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);

  const goHome = useCallback(() => {
    if (fromOrders && navigation.canGoBack()) navigation.goBack();
    else navigation.popToTop();
  }, [navigation, fromOrders]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'View Details',
      headerLeft: () => (
        <Pressable
          onPress={goHome}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => ({ marginLeft: 8, padding: 4, opacity: pressed ? 0.6 : 1 })}
        >
          <View
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: '#F1F5F9',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} color="#0F172A" />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, goHome]);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await getServiceTicket(ticketId);
        if (!cancelled) setT(resp);
      } catch (_) {
        if (!cancelled) setT(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticketId]));

  if (loading) return <Loader label="Loading order..." />;
  if (!t) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="Ticket not found"
          description="We couldn't load this service order."
          actionLabel="Go home"
          onAction={goHome}
        />
      </View>
    );
  }

  const tracking = t.trackingId ? (String(t.trackingId).startsWith('#') ? t.trackingId : `#${t.trackingId}`) : null;
  const priceItems = parseJsonSafe(t.priceItemsJson, []);
  const photos = parseJsonSafe(t.devicePhotosJson, {}) || {};
  const missingPartsArr = parseJsonSafe(t.missingPartsJson, []) || [];
  const missingPartsLabels = (Array.isArray(missingPartsArr) ? missingPartsArr : [])
    .map((it) => (it && typeof it === 'object' ? (it.label || it.name) : String(it)))
    .filter(Boolean);
  const variant = STATUS_VARIANT[String(t.status || '').toUpperCase()] || 'softPrimary';
  const priceTotal = t.finalPrice != null ? Number(t.finalPrice)
    : t.estimatedPrice != null ? Number(t.estimatedPrice)
    : (Array.isArray(priceItems) ? priceItems : []).reduce((s, it) => {
        const a = Number(it?.amount);
        return s + (Number.isFinite(a) ? a : 0);
      }, 0);
  const approvalDone = String(t.customerApproval).toLowerCase() === 'true'
    || String(t.customerApproval).toUpperCase() === 'DONE';
  const centered = { width: '100%', maxWidth: 600, alignSelf: 'center' };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        <View style={centered}>
          {/* Header device card */}
          <Card className="rounded-2xl mb-3">
            <View className="flex-row items-start">
              <View className="h-12 w-12 rounded-xl bg-background items-center justify-center mr-3 overflow-hidden">
                {t.deviceImageUrl ? (
                  <Image source={{ uri: t.deviceImageUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                ) : (
                  <Wrench size={18} color="#7C3AED" />
                )}
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest">Tracking ID</Text>
                {tracking ? <Text className="text-[14px] font-extrabold text-text">{tracking}</Text> : null}
                <Text className="text-[12px] text-text mt-1" numberOfLines={1}>
                  Device: <Text className="font-bold">{t.deviceDisplayName || '-'}</Text>
                </Text>
                {t.color ? (
                  <Text className="text-[11px] text-text-muted mt-0.5">Color: {t.color}</Text>
                ) : null}
              </View>
              <Badge variant={variant}>{(t.status || '').replace(/_/g, ' ')}</Badge>
            </View>
          </Card>

          {/* Price summary */}
          <SectionCard icon={IndianRupee} color="#10B981" title="Price Summary">
            {Array.isArray(priceItems) && priceItems.length > 0 ? (
              priceItems.map((it, i) => (
                <PriceLine key={i} index={i + 1} label={it?.label || it?.name} amount={it?.amount} />
              ))
            ) : (
              <Text className="text-[12px] text-text-muted">
                {t.repairServicesSummary || 'No itemised pricing'}
              </Text>
            )}
            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
              <Text className="text-[13px] font-extrabold text-text">
                {t.finalPrice != null ? 'Final Repair Amount' : 'Estimated Repair Amount'}
              </Text>
              <Text className="text-[13px] font-extrabold text-primary">
                {fmtMoney(priceTotal) || '-'}
              </Text>
            </View>
          </SectionCard>

          {/* Complaint */}
          <SectionCard icon={FileText} color="#2563EB" title="Complaint Issue">
            <Text className="text-[12px] text-text">{t.issueDescription || '-'}</Text>
          </SectionCard>

          {/* Schedule */}
          <SectionCard icon={CalendarClock} color="#F59E0B" title="Service Schedule">
            <View className="flex-row py-1">
              <Text className="text-[11px] text-text-muted w-24">Approx. Time</Text>
              <Text className="text-[11px] font-bold text-text flex-1">{fmtDateTime(t.estimatedReadyAt)}</Text>
            </View>
            <View className="flex-row py-1">
              <Text className="text-[11px] text-text-muted w-24">Delivery</Text>
              <Text className="text-[11px] font-bold text-text flex-1">{fmtDateTime(t.estimatedDeliveryAt)}</Text>
            </View>
            <View className="flex-row py-1">
              <Text className="text-[11px] text-text-muted w-24">Approval</Text>
              <Text className={`text-[11px] font-extrabold flex-1 ${approvalDone ? 'text-success' : 'text-warning'}`}>
                {approvalDone ? 'Done' : 'Pending'}
              </Text>
            </View>
          </SectionCard>

          {/* Device photos */}
          {(photos.front || photos.back || photos.video) ? (
            <SectionCard icon={Camera} color="#7C3AED" title="Device Photos">
              <View className="flex-row">
                {['front', 'back', 'video'].map((k) => (
                  <View key={k} className="flex-1 items-center mr-2">
                    <Text className="text-[10px] text-primary font-bold mb-1">
                      {k === 'front' ? 'Front Side' : k === 'back' ? 'Back Side' : 'Full Coverage V...'}
                    </Text>
                    <View
                      className="w-full rounded-xl border border-dashed border-border items-center justify-center overflow-hidden bg-background"
                      style={{ height: 96 }}
                    >
                      {photos[k] ? (
                        <Image source={{ uri: photos[k] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <Camera size={18} color="#94A3B8" />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </SectionCard>
          ) : null}

          {/* Security type — value masked on backend for customer reads */}
          <SectionCard icon={ShieldCheck} color="#10B981" title="Device Security">
            {t.deviceSecurityType && t.deviceSecurityType !== 'NONE' ? (
              <Text className="text-[12px] text-text">
                <Text className="font-extrabold">{t.deviceSecurityType}</Text>
                <Text className="text-text-muted">  ••••••  set</Text>
              </Text>
            ) : (
              <Text className="text-[12px] text-text-muted">Not set</Text>
            )}
          </SectionCard>

          {/* Missing parts */}
          <SectionCard icon={PackageX} color="#DC2626" title="Device Missing / Damage Parts">
            <Text className="text-[12px] text-text-muted">
              {missingPartsLabels.length ? missingPartsLabels.join(', ') : 'Nill'}
            </Text>
          </SectionCard>

          {/* Technician */}
          {t.assignedTechnicianName ? (
            <SectionCard icon={UserCog} color="#00008B" title="Technician">
              <Text className="text-[13px] font-extrabold text-text">
                {t.assignedTechnicianName}
                {t.assignedTechnicianCode ? (
                  <Text className="text-text-muted font-normal"> {'—'} {t.assignedTechnicianCode}</Text>
                ) : null}
              </Text>
              <Text className="text-[11px] text-text-muted">Technician</Text>
            </SectionCard>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
