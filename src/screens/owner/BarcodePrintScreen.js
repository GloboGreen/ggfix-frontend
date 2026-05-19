import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

function formatBookingTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return iso;
  }
}

export default function BarcodePrintScreen({ route }) {
  const { ticketId, ticket: initialTicket, customer: paramCustomer } = route.params || {};
  const [ticket, setTicket] = useState(initialTicket || null);
  const [loading, setLoading] = useState(!!ticketId && !initialTicket);
  const [error, setError] = useState(null);
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    if (!ticketId || initialTicket) return;
    let cancelled = false;
    (async () => {
      try {
        const t = await ticketApi.get(`/tickets/${ticketId}`);
        if (!cancelled) setTicket(t);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load ticket');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticketId, initialTicket]);

  const inc = () => setCopies((c) => Math.min(99, c + 1));
  const dec = () => setCopies((c) => Math.max(1, c - 1));

  const handlePrint = () => {
    // Device print / share integration can be added here (e.g. react-native-print, share)
    Alert.alert('Print', `Print ${copies} copy/copies for ${displayTicket?.trackingId || 'barcode'}. Connect a printer or use system share.`);
  };

  const displayTicket = ticket || initialTicket;
  const customerName = paramCustomer?.name || displayTicket?.customerName || '—';
  const bookingTime = displayTicket?.createdAt ? formatBookingTime(displayTicket.createdAt) : '—';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3B4FD7" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !displayTicket) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.errorText}>{error || 'Ticket not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.barcodeBox}>
            <Ionicons name="qr-code-outline" size={64} color="#111827" />
          </View>
          <Row label="Service Number" value={displayTicket.trackingId || '—'} />
          <Row label="Device Model" value={displayTicket.deviceDisplayName || '—'} />
          <Row label="Repair Service" value={displayTicket.repairServicesSummary || '—'} />
          <Row label="Customer Name" value={customerName} />
          <Row label="Booking Time" value={`Booking Time ${bookingTime}`} />
        </View>

        <View style={styles.copiesRow}>
          <Text style={styles.copiesLabel}>Number of copies</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={dec}>
              <Text style={styles.stepText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.copiesValue}>{copies}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={inc}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color="#FFFFFF" />
          <Text style={styles.printText}>Print</Text>
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  barcodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', marginTop: 4 },
  rowLabel: { flex: 0.9, fontSize: 12, color: '#6B7280' },
  rowValue: { flex: 1.1, fontSize: 12, color: '#111827' },
  copiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  copiesLabel: { fontSize: 13, color: '#111827', fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  copiesValue: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#111827' },
  printBtn: {
    marginTop: 8,
    backgroundColor: '#F97316',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  printText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 8, color: '#6B7280' },
  errorText: { color: '#DC2626', textAlign: 'center' },
});

