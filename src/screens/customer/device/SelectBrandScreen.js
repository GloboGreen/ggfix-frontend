import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { EmptyState, Loader, SearchBar, SelectionCrumb } from '../../../components/rnr';
import { getBrandsForCategory } from '../../../api/masterData';

const BRAND_PALETTES = [
  { bg: 'bg-primary/10',   text: 'text-primary' },
  { bg: 'bg-secondary/10', text: 'text-secondary' },
  { bg: 'bg-success/10',   text: 'text-success' },
  { bg: 'bg-warning/10',   text: 'text-warning' },
  { bg: 'bg-danger/10',    text: 'text-danger' },
  { bg: 'bg-info/10',      text: 'text-info' },
];
function paletteFor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return BRAND_PALETTES[h % BRAND_PALETTES.length];
}

export default function SelectBrandScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const { categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName } = route?.params || {};
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try { setBrands(await getBrandsForCategory(categoryId)); } catch (_) {}
      setLoading(false);
    })();
  }, [categoryId]);

  const filtered = useMemo(() => {
    if (!q.trim()) return brands;
    return brands.filter((b) => (b.name || '').toLowerCase().includes(q.toLowerCase()));
  }, [brands, q]);

  const onPick = (b) => navigation.navigate('SelectSeries', {
    flow, categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName,
    brandId: b.id, brandName: b.name,
  });

  const crumbs = [{ label: 'Category', value: categoryName }];
  if (deviceTypeName) crumbs.push({ label: 'Device', value: deviceTypeName });

  if (loading) return <Loader label="Loading brands..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-3">
        <SelectionCrumb items={crumbs} className="mb-3" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search brand" onClear={() => setQ('')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No brands found"
            description={q ? `We don't recognize "${q}".` : 'No brands mapped to this category yet.'}
          />
        ) : (
          filtered.map((b) => {
            const palette = paletteFor(b.name);
            const initial = (b.name || '?').slice(0, 1).toUpperCase();
            const logo = b.imageUrl || b.imageBase64;
            return (
              <Pressable
                key={b.id}
                onPress={() => onPick(b)}
                className="flex-row items-center bg-card border border-border rounded-2xl p-3 mb-3 active:opacity-80"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="h-11 w-11 rounded-xl items-center justify-center mr-3 overflow-hidden bg-white border border-border">
                  {logo ? (
                    <Image source={{ uri: logo }} style={{ width: 30, height: 30 }} resizeMode="contain" />
                  ) : (
                    <View className={`h-11 w-11 items-center justify-center ${palette.bg}`}>
                      <Text className={`text-[18px] font-extrabold ${palette.text}`}>{initial}</Text>
                    </View>
                  )}
                </View>
                <Text className="flex-1 text-[15px] font-extrabold text-text" numberOfLines={1}>{b.name}</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
