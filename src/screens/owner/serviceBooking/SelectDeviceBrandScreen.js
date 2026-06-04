import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import {
  Loader, ScreenHeader, SearchBar, EmptyState, SelectionCrumb,
} from '../../../components/rnr';
import { getBrandsForCategory, getBrands } from '../../../api/masterData';

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

export default function SelectDeviceBrandScreen({ navigation, route }) {
  const params = route?.params || {};
  const { categoryId, categoryName, deviceTypeName, editMode, brandId: currentBrandId } = params;
  const [q, setQ] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBrands(categoryId ? await getBrandsForCategory(categoryId) : await getBrands());
      } catch (_) {}
      setLoading(false);
    })();
  }, [categoryId]);

  // In edit mode, pin the currently-selected brand to the top so the user can
  // see + tap it to confirm without scrolling through the whole list.
  const filtered = useMemo(() => {
    const base = !q.trim()
      ? brands
      : brands.filter((b) => (b.name || '').toLowerCase().includes(q.toLowerCase()));
    if (editMode && currentBrandId) {
      const idx = base.findIndex((b) => b.id === currentBrandId);
      if (idx > 0) {
        const copy = base.slice();
        const [cur] = copy.splice(idx, 1);
        copy.unshift(cur);
        return copy;
      }
    }
    return base;
  }, [brands, q, editMode, currentBrandId]);

  const onPick = (b) => navigation.navigate('SelectDeviceSeries', {
    ...params, brandId: b.id, brandName: b.name,
  });

  const crumbs = [{ label: 'Category', value: categoryName }];
  if (deviceTypeName) crumbs.push({ label: 'Device', value: deviceTypeName });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Select Brand" onBack={() => navigation.goBack()} />
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <SelectionCrumb items={crumbs} className="mb-3" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search brand" onClear={() => setQ('')} />
      </View>

      {loading ? (
        <Loader label="Loading brands..." />
      ) : (
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
              const isCurrent = editMode && currentBrandId === b.id;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => onPick(b)}
                  className={`flex-row items-center bg-card border rounded-2xl p-3 mb-3 active:opacity-80 ${isCurrent ? 'border-primary' : 'border-border'}`}
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
                  {isCurrent ? (
                    <View className="flex-row items-center bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5 mr-1">
                      <Check size={10} color="#00008B" />
                      <Text className="text-[10px] font-extrabold text-primary ml-1">Current</Text>
                    </View>
                  ) : null}
                  <ChevronRight size={18} color="#94A3B8" />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
