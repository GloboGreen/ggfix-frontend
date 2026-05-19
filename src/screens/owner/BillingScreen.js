import React, { useCallback, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { orderApi } from '../../api/client';

export default function BillingScreen() {
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
        const data = await orderApi.get('/orders', { query: { page: 0, size: 50, q: query || undefined } });
        const content = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
        setItems(content);
      } catch (e) {
        setError(e.message || 'Failed to load billing');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query],
  );

  React.useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => {
    const trackingId = item.trackingId || 'CSPEN08867133';
    const deviceName = item.deviceModelName || 'Galaxy Z Fold7 (16GB 512GB)';
    const color = item.color || 'Silver Shadow';
    const status = item.status || 'Out For Delivery';
    const customer = item.customerName || 'S.Jaya Kumar';
    const phone = item.customerPhone || '+91 896951 5914';
    const services = item.repairServicesSummary || 'Display Screen Combo';

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.rowTop}>
          <Image
            source={{ uri: item.deviceImageUrl || 'https://dummyassets.local/models/galaxy-z-fold-7.png' }}
            style={styles.thumb}
          />
          <View style={styles.topTextWrap}>
            <Text style={styles.tracking}>Tracking ID : {trackingId}</Text>
            <Text style={styles.device}>Device : {deviceName}</Text>
            <Text style={styles.device}>Color : {color}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status :</Text>
          <Text style={[styles.statusValue, { color: '#F97316' }]}>{status}</Text>
          <Text style={styles.statusHint}> - Your device is out for delivery.</Text>
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
        <View style={styles.actionRow}>
          <Action icon="document-text-outline" label="View Details" />
          <Action icon="time-outline" label="View History" />
          <Action icon="bicycle-outline" label="To Delivery" />
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

function Action({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
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

