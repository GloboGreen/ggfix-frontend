import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock, MapPin, FileText, User, IndianRupee, Hash, Truck, History, Phone, UserCheck, CheckCircle2, Camera, Video } from 'lucide-react-native';
import { Badge, Button, Loader, ScreenHeader } from '../../components/rnr';
import { confirmShopRepairBooking, getShopRepairBooking, markPickupReceivedAtShop } from '../../api/orders';

const STATUS_VARIANT = {
  ORDER_PLACED:            { variant: 'softWarning',  label: 'New Request' },
  PICKUP_REQUESTED:        { variant: 'softWarning',  label: 'Pickup Requested' },
  PICKUP_ACCEPTED:         { variant: 'softPrimary',  label: 'Pickup Accepted' },
  ORDER_SERVICE_CONFIRMED: { variant: 'softPrimary',  label: 'Confirmed' },
  PICKUP_PERSON_ASSIGNED:  { variant: 'softPrimary',  label: 'Pickup Assigned' },
  PICKUP_ASSIGNED:         { variant: 'softPrimary',  label: 'Pickup Assigned' },
  PICKUP_ON_THE_WAY:       { variant: 'softSecondary',label: 'On The Way' },
  REPAIR_ESTIMATE_PROCESSING: { variant: 'softWarning', label: 'Estimate Submitted' },
  DEVICE_PICKED_UP:        { variant: 'softSecondary',label: 'Device Picked Up' },
  PICKED_UP:               { variant: 'softSecondary',label: 'Device Picked Up' },
  REACHED_SHOP:            { variant: 'softSuccess',  label: 'Reached Shop' },
  RECEIVED_AT_SHOP:        { variant: 'softSuccess',  label: 'Received at Shop' },
  ACCEPTED:                { variant: 'softPrimary',  label: 'Accepted' },
  IN_TRANSIT:              { variant: 'softSecondary',label: 'In Transit' },
  COMPLETED:               { variant: 'softSuccess',  label: 'Completed' },
  CANCELLED:               { variant: 'softDanger',   label: 'Cancelled' },
};

function fmtDate(d) {
  if (!d) return '—';
  try {
    const [y, m, day] = String(d).split('-');
    return `${day}/${m}/${y}`;
  } catch (_) { return String(d); }
}

