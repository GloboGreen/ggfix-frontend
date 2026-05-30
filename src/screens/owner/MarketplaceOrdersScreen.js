import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/rnr';
import { marketplaceApi } from '../../api/client';
import { getModelsByBrand } from '../../api/masterData';
import { selectShopId, selectUserId } from '../../store/authSlice';

function statusMeta(rawStatus, type) {
  const s = String(rawStatus || '').toUpperCase();
  const sell = type !== 'BUY';
  if (s === 'SOLD' || s === 'COMPLETED') {
    return { label: sell ? 'Selling Completed' : 'Order Successfully', icon: 'checkmark', bg: '#10B981' };
  }
  if (s === 'CANCELLED' || s === 'CANCELED') {
    return { label: sell ? 'Cancelled' : 'Order Cancelled', icon: 'close', bg: '#EF4444' };
  }
  // ACTIVE / PENDING / DRAFT — listing is live but not yet sold.
  return { label: sell ? 'Selling — Pending' : 'Order Pending', icon: 'time-outline', bg: '#F59E0B' };
}

function StatusRow({ status, type, date }) {
  const meta = statusMeta(status, type);
  return (
    <View className="flex-row items-center">
      <View className="w-5 h-5 rounded-full items-center justify-center mr-2" style={{ backgroundColor: meta.bg }}>
        <Ionicons name={meta.icon} size={12} color="#fff" />
      </View>
      <View className="flex-1">
        <Text className="font-extrabold text-text text-[13px]">{meta.label}</Text>
        <Text className="text-text-muted text-[10px] mt-0.5">{date}</Text>
      </View>
    </View>
  );
}

function OrderCard({ item, showPrice, onPress }) {
  const orderId = item.id ? String(item.id).slice(0, 12).toUpperCase().replace(/-/g, '') : '';
  const created = item.createdAt ? new Date(item.createdAt) : null;
  const dateLabel = created
    ? created.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const specs = item.color || item.storageLabel || item.descriptionType || '';

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-2xl mb-3 p-3 active:opacity-80"
      style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
    >
      <StatusRow status={item.status} type={item.type} date={dateLabel} />
      <View className="border-t border-border my-2.5" />
      <View className="flex-row items-center">
        <View className="w-[68px] h-[68px] rounded-md overflow-hidden bg-background items-center justify-center mr-3">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: 68, height: 68 }} resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={26} color="#94A3B8" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-text-muted text-[10px]">Order ID : <Text className="text-text font-semibold">GGFIX{orderId}</Text></Text>
          <Text className="text-text font-extrabold text-[15px] mt-1" numberOfLines={1}>{item.title || 'Item'}</Text>
          {specs ? <Text className="text-text-muted text-[12px]" numberOfLines={1}>{specs}</Text> : null}
        </View>
        {showPrice && item.price != null ? (
          <Text className="text-text font-extrabold text-[14px] ml-2">₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function MarketplaceOrdersScreen({ navigation }) {
  const [tab, setTab] = useState('Sell');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const shopId = useSelector(selectShopId);
  const userId = useSelector(selectUserId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.get('/marketplace/products', {
        query: { type: tab.toUpperCase() },
      });
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      // Sell tab: show only this seller's listings (match by sellerUserId or shopId).
      const filtered = tab === 'Sell'
        ? list.filter((p) =>
            (userId && p.sellerUserId === userId) ||
            (shopId && p.shopId === shopId) ||
            (!p.sellerUserId && !p.shopId))
        : list;

      // Override the listing thumbnail with the model's catalog image for any
      // non-spare-parts row that has a known modelId. This rescues old listings
      // where a user-uploaded condition photo was saved as the primary image.
      const brandIds = Array.from(new Set(
        filtered
          .filter((p) => p.descriptionType !== 'SPARE_PARTS' && p.brandId && p.modelId)
          .map((p) => p.brandId),
      ));
      if (brandIds.length) {
        const modelMap = {};
        await Promise.all(brandIds.map(async (brandId) => {
          try {
            const models = await getModelsByBrand(brandId);
            (models || []).forEach((m) => {
              const url = m.imageUrl || (m.imageBase64 ? `data:image/png;base64,${m.imageBase64}` : null);
              if (url) modelMap[m.id] = url;
            });
          } catch (_) {}
        }));
        const enriched = filtered.map((p) => {
          if (p.descriptionType === 'SPARE_PARTS') return p;
          const url = p.modelId ? modelMap[p.modelId] : null;
          return url ? { ...p, imageUrl: url } : p;
        });
        setItems(enriched);
      } else {
        setItems(filtered);
      }
    } catch (_) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, shopId, userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Orders"
        onBack={() => navigation.goBack()}
        right={(
          <View className="flex-row items-center">
            <Pressable className="px-2 py-1 active:opacity-70" hitSlop={6}>
              <Ionicons name="search-outline" size={20} color="#0F172A" />
            </Pressable>
            <Pressable className="px-2 py-1 active:opacity-70" hitSlop={6}>
              <Ionicons name="cart-outline" size={20} color="#0F172A" />
            </Pressable>
          </View>
        )}
      />

      <View className="flex-row px-4 py-3">
        {['Buy', 'Sell'].map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`rounded-full px-5 py-2 mr-2 ${active ? 'bg-success' : 'bg-background border border-border'}`}
            >
              <Text className={`text-[12px] font-extrabold ${active ? 'text-white' : 'text-text'}`}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#00008B" /></View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="bag-outline" size={36} color="#94A3B8" />
          <Text className="text-text-muted text-[12px] mt-2 text-center">
            No {tab.toLowerCase()} orders yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
          {items.map((item) => (
            <OrderCard
              key={item.id}
              item={item}
              showPrice={tab === 'Sell'}
              onPress={() => navigation.navigate('MarketplaceListingDetails', { productId: item.id, listing: item })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
