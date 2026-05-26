import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { EmptyState, Loader, SearchBar } from '../../../components/rnr';
import { getBrands } from '../../../api/masterData';

const BRAND_PALETTES = [
  { bg: 'bg-primary/10',   text: 'text-primary' },
  { bg: 'bg-secondary/10', text: 'text-secondary' },
  { bg: 'bg-success/10',   text: 'text-success' },
  { bg: 'bg-warning/10',   text: 'text-warning' },
  { bg: 'bg-danger/10',    text: 'text-danger' },
  { bg: 'bg-info/10',      text: 'text-info' },
];

const POPULAR = new Set(['Apple', 'Samsung', 'Xiaomi', 'OnePlus']);

function paletteFor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return BRAND_PALETTES[h % BRAND_PALETTES.length];
}

export default function SelectBrandScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const categoryId = route?.params?.categoryId;
  const categoryName = route?.params?.categoryName;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try { setBrands(await getBrands()); } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return brands;
    return brands.filter((b) => (b.name || '').toLowerCase().includes(q.toLowerCase()));
  }, [brands, q]);

  const popular = useMemo(() => filtered.filter((b) => POPULAR.has(b.name)), [filtered]);
  const others = useMemo(() => filtered.filter((b) => !POPULAR.has(b.name)), [filtered]);

  if (loading) return <Loader label="Loading brands..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-4">
        {categoryName ? (
          <Text className="text-[11px] text-text-muted mb-1">Category · <Text className="text-primary font-bold">{categoryName}</Text></Text>
        ) : null}
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Search brand…"
          onClear={() => setQ('')}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {!q && popular.length > 0 ? (
          <>
            <View className="flex-row items-center mb-2">
              <Sparkles size={14} color="#F59E0B" />
              <Text className="text-[11px] font-extrabold text-warning ml-1.5 tracking-widest">POPULAR BRANDS</Text>
            </View>
            <View className="flex-row flex-wrap -mx-1.5 mb-4">
              {popular.map((b) => (
                <BrandTile
                  key={b.id}
                  brand={b}
                  popular
                  onPress={() => navigation.navigate('SelectModel', { flow, categoryId, brandId: b.id, brandName: b.name })}
                />
              ))}
            </View>
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <Text className="text-[11px] font-extrabold text-text-muted tracking-widest mb-2">
              {q ? 'SEARCH RESULTS' : 'ALL BRANDS'}
            </Text>
            <View className="flex-row flex-wrap -mx-1.5">
              {others.map((b) => (
                <BrandTile
                  key={b.id}
                  brand={b}
                  onPress={() => navigation.navigate('SelectModel', { flow, categoryId, brandId: b.id, brandName: b.name })}
                />
              ))}
            </View>
          </>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            title="No brand found"
            description={`We don't recognize "${q}". Try a different name.`}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function BrandTile({ brand, onPress, popular }) {
  const palette = paletteFor(brand.name);
  const initial = (brand.name || '?').slice(0, 1).toUpperCase();
  return (
    <View style={{ width: '33.333%' }} className="p-1.5">
      <Pressable
        onPress={onPress}
        className="bg-card border border-border rounded-2xl p-3 items-center active:opacity-80"
        style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
      >
        {popular ? (
          <View className="absolute right-1.5 top-1.5 bg-warning/15 rounded-full px-1.5 py-0.5">
            <Text className="text-warning text-[8px] font-bold tracking-wide">HOT</Text>
          </View>
        ) : null}
        <View className={`h-12 w-12 rounded-2xl items-center justify-center mb-2 ${palette.bg}`}>
          <Text className={`text-[18px] font-extrabold ${palette.text}`}>{initial}</Text>
        </View>
        <Text className="text-[12px] font-extrabold text-text text-center" numberOfLines={1}>
          {brand.name}
        </Text>
      </Pressable>
    </View>
  );
}
