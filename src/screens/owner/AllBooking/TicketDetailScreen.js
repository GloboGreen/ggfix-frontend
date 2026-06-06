import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Smartphone,
  User,
  Phone,
  MapPin,
  Pencil,
  Clock,
  Share2,
  QrCode,
  Printer,
  ChevronRight,
  IndianRupee,
  FileText,
  UserCog,
  UserPlus,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react-native';

// Three closing booking steps the owner records by ticking + Submit on the
// Booking Details screen. Each row POSTs /tickets/{id}/progress-events; the
// customer/owner Service History rail lights up the matching row.
const OWNER_PROGRESS_ROWS = [
  { key: 'READY',     label: 'Ready for Delivery' },
  { key: 'DELIVERED', label: 'Delivered to Customer' },
  { key: 'CANCELLED', label: 'Work Cancelled' },
];
import {
  Avatar,
  Card,
  CardTitle,
  Loader,
  Badge,
  PriceRow,
  PriceDivider,
  EmptyState,
} from '../../../components/rnr';
import { confirm, notify } from '../../../components/confirm';
import { ticketApi } from '../../../api/client';

const STATUS_VARIANT = {
  CREATED:      { variant: 'softWarning', label: 'Service Accepted' },
  ASSIGNED:     { variant: 'softPrimary', label: 'Technician Assigned' },
  IN_DIAGNOSIS: { variant: 'softSecondary', label: 'In Diagnosis' },
  IN_REPAIR:    { variant: 'softSecondary', label: 'In Service' },
  QUOTED:       { variant: 'softWarning', label: 'Re-Estimated' },
  APPROVED:     { variant: 'softPrimary', label: 'Approved' },
  READY:        { variant: 'softSuccess', label: 'Out For Delivery' },
  DELIVERED:    { variant: 'softSuccess', label: 'Delivered' },
  CANCELLED:    { variant: 'softDanger',  label: 'Cancelled' },
};

// Statuses that imply the technician has actively picked up the job.
// Anything earlier (or just an assigned id without progress) means the
// technician has not accepted yet — owner can re-assign.
const ACCEPTED_STATUSES = new Set([
  'IN_DIAGNOSIS', 'IN_REPAIR', 'QUOTED', 'APPROVED', 'READY', 'DELIVERED',
]);

const ACTION_TILES = [
  { key: 'view',    label: 'View Details',   icon: FileText, color: '#00008B', bg: 'bg-primary/10' },
  { key: 'history', label: 'View History',   icon: Clock,    color: '#7C3AED', bg: 'bg-primary/10' },
  { key: 'share',   label: 'Share Receipt',  icon: Share2,   color: '#10B981', bg: 'bg-success/10' },
  { key: 'barcode', label: 'Barcode',        icon: QrCode,   color: '#F59E0B', bg: 'bg-warning/10' },
  { key: 'eprint',  label: 'E-Print',        icon: Printer,  color: '#EF4444', bg: 'bg-danger/10' },
];

