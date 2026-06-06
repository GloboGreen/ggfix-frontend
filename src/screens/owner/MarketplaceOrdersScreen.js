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
    return { short: sell ? 'Sold' : 'Done', bg: '#10B981' };
  }
  if (s === 'CANCELLED' || s === 'CANCELED') {
    return { short: 'Cancelled', bg: '#EF4444' };
  }
  // ACTIVE / PENDING / DRAFT — listing is live but not yet sold.
  return { short: 'Pending', bg: '#F59E0B' };
}

function OrderCard({ item, showPrice, onPress }) {
  const orderId = item.id ? String(item.id).slice(0, 10).toUpperCase().replace(/-/g, '') : '';
  const created = item.createdAt ? new Date(item.createdAt) : null;
  const dateLabel = created
    ? created.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
    : '';
  const specs = [item.color, item.storageLabel].filter(Boolean).join(' · ');
  const meta = statusMeta(item.status, item.type);

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-xl mb-2 p-2.5 flex-row items-center active:opacity-80"
      style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
    >
      <View className="w-14 h-14 rounded-lg overflow-hidden bg-background items-center justify-center mr-3">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" />
        ) : (
          <Ionicons name="cube-outline" size={22} color="#94A3B8" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-text-muted text-[10px]" numberOfLines={1}>GGFIX{orderId}</Text>
          <View
            className="flex-row items-center px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: meta.bg + '1A' }}
          >
            <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: meta.bg }} />
            <Text style={{ color: meta.bg, fontSize: 9, fontWeight: '800' }}>{meta.short}</Text>
          </View>
        </View>

        <Text className="text-text font-extrabold text-[13px]" numberOfLines={1}>
          {item.title || 'Item'}
        </Text>

        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-text-muted text-[11px]" numberOfLines={1}>
            {specs || dateLabel || ''}
          </Text>
          {showPrice && item.price != null ? (
            <Text className="text-text font-extrabold text-[12px] ml-2">
              ₹{Number(item.price).toLocaleString('en-IN')}
            </Text>
          ) : null}
        </View>
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

      <View className="mx-4 mt-3 mb-2 flex-row rounded-full bg-card border border-border p-1">
        {['Buy', 'Sell'].map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 items-center justify-center py-1.5 rounded-full ${active ? 'bg-success' : ''}`}
            >
              <Text className={`text-[12px] font-extrabold ${active ? 'text-white' : 'text-text-muted'}`}>{t}</Text>
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
        <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 20 }}>
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
