import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Smartphone } from 'lucide-react-native';
import {
  EmptyState, Loader, ScreenHeader, SearchBar, SelectionCrumb,
} from '../../../components/rnr';
import { getModelsByBrand, getModelsBySeries } from '../../../api/masterData';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SelectDeviceModelScreen({ navigation, route }) {
  const params = route?.params || {};
  const { categoryId, brandId, brandName, seriesId, seriesName } = params;
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
    if (!q.trim()) return models;
    const needle = q.toLowerCase();
    return models.filter((m) => (m.name || '').toLowerCase().includes(needle));
  }, [models, q]);

  const onPick = (m) => {
    const imageUrl = m.imageUrl || (m.imageBase64 ? `data:image/png;base64,${m.imageBase64}` : null);
    navigation.navigate('DeviceColorStorage', {
      ...params, modelId: m.id, modelName: m.name, imageUrl,
    });
  };

  const crumbs = [{ label: 'Brand', value: brandName }];
  if (seriesName) crumbs.push({ label: 'Series', value: seriesName });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Select Model" onBack={() => navigation.goBack()} />
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <SelectionCrumb items={crumbs} className="mb-3" />
        <SearchBar value={q} onChangeText={setQ} placeholder="Search model" onClear={() => setQ('')} />
      </View>

      {loading ? (
        <Loader label="Loading models..." />
      ) : (
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
              return (
                <Pressable
                  key={m.id}
                  onPress={() => onPick(m)}
                  className="flex-row items-center bg-card border border-border rounded-2xl p-3.5 mb-3 active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
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
                    {sub ? <Text className="text-[12px] text-text-muted mt-0.5" numberOfLines={1}>{sub}</Text> : null}
                  </View>
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