function fmtTime(t) {
  if (!t) return '';
  const [hh, mm] = String(t).split(':');
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ampm}`;
}

function fmtInstant(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (_) { return String(iso); }
}

function Row({ icon: Icon, label, value }) {
  return (
    <View className="flex-row items-start py-1">
      <View className="h-7 w-7 rounded-lg bg-primary/10 items-center justify-center mr-2.5">
        <Icon size={13} color="#00008B" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-text-muted">{label}</Text>
        <Text className="text-[13px] font-bold text-text" selectable>{value || '—'}</Text>
      </View>
    </View>
  );
}

function repairServiceText(item) {
  const services = Array.isArray(item?.services)
    ? item.services.map((s) => s?.serviceName).filter(Boolean)
    : [];
  return services.length ? services.join(', ') : item?.issueSummary;
}

function MediaTile({ uri, label, video }) {
  return (
    <View className="flex-1 px-1">
      <View className="h-24 rounded-xl bg-background border border-border items-center justify-center overflow-hidden">
        {uri && !video ? (
          <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
        ) : uri && video ? (
          <Video size={22} color="#00008B" />
        ) : (
          <Camera size={20} color="#94A3B8" />
        )}
      </View>
      <Text className="text-[9px] text-text-muted text-center mt-1" numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function OwnerPickupServiceDetailScreen({ navigation, route }) {
  const id = route?.params?.id;
  const preloaded = route?.params?.booking;
  // Seed with whatever the list passed in. Avoids a flash of "Loading" and
  // sidesteps the shop-side single-booking endpoint when the list already has
  // all the fields the detail view needs.
  const [data, setData] = useState(preloaded || null);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    if (!preloaded) setLoading(true);
    setError(null);
    try {
      const res = await getShopRepairBooking(id);
      setData(res);
    } catch (e) {
      // If we already have the list-passed booking, treat fetch failures as
      // non-fatal so the user still sees customer/address info.
      if (!preloaded) setError(e?.body?.message || e?.message || 'Failed to load pickup');
    } finally {
      setLoading(false);
    }
  }, [id, preloaded]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const status = data ? (STATUS_VARIANT[data.status] || { variant: 'muted', label: data.status || 'Unknown' }) : null;
  const slot = data && (data.pickupSlotStart || data.pickupSlotEnd)
    ? `${fmtTime(data.pickupSlotStart)} – ${fmtTime(data.pickupSlotEnd)}`
    : '—';
  const serviceText = repairServiceText(data);
  const pickupAgent = data?.pickupPersonName || null;
  const isUnconfirmed = data?.status === 'ORDER_PLACED' || data?.status === 'PICKUP_REQUESTED';
  const hasDeviceImages = !!(data?.frontImageUrl || data?.backImageUrl || data?.videoUrl);
  const [confirming, setConfirming] = useState(false);

  const handleConfirmOrder = async () => {
    if (!data?.id || confirming) return;
    setConfirming(true);
    try {
      const updated = await confirmShopRepairBooking(data.id);
      setData(updated);
    } catch (e) {
      Alert.alert('Could not confirm', e?.body?.message || e?.message || 'Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleAssignPickup = () => {
    navigation.navigate('OwnerEmployeeList', {
      assignFor: 'pickup',
      bookingId: data?.id,
      bookingNumber: data?.bookingNumber,
    });
  };

  // Shop-staff "Received by Shop Staff" hand-off — only enabled when the
  // pickup person has already pinged Reached Shop (50m-validated server
  // side). Triggers the ticket mint so the booking shows up in the shop
  // owner's Bookings History list and unlocks technician assignment.
  const [receiving, setReceiving] = useState(false);
  const handleMarkReceived = async () => {
    if (!data?.id || receiving) return;
    setReceiving(true);
    try {
      const resp = await markPickupReceivedAtShop(data.id);
      await load();
      Alert.alert('Received', resp?.message || 'Device received at shop.');
    } catch (e) {
      Alert.alert('Could not confirm', e?.body?.error || e?.message || 'Please try again.');
    } finally {
      setReceiving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScreenHeader title="Pickup Details" onBack={() => navigation.goBack()} />
      {loading ? (
        <Loader />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-center">{error}</Text>
        </View>
      ) : !data ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted">No pickup data.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 24 }}>
          <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-xl bg-success/10 items-center justify-center mr-2.5">
                <Truck size={18} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>
                  {data.bookingNumber || '—'}
                </Text>
                <Text className="text-[11px] text-text-muted">Repair Pickup</Text>
              </View>
              {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
            </View>
          </View>

          <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
            <Text className="text-[12px] font-extrabold text-text mb-1">Customer & Schedule</Text>
            <Row icon={User}     label="Customer"            value={data.customerName || data.customerUserId} />
            {data.customerMobile ? (
              <Row icon={Phone}  label="Mobile"              value={data.customerMobile} />
            ) : null}
            <Row icon={Calendar} label="Pickup date"         value={fmtDate(data.pickupDate)} />
            <Row icon={Clock}    label="Slot"                value={slot} />
            <Row icon={MapPin}   label={data.pickupAddressLabel ? `Address (${data.pickupAddressLabel})` : 'Pickup address'} value={data.pickupAddressText || data.pickupAddressId} />
          </View>

          {isUnconfirmed ? (
            <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-lg bg-warning/10 items-center justify-center mr-2.5">
                  <CheckCircle2 size={16} color="#D97706" />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-[10px] text-text-muted">Service status</Text>
                  <Text className="text-[13px] font-bold text-text" numberOfLines={1}>
                    Confirm pickup request
                  </Text>
                </View>
                <Button
                  size="sm"
                  variant="primary"
                  elevated={false}
                  loading={confirming}
                  onPress={handleConfirmOrder}
                >
                  Confirm
                </Button>
              </View>
            </View>
          ) : null}

          <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
            <View className="flex-row items-center">
              <View className="h-9 w-9 rounded-lg bg-primary/10 items-center justify-center mr-2.5">
                <UserCheck size={16} color="#00008B" />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-[10px] text-text-muted">Pickup Person</Text>
                <Text className="text-[13px] font-bold text-text" numberOfLines={1}>
                  {pickupAgent || 'Not assigned'}
                </Text>
                {isUnconfirmed ? (
                  <Text className="text-[10px] text-text-muted mt-0.5">Confirm the order first</Text>
                ) : null}
              </View>
              <Button
                size="sm"
                variant={pickupAgent ? 'outline' : 'primary'}
                elevated={false}
                disabled={isUnconfirmed}
                onPress={handleAssignPickup}
              >
                {pickupAgent ? 'Reassign' : 'Assign'}
              </Button>
            </View>
          </View>

          {data.status === 'REACHED_SHOP' || data.status === 'RECEIVED_AT_SHOP' ? (
            <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
              <View className="flex-row items-center">
                <View className={`h-9 w-9 rounded-lg ${data.status === 'RECEIVED_AT_SHOP' ? 'bg-success/10' : 'bg-warning/10'} items-center justify-center mr-2.5`}>
                  <CheckCircle2 size={16} color={data.status === 'RECEIVED_AT_SHOP' ? '#16A34A' : '#D97706'} />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-[10px] text-text-muted">Shop hand-off</Text>
                  <Text className="text-[13px] font-bold text-text" numberOfLines={1}>
                    {data.status === 'RECEIVED_AT_SHOP'
                      ? `Received${data.receivedByUserName ? ' by ' + data.receivedByUserName : ''}`
                      : 'Confirm device received by shop staff'}
                  </Text>
                  {data.status === 'RECEIVED_AT_SHOP' && data.receivedAtShopAt ? (
                    <Text className="text-[10px] text-text-muted mt-0.5">{fmtInstant(data.receivedAtShopAt)}</Text>
                  ) : null}
                </View>
                {data.status === 'REACHED_SHOP' ? (
                  <Button size="sm" variant="primary" elevated={false}
                    loading={receiving} onPress={handleMarkReceived}>
                    Mark Received
                  </Button>
                ) : null}
              </View>
            </View>
          ) : null}

          <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
            <Text className="text-[12px] font-extrabold text-text mb-1">Order</Text>
            <Row icon={Hash}        label="Ticket ID"      value={data.bookingNumber || data.id} />
            <Row icon={FileText}    label="Booking UUID"   value={data.id} />
            {data.estimateAmount != null ? (
              <Row icon={IndianRupee} label="Estimate"    value={`₹${data.estimateAmount}`} />
            ) : null}
            {data.finalAmount != null ? (
              <Row icon={IndianRupee} label="Final amount" value={`₹${data.finalAmount}`} />
            ) : null}
            {serviceText ? <Row icon={FileText} label="Repair Service" value={serviceText} /> : null}
            <Row icon={Calendar} label="Created" value={fmtInstant(data.createdAt)} />
          </View>

          {hasDeviceImages ? (
            <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
              <Text className="text-[12px] font-extrabold text-text mb-2">Device Images</Text>
              <View className="flex-row -mx-1">
                <MediaTile uri={data.frontImageUrl} label="Front Side" />
                <MediaTile uri={data.backImageUrl} label="Back Side" />
                <MediaTile uri={data.videoUrl} label="Coverage" video />
              </View>
            </View>
          ) : null}

          {Array.isArray(data.events) && data.events.length > 0 ? (
            <View className="bg-card border border-border rounded-2xl px-3 py-2.5 mb-2">
              <View className="flex-row items-center mb-1.5">
                <History size={13} color="#00008B" />
                <Text className="text-[12px] font-extrabold text-text ml-1.5">Timeline</Text>
              </View>
              {data.events.map((ev) => (
                <View key={ev.id} className="flex-row py-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2" />
                  <View className="flex-1">
                    <Text className="text-[12px] font-bold text-text">{ev.status}</Text>
                    {ev.note ? <Text className="text-[11px] text-text-muted">{ev.note}</Text> : null}
                    <Text className="text-[10px] text-text-muted">{fmtInstant(ev.createdAt)} · {ev.actor || 'SYSTEM'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
