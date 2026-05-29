import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Layers } from 'lucide-react-native';
import {
  Loader, ScreenHeader, SearchBar, EmptyState, SelectionCrumb,
} from '../../../components/rnr';
import { getSeriesForCategoryBrand } from '../../../api/masterData';

export default function SelectDeviceSeriesScreen({ navigation, route }) {
  const params = route?.params || {};
  const { categoryId, brandId, brandName } = params;
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Only series under THIS (category, brand) pair — no brand-wide
        // fallback (that leaks another category's series).
        const list = await getSeriesForCategoryBrand(categoryId, brandId);
        if (cancelled) return;
        if (!list || list.length === 0) { navigation.replace('SelectDeviceModel', { ...params }); return; }
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

  const onPick = (s) => navigation.navigate('SelectDeviceModel', {
    ...params, seriesId: s.id, seriesName: s.name,
  });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Select Series" onBack={() => navigation.goBack()} />
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <SelectionCrumb items={[{ label: 'Brand', value: brandName }]} className="mb-3" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search series" onClear={() => setQ('')} />
      </View>

      {loading ? (
        <Loader label="Loading series..." />
      ) : (
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
      )}
    </View>
  );
}
