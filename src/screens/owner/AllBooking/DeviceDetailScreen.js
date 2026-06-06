import React, { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Smartphone,
  Clock,
  FileText,
  CalendarClock,
  CheckCircle2,
  Camera,
  PlayCircle,
  ShieldCheck,
  PackageX,
  UserCog,
  IndianRupee,
} from 'lucide-react-native';
import {
  Card,
  CardTitle,
  Loader,
  EmptyState,
  PriceRow,
  PriceDivider,
} from '../../../components/rnr';
import { ticketApi } from '../../../api/client';

function parseDevicePhotos(ticket) {
  if (ticket?.devicePhotosJson) {
    try {
      const p = JSON.parse(ticket.devicePhotosJson);
      if (p && typeof p === 'object') return p;
    } catch (_) {}
  }
  return {};
}

// technicianPhotosJson is a flat URL array submitted by the employee app.
// Items may be strings or { url } objects — normalize to string[].
function parseTechnicianPhotos(ticket) {
  if (!ticket?.technicianPhotosJson) return [];
  try {
    const p = JSON.parse(ticket.technicianPhotosJson);
    if (!Array.isArray(p)) return [];
    return p
      .map((x) => (typeof x === 'string' ? x : (x?.url || x?.uri || x?.imageUrl || null)))
      .filter(Boolean);
  } catch (_) { return []; }
}

function parseMissingParts(ticket) {
  if (!ticket?.missingPartsJson) return [];
  try {
    const p = JSON.parse(ticket.missingPartsJson);
    if (Array.isArray(p)) return p.map((x) => (typeof x === 'string' ? x : (x?.name || x?.label))).filter(Boolean);
  } catch (_) {}
  return [];
}

