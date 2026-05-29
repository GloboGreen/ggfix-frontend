import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Share, Text, View } from 'react-native';
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
  Wrench,
  ChevronRight,
  IndianRupee,
} from 'lucide-react-native';
import {
  Card,
  CardTitle,
  Loader,
  Badge,
  PriceRow,
  PriceDivider,
  EmptyState,
} from '../../../components/rnr';
import { notify } from '../../../components/confirm';
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

const ACTION_TILES = [
  { key: 'edit',    label: 'Edit Booking',   icon: Pencil,  color: '#2563EB', bg: 'bg-secondary/10' },
  { key: 'history', label: 'View History',   icon: Clock,   color: '#7C3AED', bg: 'bg-primary/10' },
  { key: 'share',   label: 'Share Receipt',  icon: Share2,  color: '#10B981', bg: 'bg-success/10' },
  { key: 'barcode', label: 'Barcode',        icon: QrCode,  color: '#F59E0B', bg: 'bg-warning/10' },
  { key: 'eprint',  label: 'E-Print',        icon: Printer, color: '#EF4444', bg: 'bg-danger/10' },
];

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.get(`/tickets/${ticketId}`);
      setTicket(data);
    } catch (e) {
      setError(e.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Reload on focus â€” picks up EditBooking changes when user comes back.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleShare = async () => {
    if (!ticket) return;
    const lineItems = ticket.priceItems || ticket.services?.map?.((s) => ({ label: s.serviceName, amount: s.price })) || [];
    const total = ticket.estimatedPrice || lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const message =
      `ðŸ§¾ GGFix Booking Receipt\n\n` +
      `Tracking ID: ${ticket.trackingId || ticket.id}\n` +
      `Customer: ${ticket.customerName || '-'}\n` +
      `Mobile: ${ticket.customerPhone || '-'}\n` +
      `Device: ${ticket.deviceModelName || ticket.modelName || '-'}\n` +
      `Status: ${ticket.status || '-'}\n\n` +
      `Services:\n` +
      lineItems.map((i) => `  â€¢ ${i.label} â€” â‚¹${i.amount}`).join('\n') +
      `\n\nEstimated Total: â‚¹${total}\n\n` +
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
  const deviceName = ticket.deviceModelName || ticket.modelName || 'Device';
  const color = ticket.color;
  const ramLabel = ticket.ramLabel;
  const storageLabel = ticket.storageLabel;
  const statusMeta = STATUS_VARIANT[String(ticket.status || '').toUpperCase()] || { variant: 'softPrimary', label: ticket.status || 'Pending' };
  const customerName = ticket.customerName || 'â€”';
  const phone = ticket.customerPhone || '';
  const address = ticket.customerAddress || '';

  const lineItems = ticket.priceItems
    || ticket.services?.map?.((s) => ({ id: s.id, label: s.serviceName, amount: s.price }))
    || [];
  const estimatedTotal = ticket.estimatedPrice != null
    ? ticket.estimatedPrice
    : lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const onAction = (key) => {
    switch (key) {
      case 'edit':    navigation.navigate('EditBooking', { ticketId: ticket.id }); break;
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
        {/* Hero */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-start">
            <Image
              source={{ uri: ticket.deviceImageUrl || 'https://via.placeholder.com/80x80?text=Device' }}
              style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 10 }}
            />
            <View className="flex-1 pr-2">
              <Text className="text-[10px] text-text-muted">Tracking</Text>
              <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{trackingId}</Text>
              <Text className="text-[12px] font-bold text-text mt-1" numberOfLines={1}>{deviceName}</Text>
              <Text className="text-[10px] text-text-muted" numberOfLines={1}>
                {[color, ramLabel, storageLabel].filter(Boolean).join(' Â· ') || 'â€”'}
              </Text>
            </View>
            <Badge variant={statusMeta.variant}>{statusMeta.label.toUpperCase()}</Badge>
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
                  <Text className="text-[12px] font-bold text-text">â‚¹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
                </View>
              ))}
              <PriceDivider />
              <PriceRow label="Estimated Repair Amount" value={`â‚¹${Number(estimatedTotal).toLocaleString('en-IN')}`} bold />
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

        {/* Edit shortcut */}
        <Pressable
          onPress={() => navigation.navigate('EditBooking', { ticketId: ticket.id })}
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
      </ScrollView>
    </View>
  );
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

