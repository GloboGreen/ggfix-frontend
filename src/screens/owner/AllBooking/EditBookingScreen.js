import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Smartphone,
  IndianRupee,
  Hash,
  FileText,
  CalendarClock,
  Truck,
  Wrench,
  ShieldCheck,
  Save,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import {
  BottomActionBar,
  Card,
  CardTitle,
  Input,
  Label,
  Loader,
  PriceDivider,
  PriceRow,
  Badge,
} from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { ticketApi } from '../../../api/client';

export default function EditBookingScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [approxDate, setApproxDate] = useState('');
  const [approxTime, setApproxTime] = useState('');
  const [approxDuration, setApproxDuration] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [approved, setApproved] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.get(`/tickets/${ticketId}`);
      setTicket(data);
      if (data?.imei) setImei(String(data.imei));
      if (data?.issueDescription) setNotes(data.issueDescription);
      if (data?.estimatedApproxDate) setApproxDate(data.estimatedApproxDate);
      if (data?.estimatedApproxTime) setApproxTime(data.estimatedApproxTime);
      if (data?.estimatedApproxDuration) setApproxDuration(String(data.estimatedApproxDuration));
      if (data?.estimatedDeliveryAt) setDeliveryDate(data.estimatedDeliveryAt);
      setApproved(Boolean(data?.customerApproved));
    } catch (e) {
      setError(e.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { load(); }, [load]);

  if (loading && !ticket) return <Loader label="Loading booking..." />;

  const lineItems = ticket?.priceItems
    || ticket?.services?.map?.((s) => ({ id: s.id, label: s.serviceName, amount: s.price }))
    || [];
  const estimatedTotal = ticket?.estimatedPrice != null
    ? ticket.estimatedPrice
    : lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const saveAndBack = async () => {
    setSaving(true);
    try {
      // PATCH (partial update) instead of PUT so we don't have to resend
      // every NotNull field like customerId/brandId/modelId. Backend supports
      // it via @PatchMapping("/{id}") with Map<String,Object> body.
      await ticketApi.patch(`/tickets/${ticketId}`, {
        body: {
          imei,
          issueDescription: notes,
          estimatedApproxDate: approxDate,
          estimatedApproxTime: approxTime,
          estimatedApproxDuration: approxDuration,
          estimatedDeliveryAt: deliveryDate,
          customerApproved: approved,
        },
      });
      // useFocusEffect on TicketDetail + BookingHistory will re-fetch automatically.
      navigation.goBack();
    } catch (e) {
      notify('Save failed', e?.message || 'Could not update booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 12, paddingBottom: 130 }}>
        {error ? (
          <View className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 mb-2">
            <Text className="text-[12px] text-danger">{error}</Text>
          </View>
        ) : null}

        {/* Device summary */}
        {ticket ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-start">
              <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                <Smartphone size={18} color="#00008B" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest">Editing</Text>
                <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>
                  {ticket.deviceModelName || ticket.modelName || 'Device'}
                </Text>
                <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>
                  {ticket.trackingId || ticketId}
                </Text>
              </View>
              <Badge variant="softPrimary">EDIT</Badge>
            </View>
          </Card>
        ) : null}

        {/* Price */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <IndianRupee size={14} color="#10B981" />
            <CardTitle className="ml-2">Price Summary</CardTitle>
          </View>
          {lineItems.length === 0 ? (
            <Text className="text-[12px] text-text-muted">No service items yet.</Text>
          ) : lineItems.map((item, idx) => (
            <View key={item.id || idx} className="flex-row items-center py-1">
              <View className="h-5 w-5 rounded-full border border-border items-center justify-center mr-2">
                <Text className="text-[10px] font-bold text-text">{idx + 1}</Text>
              </View>
              <Text className="text-[12px] text-text flex-1" numberOfLines={1}>{item.label}</Text>
              <Text className="text-[12px] font-bold text-text">â‚¹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
            </View>
          ))}
          <PriceDivider />
          <PriceRow label="Estimated Repair Amount" value={`â‚¹${Number(estimatedTotal).toLocaleString('en-IN')}`} bold />
        </Card>

        {/* IMEI + Notes */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <Hash size={14} color="#00008B" />
            <CardTitle className="ml-2">IMEI & Notes</CardTitle>
          </View>
          <Label className="text-[11px] mb-1">IMEI Number</Label>
          <Input
            placeholder="Enter IMEI or scan"
            value={imei}
            onChangeText={setImei}
            keyboardType="number-pad"
            className="py-2 text-[13px] mb-2"
          />
          <Label className="text-[11px] mb-1">Complaint Notes</Label>
          <Input
            placeholder="Describe the issue..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="py-2 text-[13px] min-h-[64px]"
            style={{ textAlignVertical: 'top' }}
          />
        </Card>

        {/* Times */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <CalendarClock size={14} color="#F59E0B" />
            <CardTitle className="ml-2">Estimated Times</CardTitle>
          </View>
          <Label className="text-[11px] mb-1">Approximate date</Label>
          <Input
            placeholder="e.g. Sat, Dec 27 2025"
            value={approxDate}
            onChangeText={setApproxDate}
            className="py-2 text-[13px] mb-2"
          />
          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Label className="text-[11px] mb-1">Time</Label>
              <Input
                placeholder="6:30 PM"
                value={approxTime}
                onChangeText={setApproxTime}
                className="py-2 text-[13px]"
              />
            </View>
            <View className="px-1 flex-1">
              <Label className="text-[11px] mb-1">Duration</Label>
              <Input
                placeholder="2 Hr"
                value={approxDuration}
                onChangeText={setApproxDuration}
                className="py-2 text-[13px]"
              />
            </View>
          </View>
          <View className="mt-2">
            <Label className="text-[11px] mb-1">Delivery date / time</Label>
            <Input
              placeholder="e.g. Sat, Dec 27 2025 8:30 PM"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              className="py-2 text-[13px]"
            />
          </View>
        </Card>

        {/* Approval */}
        <Pressable
          onPress={() => setApproved((v) => !v)}
          className={`rounded-xl border p-2.5 flex-row items-center mb-2.5 active:opacity-80 ${approved ? 'bg-success/5 border-success' : 'bg-card border-border'}`}
        >
          <View className={`h-5 w-5 rounded-md border-2 items-center justify-center mr-2 ${approved ? 'bg-success border-success' : 'border-border'}`}>
            {approved ? <Check size={12} color="#fff" /> : null}
          </View>
          <Text className={`text-[12px] font-bold flex-1 ${approved ? 'text-success' : 'text-text'}`}>
            Customer Repair Approval
          </Text>
          {approved ? <Badge variant="softSuccess">DONE</Badge> : null}
        </Pressable>

        {/* Sub-flows */}
        <Card className="rounded-2xl mb-2.5" padded={false}>
          <SubLink
            icon={<Wrench size={14} color="#2563EB" />}
            label="Device Missing / Damage Parts"
            onPress={() => navigation.navigate('DeviceMissingParts', { ticketId })}
            divider
          />
          <SubLink
            icon={<ShieldCheck size={14} color="#10B981" />}
            label="Device Security"
            onPress={() => navigation.navigate('DeviceSecurity', { ticketId })}
            divider
          />
          <SubLink
            icon={<FileText size={14} color="#7C3AED" />}
            label="Device Information"
            onPress={() => navigation.navigate('DeviceInformation', { ticketId })}
          />
        </Card>
      </ScrollView>

      <BottomActionBar
        title={saving ? 'Saving...' : 'Save Changes'}
        onPress={saveAndBack}
        loading={saving}
      />
    </View>
  );
}

function SubLink({ icon, label, onPress, divider }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-3 py-2.5 active:opacity-70 ${divider ? 'border-b border-border' : ''}`}
    >
      <View className="h-7 w-7 rounded-full bg-background items-center justify-center mr-2.5">{icon}</View>
      <Text className="flex-1 text-[12px] font-semibold text-text">{label}</Text>
      <ChevronRight size={14} color="#94A3B8" />
    </Pressable>
  );
}

