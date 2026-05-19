import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ticketApi } from '../../api/client';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

export default function DeliveryInvoiceScreen({ route }) {
  const { ticketId, customer: paramCustomer, devices, trackingId, estimatedPrice } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(!!ticketId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
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
  }, [ticketId]);

  const displayTicket = ticket;
  const customerName = paramCustomer?.name || '—';
  const customerPhone = paramCustomer?.phone || '—';
  const customerAddress = paramCustomer?.address || '—';
  const invoiceTrackingId = trackingId || displayTicket?.trackingId || '—';
  const ticketDate = displayTicket?.createdAt ? formatDate(displayTicket.createdAt) : (ticketId ? '—' : formatDate(new Date().toISOString()));
  const deliveryDate = displayTicket?.estimatedDeliveryAt ? formatDate(displayTicket.estimatedDeliveryAt) : '—';
  const deviceName = displayTicket?.deviceDisplayName || (devices?.[0]?.deviceDisplayName) || '—';
  const repairSummary = displayTicket?.repairServicesSummary || (devices?.[0]?.repairServicesSummary) || '—';
  let priceItems = [];
  try {
    const raw = displayTicket?.priceItemsJson || (devices?.[0]?.priceItems && JSON.stringify(devices[0].priceItems));
    if (raw) priceItems = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (_) {}
  const totalAmount = estimatedPrice != null
    ? Number(estimatedPrice)
    : (displayTicket?.estimatedPrice != null ? Number(displayTicket.estimatedPrice) : 0);

  if (ticketId && loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3B4FD7" />
          <Text style={styles.loadingText}>Loading receipt…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ticketId && error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.shopName}>Repair Shop</Text>
              <Text style={styles.shopContact}>support@repairshop.in</Text>
            </View>
            <View style={styles.invoiceMeta}>
              <Row label="Tracking ID" value={invoiceTrackingId} />
              <Row label="Ticket Date" value={ticketDate} />
              <Row label="Est. Delivery" value={deliveryDate || '—'} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To :</Text>
            <Text style={styles.bodyText}>{customerName}</Text>
            <Text style={styles.bodyText}>{customerAddress}</Text>
            <Text style={[styles.bodyText, { marginTop: 4 }]}>Mobile : {customerPhone}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device & Repair</Text>
            <Text style={styles.bodyText}>{deviceName}</Text>
            <Text style={styles.bodyText}>{repairSummary}</Text>
          </View>

          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>Service / Parts</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.th, { flex: 2 }]}>Description</Text>
              <Text style={styles.th}>Amount (₹)</Text>
            </View>
            {Array.isArray(priceItems) && priceItems.length > 0 ? (
              priceItems.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 0.5 }]}>{idx + 1}.</Text>
                  <Text style={[styles.td, { flex: 2 }]}>{item.label || item.name || '—'}</Text>
                  <Text style={styles.td}>{(item.amount ?? 0).toLocaleString('en-IN')}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { flex: 0.5 }]}>1.</Text>
                <Text style={[styles.td, { flex: 2 }]}>Repair service</Text>
                <Text style={styles.td}>{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>

          <View style={styles.summarySection}>
            <Row label="Estimated Total (₹)" value={totalAmount.toLocaleString('en-IN')} bold />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.bodyText}>Customer Signature : _________________</Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>Authorised Signatory</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 8, color: '#6B7280' },
  errorText: { color: '#DC2626', textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  shopContact: { fontSize: 11, color: '#4B5563' },
  invoiceMeta: { alignItems: 'flex-end' },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#111827', marginBottom: 2 },
  bodyText: { fontSize: 11, color: '#4B5563' },
  tableSection: { marginTop: 12 },
  tableTitle: { fontSize: 12, fontWeight: '700', color: '#111827', marginBottom: 4 },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  th: { flex: 1, fontSize: 10, fontWeight: '700', color: '#111827' },
  td: { flex: 1, fontSize: 10, color: '#111827' },
  summarySection: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rowLabel: { fontSize: 11, color: '#4B5563' },
  rowValue: { fontSize: 11, color: '#111827' },
  bold: { fontWeight: '700' },
  footerRow: { marginTop: 12 },
});
