import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  CheckCircle2,
  CalendarClock,
  Smartphone,
  Wrench,
  Clock,
  Truck,
  PackageCheck,
  PackageOpen,
  AlertTriangle,
  MapPin,
  Store,
  Phone,
  Camera,
  ShieldCheck,
  Video,
} from 'lucide-react-native';
import {
  Card,
  CardTitle,
  Loader,
  Badge,
  EmptyState,
  Button,
} from '../../../components/rnr';
import { confirm, notify } from '../../../components/confirm';
import { getRepairBooking, cancelRepairBooking } from '../../../api/orders';
import { getBrands, getModelsByBrand, getRamOptions, getStorageOptions } from '../../../api/masterData';
import { getShop } from '../../../api/shops';
import { listAddresses } from '../../../api/customer';

const fmtDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

function DetailLine({ label, value, valueClass }) {
  return (
    <View className="flex-row flex-wrap py-1">
      <Text className="text-[11px] text-text-muted">{label} : </Text>
      <Text className={`text-[11px] font-bold flex-1 ${valueClass || 'text-text'}`}>{value || '-'}</Text>
    </View>
  );
}

const STEPS = [
  { key: 'ORDER_PLACED',            label: 'Order Placed',            icon: CheckCircle2 },
  { key: 'ORDER_SERVICE_CONFIRMED', label: 'Service Confirmed',       icon: Wrench },
  { key: 'PICK_UP_ASSIGNED',        label: 'Pickup Assigned',         icon: Truck },
  { key: 'IN_REPAIR',               label: 'In Repair',               icon: Clock },
  { key: 'OUT_FOR_DELIVERY',        label: 'Out for Delivery',        icon: PackageCheck },
  { key: 'DELIVERED',               label: 'Delivered',               icon: PackageOpen },
];

