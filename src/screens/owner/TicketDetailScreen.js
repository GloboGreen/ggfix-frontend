import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

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

  React.useEffect(() => { load(); }, [load]);

  if (loading && !ticket) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator size="large" color="#22C55E" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.error}>{error || 'Ticket not found'}</Text>
      </SafeAreaView>
    );
  }

  const trackingId = ticket.trackingId || ticket.id;
  const deviceName = ticket.deviceModelName || ticket.modelName || 'Galaxy Z Fold7 (16GB 512GB)';
  const color = ticket.color || 'Silver Shadow';
  const status = ticket.status || 'Service Accepted';
  const customerName = ticket.customerName || 'S.Jaya Kumar';
  const phone = ticket.customerPhone || '+91 896951 5914';
  const address =
    ticket.customerAddress ||
    'Cuddalore Tamil Nadu 608501';

  const lineItems = ticket.priceItems || [
    { id: '1', label: 'Display Screen Combo', amount: 5000 },
    { id: '2', label: 'Motherboard', amount: 5000 },
    { id: '3', label: 'Battery', amount: 2500 },
  ];
  const estimatedTotal =
    ticket.estimatedPrice != null
      ? ticket.estimatedPrice
      : lineItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: ticket.deviceImageUrl || 'https://dummyassets.local/models/galaxy-z-fold-7.png' }}
              style={styles.thumb}
            />
            <View style={styles.headerTextWrap}>
              <Text style={styles.tracking}>Tracking ID : {trackingId}</Text>
              <Text style={styles.device}>Device : {deviceName}</Text>
              <Text style={styles.device}>Color : {color}</Text>
            </View>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>{status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="person-circle-outline" size={16} color="#4B5563" style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Customer Name</Text>
              <Text style={styles.fieldValue}>{customerName}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Ionicons name="call-outline" size={16} color="#4B5563" style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <Text style={styles.fieldValue}>{phone}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Ionicons name="location-outline" size={16} color="#4B5563" style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Address</Text>
              <Text style={styles.fieldValue}>{address}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Summary</Text>
            {lineItems.map((item, index) => (
              <View key={item.id || index} style={styles.priceRow}>
                <View style={styles.priceIndexWrap}>
                  <Text style={styles.priceIndex}>{index + 1}</Text>
                </View>
                <Text style={styles.priceLabel}>{item.label}</Text>
                <Text style={styles.priceAmount}>₹{item.amount?.toLocaleString?.('en-IN') ?? item.amount}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Repair Amount</Text>
              <Text style={styles.totalAmount}>₹{estimatedTotal?.toLocaleString?.('en-IN') ?? estimatedTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <ActionButton
            icon="create-outline"
            label="Edit Booking"
            onPress={() => navigation.navigate('EditBooking', { ticketId: ticket.id })}
          />
          <ActionButton
            icon="time-outline"
            label="View History"
            onPress={() => navigation.navigate('BookingTimeline', { ticketId: ticket.id })}
          />
          <ActionButton
            icon="receipt-outline"
            label="Sharing Receipt"
            onPress={() => navigation.navigate('DeliveryInvoice', { ticketId: ticket.id })}
          />
          <ActionButton
            icon="qr-code-outline"
            label="Barcode E-Print"
            onPress={() => navigation.navigate('BarcodePrint', { ticketId: ticket.id })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#4B5563" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  loader: { flex: 1, justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10, backgroundColor: '#E5E7EB' },
  headerTextWrap: { flex: 1 },
  tracking: { fontSize: 14, fontWeight: '700', color: '#111827' },
  device: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },
  statusChipText: { fontSize: 11, fontWeight: '600', color: '#15803D' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  fieldIcon: { marginRight: 4, marginTop: 1 },
  fieldLabel: { flex: 0.9, fontSize: 12, color: '#6B7280' },
  fieldValue: { flex: 1.2, fontSize: 12, color: '#111827' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceIndexWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  priceIndex: { fontSize: 11, color: '#4B5563' },
  priceLabel: { flex: 1, fontSize: 12, color: '#111827' },
  priceAmount: { fontSize: 12, color: '#111827', fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  totalLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
  totalAmount: { fontSize: 12, fontWeight: '700', color: '#111827' },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionBtn: {
    width: '25%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionLabel: { marginTop: 4, fontSize: 11, color: '#4B5563', textAlign: 'center' },
  error: { fontSize: 14, color: '#DC2626', padding: 16 },
});
