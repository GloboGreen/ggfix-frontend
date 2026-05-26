import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Smartphone, ChevronRight, X, Filter } from 'lucide-react-native';
import { Chip, EmptyState, Loader, SearchBar } from '../../../components/rnr';
import { getModelsByBrand, getSeriesByBrand } from '../../../api/masterData';

export default function SelectModelScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const categoryId = route?.params?.categoryId;
  const brandId = route?.params?.brandId;
  const brandName = route?.params?.brandName;
  const [models, setModels] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [m, s] = await Promise.all([
          getModelsByBrand(brandId),
          getSeriesByBrand(brandId).catch(() => []),
        ]);
        setModels(m);
        setSeries(s);
      } catch (_) {}
      setLoading(false);
    })();
  }, [brandId]);

  const filtered = useMemo(() => {
    let list = models;
    if (selectedSeries) list = list.filter((m) => m.seriesId === selectedSeries.id);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((m) => (m.name || '').toLowerCase().includes(needle));
    }
    return list;
  }, [models, selectedSeries, q]);

  if (loading) return <Loader label="Loading models..." />;

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-4 pt-3 pb-3">
        {brandName ? (
          <Text className="text-[11px] text-text-muted mb-1">Brand · <Text className="text-primary font-bold">{brandName}</Text></Text>
        ) : null}
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder={`Search ${brandName || 'model'} model…`}
          onClear={() => setQ('')}
        />
        {/* Series chip rail */}
        {series.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
            <Chip
              label="All"
              active={!selectedSeries}
              onPress={() => setSelectedSeries(null)}
            />
            {series.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                active={selectedSeries?.id === s.id}
                onPress={() => setSelectedSeries(s)}
              />
            ))}
          </ScrollView>
        ) : null}

        {/* Active filter chips & result count */}
        {(selectedSeries || q) ? (
          <View className="flex-row items-center flex-wrap mt-1">
            {selectedSeries ? (
              <Pressable
                onPress={() => setSelectedSeries(null)}
                className="flex-row items-center bg-primary rounded-full pl-3 pr-2 py-1 mr-2 mb-1 active:opacity-80"
              >
                <Filter size={10} color="#fff" />
                <Text className="text-white text-[11px] font-bold ml-1 mr-1">{selectedSeries.name}</Text>
                <X size={12} color="#fff" />
              </Pressable>
            ) : null}
            {q ? (
              <Pressable
                onPress={() => setQ('')}
                className="flex-row items-center bg-secondary rounded-full pl-3 pr-2 py-1 mr-2 mb-1 active:opacity-80"
              >
                <Text className="text-white text-[11px] font-bold mr-1">"{q}"</Text>
                <X size={12} color="#fff" />
              </Pressable>
            ) : null}
            <Text className="text-[11px] text-text-muted">{filtered.length} model{filtered.length === 1 ? '' : 's'}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Smartphone size={28} color="#00008B" />}
            title="No models match"
            description={selectedSeries || q ? 'Try clearing filters or a different keyword.' : 'No models in this brand yet.'}
            actionLabel={selectedSeries || q ? 'Clear filters' : null}
            onAction={() => { setSelectedSeries(null); setQ(''); }}
          />
        ) : (
          <View className="flex-row flex-wrap -mx-1.5">
            {filtered.map((m) => (
              <View key={m.id} style={{ width: '50%' }} className="p-1.5">
                <Pressable
                  onPress={() => navigation.navigate('SelectVariant', { flow, categoryId, brandId, modelId: m.id, modelName: m.name })}
                  className="bg-card border border-border rounded-2xl p-3 active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                >
                  <View className="flex-row items-start">
                    <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                      <Smartphone size={18} color="#00008B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[12px] font-extrabold text-text" numberOfLines={2}>{m.name}</Text>
                      {m.seriesName ? (
                        <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{m.seriesName}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row items-center justify-end mt-2">
                    <Text className="text-[10px] font-bold text-primary mr-0.5">Select</Text>
                    <ChevronRight size={12} color="#00008B" />
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
