import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Smartphone, CheckCircle2, Pencil } from 'lucide-react-native';
import { EmptyState, Loader, SearchBar, SelectionCrumb } from '../../../components/rnr';
import { getModelsByBrand, getModelsBySeries } from '../../../api/masterData';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SelectModelScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const {
    categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName,
    brandId, brandName, seriesId, seriesName, editSellOrderId, editHints,
  } = route?.params || {};
  const isEditing = !!editSellOrderId;
  const currentModelId = editHints?.modelId || null;
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let list;
        if (seriesId) {
          list = await getModelsBySeries(seriesId);
        } else {
          list = await getModelsByBrand(brandId);
          // Brand may span categories (Apple = Mobile + Laptop); keep this category.
          if (UUID_RE.test(String(categoryId || ''))) {
            list = (list || []).filter((m) => !m.categoryId || m.categoryId === categoryId);
          }
        }
        if (!cancelled) setModels(list || []);
      } catch (_) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [brandId, seriesId, categoryId]);

  const filtered = useMemo(() => {
    let list = models;
    if (isEditing && currentModelId) {
      const current = models.find((m) => m.id === currentModelId);
      const rest = models.filter((m) => m.id !== currentModelId);
      list = current ? [current, ...rest] : models;
    }
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((m) => (m.name || '').toLowerCase().includes(needle));
  }, [models, q, isEditing, currentModelId]);

  const onPick = (m) => {
    const baseParams = {
      flow, categoryId, categoryCode, categoryName, deviceTypeId, deviceTypeName,
      brandId, brandName, seriesId, seriesName, modelId: m.id, modelName: m.name,
      modelImageUrl: m.imageUrl || (m.imageBase64 ? `data:image/png;base64,${m.imageBase64}` : undefined),
      editSellOrderId, editHints,
      // Pre-seed the variant page with the order's existing color/RAM/storage/IMEI,
      // but only when the customer kept the same model. Picking a different
      // model means the old variant codes won't apply.
      ...(editSellOrderId && editHints?.modelId === m.id ? {
        ramOptionId: editHints.ramOptionId,
        storageOptionId: editHints.storageOptionId,
        color: editHints.color,
        imei: editHints.imei,
      } : {}),
    };
    // Owner marketplace listing: insert a category/spare-parts choice between
    // model selection and the variant (colour/storage) step.
    if (flow === 'OWNER_LIST') {
      navigation.navigate('OwnerSellChooseSalesCategory', baseParams);
      return;
    }
    navigation.navigate('SelectVariant', baseParams);
  };

  const crumbs = [{ label: 'Brand', value: brandName }];
  if (seriesName) crumbs.push({ label: 'Series', value: seriesName });

  if (loading) return <Loader label="Loading models..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-3">
        <SelectionCrumb items={crumbs} className="mb-3" />
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
        <SearchBar value={q} onChangeText={setQ} placeholder="Search model" onClear={() => setQ('')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Smartphone size={28} color="#00008B" />}
            title="No models found"
            description={q ? 'Try a different keyword.' : 'No models published for this selection yet.'}
          />
        ) : (
          filtered.map((m) => {
            const thumb = m.imageUrl || m.imageBase64;
            const sub = m.subtitle || m.seriesName || m.slug;
            const isCurrent = isEditing && m.id === currentModelId;
            return (
              <Pressable
                key={m.id}
                onPress={() => onPick(m)}
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
                    <Smartphone size={20} color="#00008B" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{m.name}</Text>
                  {isCurrent ? (
                    <View className="flex-row items-center mt-0.5">
                      <CheckCircle2 size={11} color="#10B981" />
                      <Text className="text-[10px] font-bold text-success ml-1">Current selection · tap to keep</Text>
                    </View>
                  ) : sub ? (
                    <Text className="text-[12px] text-text-muted mt-0.5" numberOfLines={1}>{sub}</Text>
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
