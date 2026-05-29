import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Smartphone, Tablet, Laptop, Watch, Headphones, Volume2, ChevronRight,
} from 'lucide-react-native';
import {
  ScreenHeader, SearchBar, EmptyState, Loader, Badge,
} from '../../../components/rnr';
import { getDeviceCategories } from '../../../api/masterData';

const CODE_META = {
  MOBILE:        { icon: Smartphone, color: '#00008B', bg: 'bg-primary/10', sub: 'Smartphones' },
  SMARTPHONE:    { icon: Smartphone, color: '#00008B', bg: 'bg-primary/10', sub: 'Smartphones' },
  LAPTOP:        { icon: Laptop,     color: '#7C3AED', bg: 'bg-primary/10', sub: 'Laptops & Notebooks' },
  TABLET:        { icon: Tablet,     color: '#0369A1', bg: 'bg-info/10',    sub: 'Tablets' },
  SMARTWATCH:    { icon: Watch,      color: '#B45309', bg: 'bg-warning/10', sub: 'Smart Watches' },
  SMARTWATCHES:  { icon: Watch,      color: '#B45309', bg: 'bg-warning/10', sub: 'Smart Watches' },
  AUDIO:         { icon: Headphones, color: '#BE185D', bg: 'bg-danger/10',  sub: 'Headphones & Earbuds' },
  AUDIO_DEVICES: { icon: Headphones, color: '#BE185D', bg: 'bg-danger/10',  sub: 'Headphones & Earbuds' },
  SPEAKER:       { icon: Volume2,    color: '#047857', bg: 'bg-success/10', sub: 'Speakers' },
};
const DEFAULT_META = { icon: Smartphone, color: '#00008B', bg: 'bg-primary/10', sub: 'Devices' };

export default function ChooseDeviceScreen({ navigation, route }) {
  const params = route?.params || {};
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await getDeviceCategories();
        setCats((list || []).filter((c) => c.isActive !== false));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return cats;
    const needle = q.toLowerCase();
    return cats.filter((c) => (c.name || '').toLowerCase().includes(needle));
  }, [cats, q]);

  const onPick = (c) => navigation.navigate('SelectDeviceBrand', {
    ...params,
    categoryId: c.id,
    categoryCode: (c.code || '').toUpperCase(),
    categoryName: c.name,
  });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Select Category" onBack={() => navigation.goBack()} />

      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        {params.customer ? (
          <View className="bg-card border border-border rounded-2xl p-3 mb-3 flex-row items-center">
            <View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center mr-2.5">
              <Text className="text-[13px] font-extrabold text-primary">
                {(params.customer.name || '?').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-text-muted">Booking for</Text>
              <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{params.customer.name}</Text>
            </View>
            <Badge variant="softSuccess">CUSTOMER</Badge>
          </View>
        ) : null}
        <SearchBar value={q} onChangeText={setQ} placeholder="Search category" onClear={() => setQ('')} />
      </View>

      {loading ? (
        <Loader label="Loading categories..." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {filtered.length === 0 ? (
            <EmptyState title="No categories" description="No device categories published yet." />
          ) : (
            filtered.map((c) => {
              const code = (c.code || '').toUpperCase();
              const meta = CODE_META[code] || DEFAULT_META;
              const Icon = meta.icon;
              const thumb = c.imageUrl || c.imageBase64;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onPick(c)}
                  className="flex-row items-center bg-card border border-border rounded-2xl p-3.5 mb-3 active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                >
                  <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-3 overflow-hidden ${meta.bg}`}>
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                    ) : (
                      <Icon size={24} color={meta.color} strokeWidth={2} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-extrabold text-text">{c.name}</Text>
                    <Text className="text-[12px] text-text-muted mt-0.5">{meta.sub}</Text>
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
