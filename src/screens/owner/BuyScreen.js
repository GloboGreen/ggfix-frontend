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
import { marketplaceApi } from '../../api/client';
import { getMasterImageSource } from '../../api/masterDataImages';

export default function BuyScreen() {
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
        const data = await marketplaceApi.get('/marketplace/products', {
          query: { type: 'SELL', status: 'ACTIVE', q: query || undefined },
        });
        const content = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
        setItems(content);
      } catch (e) {
        setError(e.message || 'Failed to load items');
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
    const modelName = item.modelName || 'Galaxy Z Fold 7, 16GB / 512GB';
    const shopName = item.shopName || 'Green Mobiles';
    const location = item.location || 'Cuddalore';
    const price = item.price ?? 14300;

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <Image
            source={getMasterImageSource(item, 'https://dummyassets.local/models/galaxy-z-fold-7.png')}
            style={styles.thumb}
          />
          <View style={styles.topTextWrap}>
            <Text style={styles.model}>{modelName}</Text>
            <Text style={styles.meta}>Shop Name : {shopName}</Text>
            <Text style={styles.meta}>Location : {location}</Text>
            <Text style={styles.price}>Price : ₹{price.toLocaleString?.('en-IN') ?? price}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
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
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Buy Mobile or Spare parts</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Model, spare part name ..."
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
        ListEmptyComponent={<Text style={styles.empty}>No items found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  headerRow: { paddingVertical: 12, alignItems: 'center' },
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
  },
  searchInput: { marginLeft: 6, flex: 1, fontSize: 13, color: '#111827' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  rowTop: { flexDirection: 'row' },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10, backgroundColor: '#E5E7EB' },
  topTextWrap: { flex: 1 },
  model: { fontSize: 13, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  price: { fontSize: 13, color: '#16A34A', fontWeight: '600', marginTop: 4 },
  viewBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viewText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  error: { fontSize: 13, color: '#DC2626', paddingHorizontal: 16, paddingBottom: 4 },
  empty: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 24 },
});

