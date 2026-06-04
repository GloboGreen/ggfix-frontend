import React, { useCallback, useEffect, useState } from 'react';
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
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { marketplaceApi } from '../../api/client';
import { fetchMe } from '../../api/auth';
import { getSession } from '../../auth/session';

const RADIUS_KM = 20;

export default function BuyScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState(null); // { lat, lng, shopName }

  const ensureOrigin = useCallback(async () => {
    // Try live /auth/me first, fall back to cached session.
    let session = await fetchMe().catch(() => null);
    if (!session) session = await getSession();
    const shop = session?.activeShop;
    if (shop && shop.latitude != null && shop.longitude != null) {
      return {
        lat: Number(shop.latitude),
        lng: Number(shop.longitude),
        shopName: shop.name,
        sellerId: session?.userId,
      };
    }
    return { lat: null, lng: null, shopName: session?.shopName, sellerId: session?.userId };
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const o = origin || (await ensureOrigin());
        if (!origin) setOrigin(o);
        const params = { radiusKm: RADIUS_KM };
        if (o.lat != null && o.lng != null) {
          params.lat = o.lat;
          params.lng = o.lng;
        }
        if (query) params.q = query;
        if (o.sellerId) params.excludeSellerId = o.sellerId; // don't show our own listings
        const data = await marketplaceApi.get('/marketplace/buy/nearby', { query: params });
        const content = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
        setItems(content);
      } catch (e) {
        setError(e.message || 'Failed to load listings');
        setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [origin, ensureOrigin, query],
  );

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }) => {
    const productName = item.productName || 'Untitled';
    const sellerLabel = item.sellerType === 'CUSTOMER' ? 'Customer' : 'Shop';
    const sellerLine = [item.city, item.state].filter(Boolean).join(', ') || item.address || '—';
    const distance = item.distanceKm != null ? `${item.distanceKm} km` : null;
    const priceNum = item.expectedPrice != null ? Number(item.expectedPrice) : null;
    // expectedPrice == 0 is our sentinel for "customer is awaiting a shop quote"
    // (sell-orders don't have a fixed price). Render a CTA-style label in that
    // case so the shop knows to send a quotation rather than match a number.
    const isAwaitingQuote = priceNum != null && priceNum === 0;
    const price = priceNum != null && priceNum > 0
      ? priceNum.toLocaleString('en-IN')
      : null;

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          {item.productImage ? (
            <Image source={{ uri: item.productImage }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="image-outline" size={20} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.topTextWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.model} numberOfLines={1}>{productName}</Text>
              <View style={[styles.sellerPill, item.sellerType === 'CUSTOMER' ? styles.pillCustomer : styles.pillShop]}>
                <Ionicons
                  name={item.sellerType === 'CUSTOMER' ? 'person-outline' : 'storefront-outline'}
                  size={10}
                  color={item.sellerType === 'CUSTOMER' ? '#1D4ED8' : '#15803D'}
                />
                <Text style={[styles.sellerText, { color: item.sellerType === 'CUSTOMER' ? '#1D4ED8' : '#15803D' }]}>
                  {sellerLabel}
                </Text>
              </View>
            </View>
            {item.condition ? <Text style={styles.meta}>Condition · {item.condition}</Text> : null}
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={11} color="#6B7280" />
              <Text style={styles.locText} numberOfLines={1}>{sellerLine}</Text>
              {distance ? <Text style={styles.distance}>· {distance}</Text> : null}
            </View>
            {isAwaitingQuote ? (
              <Text style={styles.quotePill}>Awaiting your quote</Text>
            ) : (
              <Text style={styles.price}>₹{price ?? '—'}</Text>
            )}
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation?.navigate?.('OwnerBuyListingDetails', { listing: item })}
          >
            <Text style={styles.viewText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => {
              const phone = item.contactPhone || item.sellerPhone;
              if (phone) {
                Linking.openURL(`tel:${phone}`).catch(() => {});
              } else {
                Alert.alert(
                  'No phone yet',
                  item.sellerType === 'CUSTOMER'
                    ? 'This customer has not shared a phone number on this listing. Tap View Details to send a quotation instead.'
                    : 'No contact phone available for this seller.',
                );
              }
            }}
          >
            <Ionicons name="call-outline" size={13} color="#FFFFFF" />
            <Text style={styles.contactText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#00008B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Buy Mobile or Spare parts</Text>
        {origin?.lat != null ? (
          <Text style={styles.headerSubtitle}>Within {RADIUS_KM} km of {origin.shopName || 'your shop'}</Text>
        ) : (
          <Text style={styles.headerSubtitle}>Set your shop location to enable nearby filtering</Text>
        )}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={['#00008B']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="storefront-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No listings nearby</Text>
            <Text style={styles.emptyHint}>
              When customers or other shops within {RADIUS_KM} km post items for sale, they'll show up here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  headerRow: { paddingTop: 12, paddingBottom: 6, paddingHorizontal: 16, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, marginTop: 6 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { marginLeft: 6, flex: 1, fontSize: 13, color: '#111827' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginTop: 8, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  rowTop: { flexDirection: 'row' },
  thumb: { width: 66, height: 66, borderRadius: 10, marginRight: 10, backgroundColor: '#E5E7EB' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  topTextWrap: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  model: { fontSize: 13.5, fontWeight: '700', color: '#111827', flex: 1, marginRight: 6 },
  meta: { fontSize: 11.5, color: '#4B5563', marginTop: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  locText: { fontSize: 11, color: '#4B5563', marginLeft: 3, flexShrink: 1 },
  distance: { fontSize: 11, color: '#00008B', marginLeft: 4, fontWeight: '700' },
  price: { fontSize: 14, color: '#16A34A', fontWeight: '800', marginTop: 4 },
  quotePill: { marginTop: 4, alignSelf: 'flex-start', fontSize: 11, fontWeight: '800', color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  sellerPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  pillCustomer: { backgroundColor: '#DBEAFE' },
  pillShop: { backgroundColor: '#DCFCE7' },
  sellerText: { fontSize: 9.5, fontWeight: '800', marginLeft: 2, letterSpacing: 0.3 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 8 },
  viewBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  viewText: { fontSize: 12, fontWeight: '700', color: '#00008B' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00008B', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  contactText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginLeft: 4 },
  error: { fontSize: 13, color: '#DC2626', paddingHorizontal: 16, paddingBottom: 4 },
  emptyWrap: { alignItems: 'center', marginTop: 36, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 8 },
  emptyHint: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
