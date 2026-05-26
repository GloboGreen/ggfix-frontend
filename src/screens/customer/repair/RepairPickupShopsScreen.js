import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Store,
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Filter,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import {
  Loader,
  EmptyState,
  ShopCard,
  SearchBar,
  Chip,
  Badge,
} from '../../../components/rnr';
import { listNearbyShops } from '../../../api/shops';

const SORTS = [
  { key: 'recommended', label: 'Recommended', icon: Sparkles },
  { key: 'rating',      label: 'Top Rated',  icon: Star },
  { key: 'distance',    label: 'Nearest',    icon: MapPin },
  { key: 'eta',         label: 'Fastest',    icon: Clock },
];

export default function RepairPickupShopsScreen({ navigation, route }) {
  const params = route.params || {};
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recommended');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try { setShops(await listNearbyShops()); } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...shops];
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((s) =>
        (s.name || '').toLowerCase().includes(needle) ||
        (s.address || '').toLowerCase().includes(needle) ||
        (s.city || '').toLowerCase().includes(needle),
      );
    }
    if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === 'distance') list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    else if (sort === 'eta') list.sort((a, b) => (a.etaMins ?? 999) - (b.etaMins ?? 999));
    return list;
  }, [shops, q, sort]);

  const topRated = useMemo(
    () => [...shops].filter((s) => (s.rating || 0) >= 4.5).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
    [shops],
  );

  if (loading) return <Loader label="Finding shops near you..." />;

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#00008B', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 4, paddingBottom: 32, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <Text className="text-white/80 text-[11px] font-bold tracking-widest">PICKUP SHOPS</Text>
        <Text className="text-white text-[22px] font-extrabold mt-1">Choose your repair shop</Text>
        <Text className="text-white/85 text-[12px] mt-1">
          {shops.length} verified shop{shops.length === 1 ? '' : 's'} near you · Free doorstep pickup
        </Text>
      </LinearGradient>

      <View className="px-4 -mt-6">
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Search by shop name or area..."
          onClear={() => setQ('')}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Trust strip */}
        <View className="flex-row px-4 mt-4">
          <View className="flex-1 mr-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Truck size={16} color="#00008B" />
            <Text className="text-[10px] font-bold text-text mt-1">Free Pickup</Text>
          </View>
          <View className="flex-1 mx-1 bg-card border border-border rounded-2xl py-2.5 items-center">
            <ShieldCheck size={16} color="#10B981" />
            <Text className="text-[10px] font-bold text-text mt-1">30-day Warranty</Text>
          </View>
          <View className="flex-1 ml-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Award size={16} color="#F59E0B" />
            <Text className="text-[10px] font-bold text-text mt-1">Verified Shops</Text>
          </View>
        </View>

        {/* Sort chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 14 }}>
          {SORTS.map((s) => {
            const SIcon = s.icon;
            const active = sort === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSort(s.key)}
                className={`flex-row items-center rounded-full border px-3.5 py-2 mr-2 mb-2 ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
              >
                <SIcon size={12} color={active ? '#fff' : '#0F172A'} />
                <Text className={`text-[12px] font-bold ml-1.5 ${active ? 'text-white' : 'text-text'}`}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Top rated horizontal rail */}
        {!q && topRated.length > 0 && sort === 'recommended' ? (
          <>
            <View className="flex-row items-center px-4 mt-2 mb-2">
              <Award size={14} color="#F59E0B" />
              <Text className="text-[11px] font-extrabold text-warning ml-1.5 tracking-widest">TOP RATED NEAR YOU</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {topRated.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => navigation.navigate('RepairShopDetails', { ...params, shopId: s.id })}
                  className="bg-card border border-border rounded-2xl p-3 mx-1.5 active:opacity-80"
                  style={{ width: 200, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2">
                      <Text className="text-primary text-[14px] font-extrabold">{(s.name || '?').slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <Badge variant="softSuccess">OPEN</Badge>
                  </View>
                  <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{s.name}</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{s.address || s.city}</Text>
                  <View className="flex-row items-center mt-2 flex-wrap">
                    <View className="flex-row items-center bg-success/10 rounded-full px-2 py-0.5 mr-1.5">
                      <Star size={10} color="#10B981" fill="#10B981" />
                      <Text className="text-[10px] font-bold text-success ml-0.5">{Number(s.rating || 4.5).toFixed(1)}</Text>
                    </View>
                    {s.distanceKm != null ? (
                      <Text className="text-[10px] text-text-muted">{s.distanceKm.toFixed(1)} km</Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* All shops */}
        <View className="flex-row items-center px-4 mt-4 mb-2">
          <Store size={14} color="#0F172A" />
          <Text className="text-[11px] font-extrabold text-text-muted ml-1.5 tracking-widest">
            {q ? `RESULTS (${filtered.length})` : `ALL SHOPS (${filtered.length})`}
          </Text>
        </View>
        <View className="px-4">
          {!filtered.length ? (
            <EmptyState
              icon={<Store size={28} color="#00008B" />}
              title="No shops match"
              description={q ? 'Try a different search.' : 'No shops near your saved address yet.'}
              actionLabel={q ? 'Clear search' : null}
              onAction={() => setQ('')}
            />
          ) : (
            filtered.map((s) => (
              <View key={s.id} className="mb-3">
                <ShopCard
                  name={s.name}
                  address={s.address || s.city}
                  rating={s.rating || 4.5}
                  reviews={s.reviewCount || 100}
                  distance={s.distanceKm != null ? s.distanceKm.toFixed(1) : null}
                  eta={s.etaMins || 30}
                  open
                  onPress={() => navigation.navigate('RepairShopDetails', { ...params, shopId: s.id })}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