function priceItemsFromTicket(ticket) {
  if (Array.isArray(ticket?.priceItems)) return ticket.priceItems;
  if (ticket?.priceItemsJson) {
    try {
      const parsed = JSON.parse(ticket.priceItemsJson);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return ticket?.services?.map?.((s) => ({ id: s.id, label: s.serviceName, amount: s.price })) || [];
}

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export default function DeviceDetailScreen({ route, navigation }) {
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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading && !ticket) return <Loader label="Loading device details..." />;
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
  const lineItems = priceItemsFromTicket(ticket);
  const estimatedTotal = ticket.estimatedPrice != null
    ? ticket.estimatedPrice
    : lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const photos = parseDevicePhotos(ticket);
  const technicianPhotos = parseTechnicianPhotos(ticket);
  const missingParts = parseMissingParts(ticket);
  const readyAtText = formatDateTime(ticket.estimatedReadyAt);
  const deliveryAtText = formatDateTime(ticket.estimatedDeliveryAt);
  const approvalText = ticket.customerApproval === true ? 'Done'
    : ticket.customerApproval === false ? 'Pending' : null;
  const securityType = ticket.deviceSecurityType && ticket.deviceSecurityType !== 'NONE'
    ? ticket.deviceSecurityType : null;
  const securityValue = ticket.deviceSecurityValue || null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        {/* Hero */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-start">
            {ticket.deviceImageUrl ? (
              <Image
                source={{ uri: ticket.deviceImageUrl }}
                style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 10 }}
              />
            ) : (
              <View className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                <Smartphone size={24} color="#00008B" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted">Tracking ID</Text>
              <Text className="text-[13px] font-extrabold text-text" numberOfLines={2}>#{trackingId}</Text>
              <Text className="text-[12px] text-text mt-1" numberOfLines={2}>
                <Text className="text-text-muted">Device: </Text>{deviceName}
              </Text>
              {ticket.color ? (
                <Text className="text-[11px] text-text-muted mt-0.5">Color: {ticket.color}</Text>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Price Summary */}
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
                  <Text className="text-[12px] font-bold text-text">₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              ))}
              <PriceDivider />
              <PriceRow label="Estimated Repair Amount" value={`₹${Number(estimatedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bold />
            </>
          )}
        </Card>

        {/* Complaint */}
        {ticket.issueDescription ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center mb-1.5">
              <FileText size={14} color="#2563EB" />
              <CardTitle className="ml-2">Complaint Issue</CardTitle>
            </View>
            <Text className="text-[12px] text-text" numberOfLines={6}>{ticket.issueDescription}</Text>
          </Card>
        ) : null}

        {/* Schedule + Approval */}
        {(readyAtText || deliveryAtText || approvalText) ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center mb-1.5">
              <CalendarClock size={14} color="#F59E0B" />
              <CardTitle className="ml-2">Service Schedule</CardTitle>
            </View>
            {readyAtText ? (
              <Row icon={<Clock size={12} color="#64748B" />} label="Approx. Time" value={readyAtText} />
            ) : null}
            {deliveryAtText ? (
              <Row icon={<CalendarClock size={12} color="#64748B" />} label="Delivery" value={deliveryAtText} />
            ) : null}
            {approvalText ? (
              <View className="flex-row items-start py-1">
                <View className="w-4 items-center mr-1.5 mt-1">
                  <CheckCircle2 size={12} color={approvalText === 'Done' ? '#10B981' : '#94A3B8'} />
                </View>
                <Text className="text-[11px] text-text-muted w-20">Approval</Text>
                <Text className={`text-[12px] font-bold ${approvalText === 'Done' ? 'text-success' : 'text-text-muted'}`}>
                  {approvalText}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Device Photos */}
        {(photos.front || photos.back || photos.video) ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center mb-2">
              <Camera size={14} color="#7C3AED" />
              <CardTitle className="ml-2">Device Photos</CardTitle>
            </View>
            <View className="flex-row -mx-1">
              <PhotoSlot label="Front Side" uri={photos.front} icon={Camera} />
              <PhotoSlot label="Back Side" uri={photos.back} icon={Camera} />
              <PhotoSlot label="Full Coverage Video" uri={photos.video} icon={PlayCircle} />
            </View>
          </Card>
        ) : null}

        {/* Device Security */}
        {(securityType || securityValue) ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center mb-1.5">
              <ShieldCheck size={14} color="#0EA5E9" />
              <CardTitle className="ml-2">Device Security</CardTitle>
            </View>
            <Text className="text-[12px] text-text">
              {[securityType, securityValue].filter(Boolean).join(' - ')}
            </Text>
          </Card>
        ) : null}

        {/* Missing / Damage Parts */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-1.5">
            <PackageX size={14} color="#EF4444" />
            <CardTitle className="ml-2">Device Missing / Damage Parts</CardTitle>
          </View>
          {missingParts.length === 0 ? (
            <Text className="text-[12px] text-text-muted">Nill</Text>
          ) : (
            <View>
              {missingParts.map((p, i) => (
                <Text key={i} className="text-[12px] text-text py-0.5">• {p}</Text>
              ))}
            </View>
          )}
        </Card>

        {/* Technician */}
        {(ticket.assignedTechnicianId || technician) ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center mb-1.5">
              <UserCog size={14} color="#00008B" />
              <CardTitle className="ml-2">Technician</CardTitle>
            </View>
            <Text className="text-[12px] font-bold text-text">
              {(technician?.name || 'Assigned')}
              {technician?.id ? <Text className="text-text-muted font-normal"> — {String(technician.id).slice(0, 8).toUpperCase()}</Text> : null}
            </Text>
            {technician?.roleLabel ? (
              <Text className="text-[11px] text-text-muted mt-0.5">{technician.roleLabel}</Text>
            ) : null}
          </Card>
        ) : null}

        {/* Technician uploaded device photos */}
        {(ticket.assignedTechnicianId || technician || technicianPhotos.length > 0) ? (
          <Card className="rounded-2xl mb-2.5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>
                {(technician?.name || ticket.assignedTechnicianName || 'Technician')}
                {technician?.id ? (
                  <Text className="text-text-muted font-normal"> — {String(technician.id).slice(0, 8).toUpperCase()}</Text>
                ) : ticket.assignedTechnicianCode ? (
                  <Text className="text-text-muted font-normal"> — {ticket.assignedTechnicianCode}</Text>
                ) : null}
              </Text>
              <Text className="text-[11px] text-text-muted ml-2">Technician uploaded device photos</Text>
            </View>
            <View className="flex-row -mx-1">
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: '33.333%' }} className="p-1">
                  <View
                    className="rounded-xl items-center justify-center overflow-hidden bg-background"
                    style={{ aspectRatio: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A5B4FC' }}
                  >
                    {technicianPhotos[i] ? (
                      <Image source={{ uri: technicianPhotos[i] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View className="items-center px-2">
                        <Camera size={18} color="#94A3B8" />
                        <Text className="text-[9px] text-text-muted text-center mt-1">Take a photo of the device</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PhotoSlot({ label, uri, icon: Icon }) {
  return (
    <View style={{ width: '33.333%' }} className="p-1">
      <Text className="text-[10px] font-bold text-text-muted text-center mb-1" numberOfLines={1}>{label}</Text>
      <View
        className="border border-dashed border-secondary/60 rounded-lg overflow-hidden items-center justify-center bg-background"
        style={{ aspectRatio: 1 }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Icon size={20} color="#94A3B8" />
        )}
      </View>
    </View>
  );
}

function Row({ icon, label, value }) {
  return (
    <View className="flex-row items-start py-1">
      <View className="w-4 items-center mr-1.5 mt-1">{icon}</View>
      <Text className="text-[11px] text-text-muted w-20">{label}</Text>
      <Text className="text-[12px] text-text flex-1">{value}</Text>
    </View>
  );
}