export default function RepairOrderDetailsScreen({ navigation, route }) {
  const { bookingId, fromOrders } = route.params || {};
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  // Device details resolved from the booking's IDs (the booking record doesn't
  // store the model name/specs).
  const [dev, setDev] = useState({});
  const [shop, setShop] = useState(null);
  const [addr, setAddr] = useState(null);

  const goHome = useCallback(() => {
    // From My Orders: go back to that list. From the booking confirmation (a
    // dead-end), the wizard screens are behind us, so jump to the root tabs.
    if (fromOrders && navigation.canGoBack()) navigation.goBack();
    else navigation.popToTop();
  }, [navigation, fromOrders]);

  // Override the stack header's back button: it should always go Home, not
  // backwards through the booking wizard.
  useLayoutEffect(() => {
    navigation.setOptions({
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

  // Reload on focus so the timeline picks up status updates.
  useFocusEffect(useCallback(() => {
    (async () => {
      try { setB(await getRepairBooking(bookingId)); } catch (_) {}
      setLoading(false);
    })();
  }, [bookingId]));

  // Resolve device name / image / specs from the booking's IDs.
  useEffect(() => {
    if (!b) return;
    let cancelled = false;
    (async () => {
      const [brands, models, rams, storages] = await Promise.all([
        getBrands().catch(() => []),
        b.brandId ? getModelsByBrand(b.brandId).catch(() => []) : [],
        getRamOptions().catch(() => []),
        getStorageOptions().catch(() => []),
      ]);
      if (cancelled) return;
      const model = (models || []).find((m) => m.id === b.modelId);
      const brandName = (brands || []).find((x) => x.id === b.brandId)?.name;
      const ramLabel = (rams || []).find((r) => r.id === b.ramOptionId)?.label;
      const storageLabel = (storages || []).find((s) => s.id === b.storageOptionId)?.label;
      const image = model?.imageUrl
        || (model?.imageBase64 ? `data:image/png;base64,${model.imageBase64}` : null);
      setDev({
        name: b.modelName || model?.name || (brandName ? `${brandName} device` : 'Device'),
        image,
        specs: [brandName, b.color, [ramLabel, storageLabel].filter(Boolean).join(' / ')].filter(Boolean).join(' · '),
      });
    })();
    return () => { cancelled = true; };
  }, [b]);

  // Resolve shop + pickup address from the booking's IDs.
  useEffect(() => {
    if (!b) return;
    let cancelled = false;
    (async () => {
      const [shopRes, addrs] = await Promise.all([
        b.shopId ? getShop(b.shopId).catch(() => null) : null,
        listAddresses().catch(() => []),
      ]);
      if (cancelled) return;
      setShop(shopRes || b.shop || null);
      setAddr((addrs || []).find((a) => a.id === b.pickupAddressId) || b.address || null);
    })();
    return () => { cancelled = true; };
  }, [b]);

  if (loading) return <Loader label="Loading order..." />;
  if (!b) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="Booking not found"
          description="We couldn't load this order."
          actionLabel="Go home"
          onAction={goHome}
        />
      </View>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.key === b.status);
  const safeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

  const onCancel = async () => {
    const ok = await confirm({
      title: 'Cancel pickup',
      message: 'Are you sure you want to cancel this booking?',
      confirmText: 'Yes, cancel',
      cancelText: 'Keep it',
      destructive: true,
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await cancelRepairBooking(bookingId);
      notify('Cancelled', 'Your pickup has been cancelled.');
      goHome();
    } catch (e) {
      notify('Error', e?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = ['ORDER_PLACED', 'ORDER_SERVICE_CONFIRMED'].includes(b.status);
  const serviceNames = (b.services || []).map((s) => s.serviceName).join(', ');
  const priceTotal = b.estimateAmount != null
    ? Number(b.estimateAmount)
    : (b.services || []).reduce((s, x) => s + Number(x.estimatedPrice || 0), 0);
  const estTimeText = b.estimatedReadyAt
    ? `${fmtDateTime(b.estimatedReadyAt)}${b.estimatedDurationHours ? `, ${b.estimatedDurationHours}Hr` : ''}`
    : '-';
  const approvalText = (b.customerApproval || '').toUpperCase() === 'DONE' ? 'Done' : (b.customerApproval || 'Pending');
  const hasDevicePhotos = !!(b.frontImageUrl || b.backImageUrl || b.videoUrl);
  const bookingNo = b.bookingNumber
    ? (String(b.bookingNumber).startsWith('#') ? b.bookingNumber : `#${b.bookingNumber}`)
    : null;
  const centered = { width: '100%', maxWidth: 600, alignSelf: 'center' };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: canCancel ? 120 : 24 }}>
       <View style={centered}>
        {/* Arriving banner (pickup bookings only) */}
        {b.pickupDate ? (
          <View className="bg-success/10 border border-success/30 rounded-2xl p-3 mb-3">
            <View className="flex-row items-center mb-1">
              <CalendarClock size={14} color="#10B981" />
              <Text className="text-success text-[13px] font-extrabold ml-1.5">
                Arriving on {b.pickupDate}
              </Text>
            </View>
            {b.pickupSlotStart && b.pickupSlotEnd ? (
              <Text className="text-success text-[12px] font-bold">
                {String(b.pickupSlotStart).slice(0, 5)} - {String(b.pickupSlotEnd).slice(0, 5)}
              </Text>
            ) : null}
            <Text className="text-[11px] text-text-muted mt-1">
              Pickup confirmed! Our pickup partner will contact you shortly.
            </Text>
          </View>
        ) : null}

        {/* Device card */}
        <Card className="rounded-2xl mb-3">
          {bookingNo ? (
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Booking</Text>
              <Badge variant="softPrimary">{bookingNo}</Badge>
            </View>
          ) : null}
          <View className="flex-row items-start">
            <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mr-3 overflow-hidden">
              {dev.image ? (
                <Image source={{ uri: dev.image }} style={{ width: 48, height: 48 }} resizeMode="cover" />
              ) : (
                <Smartphone size={20} color="#00008B" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Device</Text>
              <Text className="text-[14px] font-extrabold text-text mt-0.5" numberOfLines={2}>
                {dev.name || b.modelName || 'Device'}
              </Text>
              {dev.specs ? (
                <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={2}>{dev.specs}</Text>
              ) : null}
              {serviceNames ? (
                <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={2}>
                  Repair: {serviceNames}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Device Photos */}
        {hasDevicePhotos ? (
          <Card className="rounded-2xl mb-3">
            <CardTitle className="mb-2">Device Photos</CardTitle>
            <View className="flex-row -mx-1">
              {[
                { uri: b.frontImageUrl, label: 'Front Side' },
                { uri: b.backImageUrl, label: 'Back Side' },
                { uri: b.videoUrl, label: 'Full Coverage Video', video: true },
              ].map((p, i) => (
                <View key={i} className="flex-1 px-1">
                  <View className="rounded-xl bg-background border border-border items-center justify-center overflow-hidden" style={{ height: 92 }}>
                    {p.uri && !p.video ? (
                      <Image source={{ uri: p.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : p.uri && p.video ? (
                      <Video size={22} color="#00008B" />
                    ) : (
                      <Camera size={20} color="#94A3B8" />
                    )}
                  </View>
                  <Text className="text-[9px] text-text-muted text-center mt-1" numberOfLines={1}>{p.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Price Summary */}
        {(b.services?.length || b.estimateAmount != null) ? (
          <Card className="rounded-2xl mb-3">
            <CardTitle className="mb-1.5">Price Summary</CardTitle>
            {(b.services || []).map((s, i) => (
              <View key={i} className="flex-row items-center justify-between py-1">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="h-4 w-4 rounded bg-primary/10 items-center justify-center mr-2">
                    <Text className="text-[9px] font-bold text-primary">{i + 1}</Text>
                  </View>
                  <Text className="text-[12px] text-text flex-1" numberOfLines={1}>{s.serviceName}</Text>
                </View>
                <Text className="text-[12px] font-bold text-text">₹{Number(s.estimatedPrice || 0).toLocaleString('en-IN')}</Text>
              </View>
            ))}
            <View className="flex-row items-center justify-between mt-1.5 pt-1.5 border-t border-border">
              <Text className="text-[12px] font-extrabold text-text">Estimated Repair Amount</Text>
              <Text className="text-[13px] font-extrabold text-primary">₹{Number(priceTotal).toLocaleString('en-IN')}</Text>
            </View>
          </Card>
        ) : null}

        {/* Repair Details */}
        <Card className="rounded-2xl mb-3">
          <CardTitle className="mb-1">Repair Details</CardTitle>
          <DetailLine label="Complaint Issue" value={b.issueSummary} />
          <DetailLine label="Estimated Approximate Time" value={estTimeText} />
          <DetailLine label="Estimated Delivery Date" value={fmtDateTime(b.estimatedDeliveryAt)} />
          <DetailLine label="Customer Repair Approval" value={approvalText} valueClass="text-success" />
        </Card>

        {/* Device Security */}
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center mb-1">
            <ShieldCheck size={15} color="#10B981" />
            <CardTitle className="ml-2">Device Security</CardTitle>
          </View>
          <DetailLine label="PIN / Pattern" value={b.devicePin} />
          <View className="h-px bg-border my-2" />
          <Text className="text-[12px] font-extrabold text-text mb-0.5">Device Missing / Damage Parts</Text>
          <Text className="text-[12px] text-text-muted">{b.missingDamageParts || 'Nil'}</Text>
        </Card>

        {/* Technician uploaded photos */}
        {(b.technicianName || b.technicianCode || b.technicianPhotos?.length) ? (
          <Card className="rounded-2xl mb-3">
            <View className="flex-row items-center mb-2">
              <Camera size={15} color="#2563EB" />
              <CardTitle className="ml-2">Technician Photos</CardTitle>
            </View>
            {(b.technicianName || b.technicianCode) ? (
              <Text className="text-[11px] text-text-muted mb-2">
                {[b.technicianName, b.technicianCode].filter(Boolean).join(' — ')}
              </Text>
            ) : null}
            <View className="flex-row -mx-1">
              {(b.technicianPhotos?.length ? b.technicianPhotos.slice(0, 3) : [null, null, null]).map((uri, i) => (
                <View key={i} className="flex-1 px-1">
                  <View className="rounded-xl bg-background border border-border items-center justify-center overflow-hidden" style={{ height: 84 }}>
                    {uri ? (
                      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Camera size={18} color="#94A3B8" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Pickup Address */}
        {addr ? (
          <Card className="rounded-2xl mb-3">
            <View className="flex-row items-center mb-2">
              <MapPin size={15} color="#10B981" />
              <CardTitle className="ml-2">Pickup Address</CardTitle>
            </View>
            <Text className="text-[13px] font-bold text-text">
              {addr.fullName}{addr.mobile ? ` · ${addr.mobile}` : ''}
            </Text>
            <Text className="text-[12px] text-text-muted mt-1 leading-5">
              {[addr.addressLine, addr.locality, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
            </Text>
          </Card>
        ) : null}

        {/* Shop & Schedule */}
        {shop ? (
          <Card className="rounded-2xl mb-3">
            <View className="flex-row items-center mb-2">
              <Store size={15} color="#2563EB" />
              <CardTitle className="ml-2">Shop & Schedule</CardTitle>
            </View>
            <Text className="text-[13px] font-bold text-text">{shop.name}</Text>
            {shop.address ? <Text className="text-[12px] text-text-muted mt-1">{shop.address}</Text> : null}
            {shop.phone ? (
              <View className="flex-row items-center mt-1">
                <Phone size={12} color="#64748B" />
                <Text className="text-[12px] text-text-muted ml-1">{shop.phone}</Text>
              </View>
            ) : null}
            <View className="flex-row items-center bg-secondary/5 border border-secondary/15 rounded-xl mt-3 px-3 py-2">
              <CalendarClock size={14} color="#2563EB" />
              <Text className="text-[12px] font-bold text-secondary ml-2">
                {b.pickupDate || '-'}
                {b.pickupSlotStart && b.pickupSlotEnd
                  ? ` · ${String(b.pickupSlotStart).slice(0, 5)} - ${String(b.pickupSlotEnd).slice(0, 5)}`
                  : ''}
              </Text>
            </View>
          </Card>
        ) : null}

        {/* Status timeline */}
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <CardTitle>Order Status</CardTitle>
            <Pressable
              onPress={() => navigation.navigate(
                (b.serviceMode === 'PICKUP' || b.pickupDate || b.pickupSlotStart) ? 'RepairPickupStatus' : 'RepairOrderHistory',
                { bookingId },
              )}
              className="flex-row items-center active:opacity-70"
            >
              <Text className="text-[11px] font-bold text-primary mr-0.5">Full timeline</Text>
            </Pressable>
          </View>
          {STEPS.map((step, i) => {
            const reached = i <= safeIdx;
            const Icon = step.icon;
            return (
              <View key={step.key} className="flex-row items-center py-1.5">
                <View
                  className={`h-7 w-7 rounded-full items-center justify-center mr-2.5 ${reached ? 'bg-success' : 'bg-background border border-border'}`}
                >
                  <Icon size={13} color={reached ? '#fff' : '#94A3B8'} />
                </View>
                <Text
                  className={`text-[12px] flex-1 ${reached ? 'font-extrabold text-text' : 'text-text-muted'}`}
                >
                  {step.label}
                </Text>
                {i === safeIdx ? (
                  <Badge variant="softSuccess">CURRENT</Badge>
                ) : reached ? (
                  <CheckCircle2 size={14} color="#10B981" />
                ) : null}
              </View>
            );
          })}
        </Card>

        {/* Help banner if not cancellable */}
        {!canCancel ? (
          <View className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 flex-row items-start">
            <AlertTriangle size={12} color="#00008B" style={{ marginTop: 2 }} />
            <Text className="text-[11px] text-text-muted ml-2 flex-1 leading-4">
              This booking can't be cancelled at this stage. Contact the shop directly from the chat for any changes.
            </Text>
          </View>
        ) : null}
       </View>
      </ScrollView>

      {/* Sticky cancel CTA - only when status allows it */}
      {canCancel ? (
        <View className="absolute left-0 right-0 bottom-0 bg-card border-t border-border px-3 pt-2.5 pb-5"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 }}>
          <View style={centered}>
            <Button
              variant="destructive"
              onPress={onCancel}
              loading={cancelling}
              fullWidth
            >
              Cancel Pickup Request
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}

