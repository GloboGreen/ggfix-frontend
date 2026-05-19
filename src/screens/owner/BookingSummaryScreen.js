import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function BookingSummaryScreen({ route, navigation }) {
  const { ticketId, customer, devices, trackingId, estimatedPrice } = route.params || {};

  const handleInvoice = () => {
    navigation.navigate('DeliveryInvoice', { ticketId, customer, devices, trackingId, estimatedPrice });
  };

  const handleBarcode = () => {
    navigation.navigate('BarcodePrint', { ticketId, customer });
  };

  const handleAssignTechnician = () => {
    navigation.navigate('AssignTechnician', {
      ticketId,
      customer,
      devices,
      trackingId,
      estimatedPrice,
    });
  };

  const shopName = 'Green Mobiles';
  const customerName = customer?.name ?? 'Mohan';
  const mobileNumber = customer?.phone ?? '+91 683478749';
  const address = customer?.doorStreet || customer?.area
    ? [customer.doorStreet, customer.area, customer.district, customer.state, customer.pincode].filter(Boolean).join(', ')
    : '1, BMutur, Cuddalore, Tamil Nadu 608501';
  const deviceList = (devices && devices.length > 0)
    ? devices.map((d) => d.deviceDisplayName || d.model?.name).join(', ')
    : 'Galaxy Z Fold7, Vivo Y200 5G';
  const repairServices = (devices && devices.length > 0)
    ? devices.map((d) => d.repairServicesSummary).filter(Boolean).join('; ')
    : 'Display, Battery, Motherboard';
  const displayTrackingId = trackingId || 'CSPEN08867133';
  const displayPrice = estimatedPrice != null
    ? `₹${Number(estimatedPrice).toLocaleString('en-IN')}`
    : '₹12,500.00';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
        </View>
        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>Your Booking has been placed.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>
          <Row label="Shop Name" value={shopName} />
          <Row label="Customer Name" value={customerName} />
          <Row label="Mobile Number" value={mobileNumber} />
          <Row label="Address" value={address} />

          <View style={styles.divider} />

          <Text style={styles.cardTitle}>Device & Repair Details</Text>
          <Row label="Device" value={deviceList} />
          <Row label="Repair Services" value={repairServices} />

          <View style={styles.divider} />

          <Text style={styles.cardTitle}>Service Information</Text>
          <Row label="Tracking ID" value={displayTrackingId} />
          <Row label="Service Status" value="Order Placed" />
          <Row label="Estimated Repair Price" value={displayPrice} />
        </View>

        <View style={styles.actionsRow}>
          <ActionButton icon="construct-outline" label="Assign To Technician" onPress={handleAssignTechnician} />
          <ActionButton icon="share-social-outline" label="Sharing Receipt" onPress={handleInvoice} />
          <ActionButton icon="qr-code-outline" label="Barcode E-Print" onPress={handleBarcode} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#F9FAFB" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, alignItems: 'center' },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 13, color: '#4B5563', marginTop: 4, marginBottom: 16 },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  row: { flexDirection: 'row', marginTop: 4 },
  rowLabel: { flex: 0.9, fontSize: 12, color: '#6B7280' },
  rowValue: { flex: 1.1, fontSize: 12, color: '#111827' },
  divider: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    marginHorizontal: 4,
    backgroundColor: '#111827',
  },
  actionLabel: { marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#F9FAFB' },
});

