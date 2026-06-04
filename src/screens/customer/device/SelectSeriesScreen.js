import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Layers, CheckCircle2, Pencil } from 'lucide-react-native';
import { EmptyState, Loader, SearchBar, SelectionCrumb } from '../../../components/rnr';
import { getSeriesForCategoryBrand } from '../../../api/masterData';

export default function SelectSeriesScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const {
    categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName, brandId, brandName,
    editSellOrderId, editHints,
  } = route?.params || {};
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const isEditing = !!editSellOrderId;
  const currentSeriesId = editHints?.seriesId || null;

  const base = {
    flow, categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName,
    brandId, brandName, editSellOrderId, editHints,
  };

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
    let list = series;
    if (isEditing && currentSeriesId) {
      const current = series.find((s) => s.id === currentSeriesId);
      const rest = series.filter((s) => s.id !== currentSeriesId);
      list = current ? [current, ...rest] : series;
    }
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((s) => (s.name || '').toLowerCase().includes(needle));
  }, [series, q, isEditing, currentSeriesId]);

  const onPick = (s) => navigation.navigate('SelectModel', {
    ...base, seriesId: s.id, seriesName: s.name,
  });

  if (loading) return <Loader label="Loading series..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-3">
        <SelectionCrumb items={[{ label: 'Brand', value: brandName }]} className="mb-3" />
        {isEditing && editHints?.modelName ? (
          <View className="bg-warning/10 border border-warning/30 rounded-xl px-3 py-2 mb-3 flex-row items-center">
            <Pencil size={13} color="#F59E0B" />
            <View className="flex-1 ml-2">
              <Text className="text-[10px] font-extrabold text-warning tracking-wider">EDITING ORDER</Text>
              <Text className="text-[12px] text-text font-semibold" numberOfLines={1}>
                Currently: {editHints.brandName ? `${editHints.brandName} · ` : ''}{editHints.modelName}
              </Text>
            </View>
          </View>
        ) : null}
        <SearchBar value={q} onChangeText={setQ} placeholder="Search series" onClear={() => setQ('')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EmptyState title="No series found" description="Try a different keyword." />
        ) : (
          filtered.map((s) => {
            const thumb = s.imageUrl || s.imageBase64;
            const isCurrent = isEditing && s.id === currentSeriesId;
            return (
              <Pressable
                key={s.id}
                onPress={() => onPick(s)}
                className={`flex-row items-center bg-card border rounded-2xl p-3.5 mb-3 active:opacity-80 ${isCurrent ? 'border-success' : 'border-border'}`}
                style={{
                  shadowColor: isCurrent ? '#10B981' : '#0F172A',
                  shadowOpacity: isCurrent ? 0.10 : 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                  borderWidth: isCurrent ? 2 : 1,
                }}
              >
                <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mr-3 overflow-hidden">
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                  ) : (
                    <Layers size={20} color="#00008B" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{s.name}</Text>
                  {isCurrent ? (
                    <View className="flex-row items-center mt-0.5">
                      <CheckCircle2 size={11} color="#10B981" />
                      <Text className="text-[10px] font-bold text-success ml-1">Current selection · tap to keep</Text>
                    </View>
                  ) : null}
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
