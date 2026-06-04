import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';
import { getModelsByBrand } from '../../api/masterData';

const STATUS_META = {
  CREATED: { label: 'Service Accepted', color: '#F59E0B', hint: 'Booking has been created.' },
  ASSIGNED: { label: 'Technician Assigned', color: '#2563EB', hint: 'Technician assigned.' },
  IN_DIAGNOSIS: { label: 'In Diagnosis', color: '#7C3AED', hint: 'Device is being checked.' },
  IN_REPAIR: { label: 'In Service Process', color: '#7C3AED', hint: 'Repair work is in progress.' },
  QUOTED: { label: 'Re-Estimated', color: '#F59E0B', hint: 'Estimate has been updated.' },
  APPROVED: { label: 'Customer Approved', color: '#2563EB', hint: 'Customer approved the repair.' },
  READY: { label: 'Out For Delivery', color: '#F97316', hint: 'Device is ready for delivery.' },
  DELIVERED: { label: 'Delivered', color: '#16A34A', hint: 'Device has been delivered.' },
  CANCELLED: { label: 'Cancelled', color: '#DC2626', hint: 'Booking was cancelled.' },
  RETURNED: { label: 'Returned', color: '#DC2626', hint: 'Device was returned.' },
};

const emptyText = 'Not captured';

function unwrap(data) {
  return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
}

function formatMoney(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `Rs ${number.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function parsePriceItems(json) {
  if (!json || typeof json !== 'string') return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function BillingScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await ticketApi.get('/tickets', { query: { page: 0, size: 50, q: query || undefined } });
        const content = unwrap(data);
        const brandIds = Array.from(new Set(content.map((ticket) => ticket.brandId).filter(Boolean)));
        const modelById = {};
        await Promise.all(brandIds.map(async (brandId) => {
          try {
            const models = await getModelsByBrand(brandId);
            (models || []).forEach((model) => { modelById[model.id] = model; });
          } catch (_) {}
        }));
        setItems(content.map((ticket) => {
          const model = ticket.modelId ? modelById[ticket.modelId] : null;
          const modelImage = model?.imageUrl || (model?.imageBase64 ? `data:image/png;base64,${model.imageBase64}` : null);
          return {
            ...ticket,
            _modelName: ticket.deviceDisplayName || ticket.deviceModelName || ticket.modelName || model?.name || null,
            _modelImage: ticket.deviceImageUrl || modelImage || null,
            _priceItems: parsePriceItems(ticket.priceItemsJson),
          };
        }));
      } catch (e) {
        setError(e.message || 'Failed to load billing');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query],
  );

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.finalPrice ?? item.estimatedPrice) || 0), 0),
    [items],
  );

  const renderItem = ({ item }) => {
    const trackingId = item.trackingId || item.id || emptyText;
    const deviceName = item._modelName || emptyText;
    const color = item.color || emptyText;
    const statusKey = String(item.status || '').toUpperCase();
    const statusMeta = STATUS_META[statusKey] || { label: item.status || emptyText, color: '#4B5563', hint: '' };
    const customer = item.customerName || emptyText;
    const phone = item.customerPhone || emptyText;
    const services = item.repairServicesSummary
      || item._priceItems?.map?.((row) => row.label).filter(Boolean).join(', ')
      || emptyText;
    const amount = formatMoney(item.finalPrice ?? item.estimatedPrice);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
      >
        <View style={styles.rowTop}>
          {item._modelImage ? (
            <Image source={{ uri: item._modelImage }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="phone-portrait-outline" size={22} color="#64748B" />
            </View>
          )}
          <View style={styles.topTextWrap}>
            <Text style={styles.tracking}>Tracking ID : {trackingId}</Text>
            <Text style={styles.device}>Device : {deviceName}</Text>
            <Text style={styles.device}>Color : {color}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status :</Text>
          <Text style={[styles.statusValue, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          {statusMeta.hint ? <Text style={styles.statusHint}> - {statusMeta.hint}</Text> : null}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Customer Name</Text>
          <Text style={styles.fieldValue}>{customer}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <Text style={styles.fieldValue}>{phone}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Repair Services</Text>
          <Text style={styles.fieldValue}>{services}</Text>
        </View>
        {amount ? (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Billing Amount</Text>
            <Text style={styles.fieldValue}>{amount}</Text>
          </View>
        ) : null}
        <View style={styles.actionRow}>
          <Action icon="document-text-outline" label="View Details" onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })} />
          <Action icon="time-outline" label="View History" onPress={() => navigation.navigate('BookingTimeline', { ticketId: item.id })} />
          <Action icon="receipt-outline" label="Invoice" onPress={() => navigation.navigate('DeliveryInvoice', { ticketId: item.id })} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Billing & Delivery</Text>
        <Text style={styles.headerSubtitle}>
          {items.length} record{items.length === 1 ? '' : 's'}
          {totalAmount > 0 ? ` - ${formatMoney(totalAmount)}` : ''}
        </Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Tracking ID, Customer Name, or Mobile Number"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => load(true)}
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={['#22C55E']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No billing records found</Text>}
      />
    </SafeAreaView>
  );
}

function Action({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#4B5563" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  headerBar: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchInput: { marginLeft: 6, flex: 1, fontSize: 13, color: '#111827' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  thumb: { width: 48, height: 48, borderRadius: 8, marginRight: 10, backgroundColor: '#E5E7EB' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  topTextWrap: { flex: 1 },
  tracking: { fontSize: 13, fontWeight: '600', color: '#111827' },
  device: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  statusRow: { flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' },
  statusLabel: { fontSize: 12, color: '#4B5563' },
  statusValue: { fontSize: 12, fontWeight: '600' },
  statusHint: { fontSize: 12, color: '#4B5563' },
  fieldRow: { flexDirection: 'row', marginTop: 4 },
  fieldLabel: { flex: 0.7, fontSize: 12, color: '#6B7280' },
  fieldValue: { flex: 1, fontSize: 12, color: '#111827' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionLabel: { marginTop: 4, fontSize: 11, color: '#4B5563' },
  error: { fontSize: 13, color: '#DC2626', paddingHorizontal: 16, paddingBottom: 4 },
  empty: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 24 },
});
