import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Filter, X, Smartphone, ChevronRight } from 'lucide-react-native';
import {
  Dialog,
  DialogHeader,
  EmptyState,
  Loader,
  ScreenHeader,
  SearchBar,
  Badge,
  Chip,
} from '../../../components/rnr';
import { getModelsByBrand, getSeriesByBrand } from '../../../api/masterData';

export default function SelectDeviceModelScreen({ navigation, route }) {
  const params = route?.params || {};
  const brandId = params.brandId;
  const [models, setModels] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Select Model" subtitle={params.brandName} onBack={() => navigation.goBack()} />
        <Loader label="Loading models..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Select Model"
        subtitle={params.brandName}
        onBack={() => navigation.goBack()}
        right={series.length ? (
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center active:opacity-70"
          >
            <Filter size={16} color="#00008B" />
          </Pressable>
        ) : null}
      />

      <View className="px-4 pt-4">
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder={`Search ${params.brandName || 'model'} model...`}
          onClear={() => setQ('')}
        />
      </View>

      {/* Active filter row */}
      {(selectedSeries || q) ? (
        <View className="flex-row flex-wrap px-4 pt-3">
          {selectedSeries ? (
            <Pressable
              onPress={() => setSelectedSeries(null)}
              className="flex-row items-center bg-primary rounded-full pl-3 pr-2 py-1 mr-2 mb-2 active:opacity-80"
            >
              <Text className="text-white text-[11px] font-bold mr-1">{selectedSeries.name}</Text>
              <X size={12} color="#fff" />
            </Pressable>
          ) : null}
          {q ? (
            <Pressable
              onPress={() => setQ('')}
              className="flex-row items-center bg-secondary rounded-full pl-3 pr-2 py-1 mr-2 mb-2 active:opacity-80"
            >
              <Text className="text-white text-[11px] font-bold mr-1">"{q}"</Text>
              <X size={12} color="#fff" />
            </Pressable>
          ) : null}
          <Text className="text-[11px] text-text-muted self-center">
            {filtered.length} model{filtered.length === 1 ? '' : 's'}
          </Text>
        </View>
      ) : null}

      {/* Series quick chips */}
      {!selectedSeries && !q && series.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}>
          <Chip label="All" active onPress={() => {}} />
          {series.slice(0, 8).map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              onPress={() => setSelectedSeries(s)}
            />
          ))}
          {series.length > 8 ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="rounded-full border border-primary px-3.5 py-2 mr-2 mb-2 flex-row items-center"
            >
              <Filter size={11} color="#00008B" />
              <Text className="text-[12px] font-bold text-primary ml-1">More</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Smartphone size={28} color="#00008B" />}
            title="No models match"
            description="Try clearing filters or searching with a different keyword."
            actionLabel={selectedSeries || q ? 'Clear filters' : null}
            onAction={() => { setSelectedSeries(null); setQ(''); }}
          />
        ) : (
          <View className="flex-row flex-wrap -mx-1.5">
            {filtered.map((m) => (
              <View key={m.id} style={{ width: '50%' }} className="p-1.5">
                <Pressable
                  onPress={() => navigation.navigate('DeviceColorStorage', { ...params, modelId: m.id, modelName: m.name })}
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

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <DialogHeader title={`Series · ${params.brandName || ''}`} onClose={() => setPickerOpen(false)} />
        <ScrollView style={{ maxHeight: 360 }}>
          <View className="flex-row flex-wrap -mx-1">
            <View className="w-1/2 p-1">
              <Pressable
                onPress={() => { setSelectedSeries(null); setPickerOpen(false); }}
                className={`rounded-xl py-3 px-3 border items-center ${!selectedSeries ? 'bg-primary border-primary' : 'bg-card border-border'}`}
              >
                <Text className={`text-[12px] font-bold ${!selectedSeries ? 'text-white' : 'text-text'}`}>All</Text>
              </Pressable>
            </View>
            {series.map((s) => {
              const active = selectedSeries?.id === s.id;
              return (
                <View key={s.id} className="w-1/2 p-1">
                  <Pressable
                    onPress={() => { setSelectedSeries(s); setPickerOpen(false); }}
                    className={`rounded-xl py-3 px-3 border items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[12px] font-bold text-center ${active ? 'text-white' : 'text-text'}`} numberOfLines={1}>{s.name}</Text>
                  </Pressable>
                </View>
              );
            })}
            {series.length === 0 ? (
              <Text className="text-text-muted text-center w-full py-4">No series available</Text>
            ) : null}
          </View>
        </ScrollView>
      </Dialog>
    </View>
  );
}
