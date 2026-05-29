import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Layers } from 'lucide-react-native';
import { EmptyState, Loader, SearchBar, SelectionCrumb } from '../../../components/rnr';
import { getSeriesForCategoryBrand } from '../../../api/masterData';

export default function SelectSeriesScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const {
    categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName, brandId, brandName,
  } = route?.params || {};
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const base = { flow, categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName, brandId, brandName };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Authoritative: only series under THIS (category, brand) pair. No
        // brand-wide fallback — that would leak another category's series
        // (e.g. Laptop+Samsung showing Samsung's Mobile Galaxy series).
        const list = await getSeriesForCategoryBrand(categoryId, brandId);
        if (cancelled) return;
        // No series under this (category, brand) -> skip straight to models.
        if (!list || list.length === 0) { navigation.replace('SelectModel', { ...base }); return; }
        setSeries(list);
      } catch (_) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [categoryId, brandId]);

  const filtered = useMemo(() => {
    if (!q.trim()) return series;
    const needle = q.toLowerCase();
    return series.filter((s) => (s.name || '').toLowerCase().includes(needle));
  }, [series, q]);

  const onPick = (s) => navigation.navigate('SelectModel', {
    ...base, seriesId: s.id, seriesName: s.name,
  });

  if (loading) return <Loader label="Loading series..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-3">
        <SelectionCrumb items={[{ label: 'Brand', value: brandName }]} className="mb-3" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search series" onClear={() => setQ('')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EmptyState title="No series found" description="Try a different keyword." />
        ) : (
          filtered.map((s) => {
            const thumb = s.imageUrl || s.imageBase64;
            return (
              <Pressable
                key={s.id}
                onPress={() => onPick(s)}
                className="flex-row items-center bg-card border border-border rounded-2xl p-3.5 mb-3 active:opacity-80"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mr-3 overflow-hidden">
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                  ) : (
                    <Layers size={20} color="#00008B" />
                  )}
                </View>
                <Text className="flex-1 text-[14px] font-extrabold text-text" numberOfLines={1}>{s.name}</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