function priceItemsFromTicket(ticket) {
  if (Array.isArray(ticket.priceItems)) return ticket.priceItems;
  if (ticket.priceItemsJson) {
    try {
      const parsed = JSON.parse(ticket.priceItemsJson);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return ticket.services?.map?.((s) => ({ id: s.id, label: s.serviceName, amount: s.price })) || [];
}

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.get(`/tickets/${ticketId}`);
      setTicket(data);
      if (data?.assignedTechnicianId) {
        try {
          const list = await ticketApi.get('/technicians');
          const arr = Array.isArray(list) ? list : (list?.content || []);
          setTechnician(arr.find((x) => x.id === data.assignedTechnicianId) || null);
        } catch (_) { setTechnician(null); }
      } else {
        setTechnician(null);
      }
    } catch (e) {
      setError(e.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Reload on focus — picks up EditBooking + AssignTechnician changes when user comes back.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Service Progress (owner-side) — Ready / Delivered / Cancelled checklist.
  // Pre-ticks rows the OWNER has already submitted; auto-emitted macro-status
  // events (actor=SHOP / SYSTEM) leave the checkbox empty so the owner still
  // has to take the action manually.
  const [progressChecked, setProgressChecked] = useState({});
  const [progressDone, setProgressDone] = useState({});
  const [progressBusy, setProgressBusy] = useState(null);

  const refreshProgress = useCallback(async () => {
    if (!ticketId) return;
    try {
      const rows = await ticketApi.get(`/tickets/${ticketId}/events`);
      const done = {};
      (Array.isArray(rows) ? rows : []).forEach((e) => {
        const k = (e.status || '').toUpperCase();
        const actor = (e.actor || '').toUpperCase();
        if (actor === 'OWNER' && OWNER_PROGRESS_ROWS.some((r) => r.key === k)) {
          done[k] = true;
        }
      });
      setProgressDone(done);
    } catch { /* keep current */ }
  }, [ticketId]);

  useEffect(() => { refreshProgress(); }, [refreshProgress]);

  const submitProgress = useCallback(async (row) => {
    if (!progressChecked[row.key] && !progressDone[row.key]) {
      notify('Tick the box first', `Check "${row.label}" before submitting.`);
      return;
    }
    setProgressBusy(row.key);
    try {
      await ticketApi.post(`/tickets/${ticketId}/progress-events`, {
        body: { statusKey: row.key, actor: 'OWNER' },
      });
      setProgressChecked((prev) => ({ ...prev, [row.key]: false }));
      refreshProgress();
      notify('Saved', `"${row.label}" recorded.`);
    } catch (e) {
      notify('Save failed', e?.message || 'Try again');
    } finally {
      setProgressBusy(null);
    }
  }, [ticketId, progressChecked, progressDone, refreshProgress]);

  const handleShare = async () => {
    if (!ticket) return;
    const lineItems = priceItemsFromTicket(ticket);
    const total = ticket.estimatedPrice || lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const message =
      `🧾 GGFix Booking Receipt\n\n` +
      `Tracking ID: ${ticket.trackingId || ticket.id}\n` +
      `Customer: ${ticket.customerName || '-'}\n` +
      `Mobile: ${ticket.customerPhone || '-'}\n` +
      `Device: ${ticket.deviceDisplayName || ticket.deviceModelName || ticket.modelName || '-'}\n` +
      `Status: ${ticket.status || '-'}\n\n` +
      `Services:\n` +
      lineItems.map((i) => `  • ${i.label} — ₹${i.amount}`).join('\n') +
      `\n\nEstimated Total: ₹${total}\n\n` +
      `Track your repair in the GGFix app.`;
    try {
      await Share.share({ message, title: `Booking ${ticket.trackingId || ticket.id}` });
    } catch (e) {
      notify('Share failed', e?.message || 'Could not open share sheet');
    }
  };

  if (loading && !ticket) return <Loader label="Loading booking..." />;
  if (error || !ticket) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          title="Booking not found"
          description={error || 'We could not load this booking.'}
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const trackingId = ticket.trackingId || ticket.id;
  const deviceName = ticket.deviceDisplayName || ticket.deviceModelName || ticket.modelName || 'Device';
  const color = ticket.color;
  const ramLabel = ticket.ramLabel;
  const storageLabel = ticket.storageLabel;
  const statusKey = String(ticket.status || '').toUpperCase();
  const statusMeta = STATUS_VARIANT[statusKey] || { variant: 'softPrimary', label: ticket.status || 'Pending' };
  const customerName = ticket.customerName || '—';
  const phone = ticket.customerPhone || '';
  const address = ticket.customerAddress || '';

  const lineItems = priceItemsFromTicket(ticket);
  const estimatedTotal = ticket.estimatedPrice != null
    ? ticket.estimatedPrice
    : lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const hasTechnician = !!ticket.assignedTechnicianId;
  const techAccepted = hasTechnician && ACCEPTED_STATUSES.has(statusKey);
  const techName = technician?.name || (hasTechnician ? 'Assigned Technician' : null);
  const techCode = technician?.code
    || (technician?.id ? String(technician.id).slice(0, 8).toUpperCase() : null);

  const goToAssign = () => {
    navigation.navigate('AssignTechnician', {
      tickets: [ticket],
      customer: {
        id: ticket.customerId,
        name: ticket.customerName,
        phone: ticket.customerPhone,
        address: ticket.customerAddress,
      },
      devices: [{
        id: ticket.id,
        deviceDisplayName: deviceName,
        model: { name: deviceName },
      }],
      returnToTicketId: ticket.id,
    });
  };

  const onAssignPress = async () => {
    const ok = await confirm({
      title: 'Assign Technician',
      message: `Pick a technician for booking ${trackingId}?`,
      confirmText: 'Choose Technician',
    });
    if (ok) goToAssign();
  };

  const onReassignPress = async () => {
    const ok = await confirm({
      title: 'Re-Assign Technician',
      message: `${techName || 'Current technician'} hasn't accepted this booking yet. Re-assign to someone else?`,
      confirmText: 'Re-Assign',
      destructive: true,
    });
    if (ok) goToAssign();
  };

  const onAction = (key) => {
    switch (key) {
      case 'view':    navigation.navigate('DeviceDetail', { ticketId: ticket.id }); break;
      case 'history': navigation.navigate('BookingTimeline', { ticketId: ticket.id }); break;
      case 'share':   handleShare(); break;
      case 'barcode': navigation.navigate('BarcodePrint', { ticketId: ticket.id, mode: 'barcode' }); break;
      case 'eprint':  navigation.navigate('DeliveryInvoice', { ticketId: ticket.id }); break;
      default:        break;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        {/* Hero — tracking + device on left, status badge on right */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-start">
            {ticket.deviceImageUrl ? (
              <Image
                source={{ uri: ticket.deviceImageUrl }}
                style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 10 }}
              />
            ) : (
              <View className="w-[52px] h-[52px] rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                <Smartphone size={22} color="#00008B" />
              </View>
            )}
            <View className="flex-1 pr-2 min-w-0">
              <Text className="text-[10px] text-text-muted">Tracking</Text>
              <Text className="text-[12px] font-extrabold text-text" numberOfLines={1} adjustsFontSizeToFit>
                {trackingId}
              </Text>
              <Text className="text-[12px] font-bold text-text mt-1" numberOfLines={2}>{deviceName}</Text>
              <Text className="text-[10px] text-text-muted" numberOfLines={1}>
                {[color, ramLabel, storageLabel].filter(Boolean).join(' · ') || '—'}
              </Text>
            </View>
            <View className="items-end shrink-0" style={{ maxWidth: 96 }}>
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </View>
          </View>
        </Card>

        {/* Customer */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <User size={14} color="#00008B" />
            <CardTitle className="ml-2">Customer Details</CardTitle>
          </View>
          <DetailRow icon={<User size={12} color="#64748B" />}  label="Name"    value={customerName} />
          {phone   ? <DetailRow icon={<Phone size={12} color="#64748B" />}  label="Mobile"  value={phone} /> : null}
          {address ? <DetailRow icon={<MapPin size={12} color="#64748B" />} label="Address" value={address} multiline /> : null}
        </Card>

        {/* Technician — sits right under Customer per owner-flow request */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <UserCog size={14} color="#7C3AED" />
            <CardTitle className="ml-2">Technician Details</CardTitle>
          </View>

          {!hasTechnician ? (
            <View>
              <Text className="text-[12px] text-text-muted mb-2.5">
                No technician assigned to this booking yet.
              </Text>
              <Pressable
                onPress={onAssignPress}
                className="bg-primary rounded-xl py-2.5 flex-row items-center justify-center active:opacity-90"
              >
                <UserPlus size={14} color="#fff" />
                <Text className="text-white text-[12px] font-extrabold ml-1.5">Assign Technician</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Avatar fallback={(techName || '?').slice(0, 2).toUpperCase()} size={36} />
              <View className="flex-1 ml-2.5 min-w-0">
                <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>
                  {techName}{techCode ? ` - ${techCode}` : ''}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  {techAccepted ? (
                    <>
                      <CheckCircle2 size={11} color="#10B981" />
                      <Text className="text-[10px] font-semibold text-success ml-1">Accepted</Text>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={11} color="#EF4444" />
                      <Text className="text-[10px] font-semibold text-error ml-1">
                        Technician assign Not accepted
                      </Text>
                    </>
                  )}
                </View>
              </View>
              {!techAccepted ? (
                <Pressable
                  onPress={onReassignPress}
                  className="bg-primary/10 rounded-xl px-2.5 py-2 flex-row items-center active:opacity-80"
                >
                  <RefreshCcw size={12} color="#00008B" />
                  <Text className="text-primary text-[11px] font-extrabold ml-1">Re-Assign</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </Card>

        {/* Services / Price */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <IndianRupee size={14} color="#10B981" />
            <CardTitle className="ml-2">Price Summary</CardTitle>
          </View>
          {lineItems.length === 0 ? (
            <Text className="text-[12px] text-text-muted">No service items recorded.</Text>
          ) : (
            <>
              {lineItems.map((item, idx) => (
                <View key={item.id || idx} className="flex-row items-center py-1">
                  <View className="h-5 w-5 rounded-full border border-border items-center justify-center mr-2">
                    <Text className="text-[10px] font-bold text-text">{idx + 1}</Text>
                  </View>
                  <Text className="text-[12px] text-text flex-1" numberOfLines={1}>{item.label}</Text>
                  <Text className="text-[12px] font-bold text-text">₹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
                </View>
              ))}
              <PriceDivider />
              <PriceRow label="Estimated Repair Amount" value={`₹${Number(estimatedTotal).toLocaleString('en-IN')}`} bold />
            </>
          )}
        </Card>

        {/* Actions */}
        <Text className="text-[10px] font-extrabold text-text-muted tracking-widest px-1 mb-1.5 mt-1">QUICK ACTIONS</Text>
        <View className="flex-row flex-wrap -mx-1">
          {ACTION_TILES.map((a) => {
            const Icon = a.icon;
            return (
              <View key={a.key} style={{ width: '33.333%' }} className="p-1">
                <Pressable
                  onPress={() => onAction(a.key)}
                  className="bg-card border border-border rounded-xl px-2 py-2.5 items-center active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                >
                  <View className={`h-9 w-9 rounded-xl items-center justify-center mb-1.5 ${a.bg}`}>
                    <Icon size={16} color={a.color} />
                  </View>
                  <Text className="text-[10px] font-extrabold text-text text-center" numberOfLines={1}>{a.label}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Edit shortcut — enters the full multi-step booking flow at Select Brand
            (Brand → Series → Model → Color & Storage → Device Services → …) with the
            existing ticket prefilled, then PUTs the same ticket on submit. */}
        <Pressable
          onPress={() => navigation.navigate('SelectDeviceBrand', buildEditParams(ticket, { lineItems, estimatedTotal }))}
          className="bg-primary rounded-xl p-3 flex-row items-center mt-3 active:opacity-90"
          style={{ shadowColor: '#00008B', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
        >
          <View className="h-10 w-10 rounded-xl bg-white/15 items-center justify-center mr-2.5">
            <Pencil size={16} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-[13px] font-extrabold">Edit this booking</Text>
            <Text className="text-white/80 text-[10px] mt-0.5">Update services, price, status & notes</Text>
          </View>
          <ChevronRight size={16} color="#fff" />
        </Pressable>

        {/* Service Progress checklist — owner records the closing booking steps
            (Ready for Delivery / Delivered to Customer / Work Cancelled). Each
            Submit POSTs /tickets/{id}/progress-events with actor=OWNER; the
            customer's Service History rail lights up that step in real time. */}
        <Text className="text-[13px] font-extrabold text-text mt-5 mb-2">Service Progress</Text>
        <View
          className="bg-white rounded-md overflow-hidden"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <View className="flex-row" style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 6 }}>
            <Text className="text-[10px] font-bold text-text-muted" style={{ width: 28 }}>S.No</Text>
            <Text className="text-[10px] font-bold text-text-muted flex-1">Status</Text>
            <Text className="text-[10px] font-bold text-text-muted" style={{ width: 40, textAlign: 'center' }}>Tick</Text>
            <Text className="text-[10px] font-bold text-text-muted" style={{ width: 64, textAlign: 'center' }}>Action</Text>
          </View>
          {OWNER_PROGRESS_ROWS.map((row, idx) => {
            const checked = !!progressChecked[row.key];
            const done = !!progressDone[row.key];
            const busy = progressBusy === row.key;
            return (
              <View
                key={row.key}
                className="flex-row items-center"
                style={{
                  paddingHorizontal: 8, paddingVertical: 8,
                  borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: '#F1F5F9',
                  backgroundColor: done ? '#F0FDF4' : '#FFFFFF',
                }}
              >
                <Text className="text-[11px] text-text" style={{ width: 28 }}>{idx + 1}</Text>
                <Text className={`text-[12px] flex-1 ${done ? 'font-bold' : ''} text-text`}>{row.label}</Text>
                <View style={{ width: 40, alignItems: 'center' }}>
                  <Pressable
                    onPress={() => setProgressChecked((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
                    style={{
                      width: 20, height: 20, borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: checked || done ? '#22C55E' : '#94A3B8',
                      backgroundColor: checked || done ? '#22C55E' : '#FFFFFF',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {(checked || done) ? <Check size={14} color="#FFFFFF" /> : null}
                  </Pressable>
                </View>
                <View style={{ width: 64, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => submitProgress(row)}
                    disabled={busy}
                    className="rounded-md"
                    style={{
                      backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 5,
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    {busy
                      ? <ActivityIndicator color="#FFFFFF" size="small" />
                      : <Text className="text-white text-[10px] font-bold">Submit</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// Maps a ticket loaded from /tickets/{id} into the params shape the
// owner service-booking flow screens expect. `editMode` + `editTicketId`
// tell the final ServiceBookingDevicesList to PUT instead of POST.
function buildEditParams(ticket, { lineItems, estimatedTotal }) {
  const services = (lineItems || []).map((it) => ({
    serviceId: it.serviceId || it.id || null,
    serviceCode: it.serviceCode || it.code || null,
    serviceName: it.serviceName || it.label || 'Service',
    price: Number(it.amount ?? it.price) || 0,
    warranty: it.warranty || null,
  }));

  let missingParts = [];
  if (ticket.missingPartsJson) {
    try { const p = JSON.parse(ticket.missingPartsJson); if (Array.isArray(p)) missingParts = p; } catch (_) {}
  }

  let devicePhotos = {};
  if (ticket.devicePhotosJson) {
    try { const p = JSON.parse(ticket.devicePhotosJson); if (p && typeof p === 'object') devicePhotos = p; } catch (_) {}
  }

  const modelName = ticket.deviceDisplayName || ticket.deviceModelName || ticket.modelName || 'Device';
  const customer = {
    id: ticket.customerId,
    name: ticket.customerName,
    phone: ticket.customerPhone,
    address: ticket.customerAddress,
  };

  return {
    // edit-mode flags consumed by ServiceBookingDevicesList
    editMode: true,
    editTicketId: ticket.id,
    trackingId: ticket.trackingId,
    // device identity (carried through every step)
    customerId: ticket.customerId,
    customer,
    brandId: ticket.brandId,
    modelId: ticket.modelId,
    ramOptionId: ticket.ramOptionId,
    storageOptionId: ticket.storageOptionId,
    color: ticket.color,
    modelName,
    imageUrl: ticket.deviceImageUrl,
    ramLabel: ticket.ramLabel,
    storageLabel: ticket.storageLabel,
    // prefill payload — each downstream screen reads what it needs
    prefillServices: services,
    prefillImei: ticket.imei || '',
    prefillComplaint: ticket.issueDescription || '',
    prefillEstimatedReadyIso: ticket.estimatedReadyAt || null,
    prefillEstimatedDeliveryIso: ticket.estimatedDeliveryAt || null,
    prefillCustomerApproved: ticket.customerApproval ?? false,
    prefillDevicePhotos: devicePhotos,
    prefillMissingParts: missingParts,
    prefillLock: {
      type: ticket.deviceSecurityType || 'NONE',
      value: ticket.deviceSecurityValue || '',
    },
    prefillEstimatedPrice: estimatedTotal,
  };
}

function DetailRow({ icon, label, value, multiline }) {
  return (
    <View className="flex-row items-start py-1">
      <View className="w-4 items-center mr-1.5 mt-1">{icon}</View>
      <Text className="text-[11px] text-text-muted w-20">{label}</Text>
      <Text
        className="text-[12px] text-text flex-1"
        numberOfLines={multiline ? 3 : 1}
      >
        {value}
      </Text>
    </View>
  );
}
