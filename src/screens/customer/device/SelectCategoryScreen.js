import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Headphones,
  Volume2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { EmptyState, Loader, SectionHeader } from '../../../components/rnr';
import { getDeviceCategories } from '../../../api/masterData';

const FALLBACK_CATS = [
  { id: 'SMARTPHONE', name: 'Smartphones', sub: 'iPhone · Android', icon: Smartphone, gradient: ['#EEF2FF', '#E0E7FF'], iconColor: '#00008B', popular: true, emoji: '📱' },
  { id: 'LAPTOP',     name: 'Laptops',     sub: 'Mac · Dell · HP',  icon: Laptop,     gradient: ['#F5F3FF', '#EDE9FE'], iconColor: '#7C3AED', popular: true, emoji: '💻' },
  { id: 'SMARTWATCH', name: 'Smartwatches', sub: 'Apple · Wear OS', icon: Watch,      gradient: ['#FFFBEB', '#FEF3C7'], iconColor: '#B45309', emoji: '⌚' },
  { id: 'TABLET',     name: 'Tablets',     sub: 'iPad · Galaxy Tab', icon: Tablet,    gradient: ['#F0F9FF', '#E0F2FE'], iconColor: '#0369A1', emoji: '📲' },
  { id: 'AUDIO',      name: 'Audio Devices', sub: 'Buds · Headphones', icon: Headphones, gradient: ['#FFF1F2', '#FFE4E6'], iconColor: '#BE185D', emoji: '🎧' },
  { id: 'SPEAKER',    name: 'Speakers',    sub: 'Bluetooth · Smart', icon: Volume2,   gradient: ['#ECFDF5', '#D1FAE5'], iconColor: '#047857', emoji: '🔊' },
];

const ICON_BY_ID = {
  SMARTPHONE: { icon: Smartphone, color: '#00008B', gradient: ['#EEF2FF', '#E0E7FF'], emoji: '📱' },
  LAPTOP: { icon: Laptop, color: '#7C3AED', gradient: ['#F5F3FF', '#EDE9FE'], emoji: '💻' },
  SMARTWATCH: { icon: Watch, color: '#B45309', gradient: ['#FFFBEB', '#FEF3C7'], emoji: '⌚' },
  TABLET: { icon: Tablet, color: '#0369A1', gradient: ['#F0F9FF', '#E0F2FE'], emoji: '📲' },
  AUDIO: { icon: Headphones, color: '#BE185D', gradient: ['#FFF1F2', '#FFE4E6'], emoji: '🎧' },
  SPEAKER: { icon: Volume2, color: '#047857', gradient: ['#ECFDF5', '#D1FAE5'], emoji: '🔊' },
};

const POPULAR = new Set(['SMARTPHONE', 'LAPTOP']);

export default function SelectCategoryScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getDeviceCategories();
        setCats(list.length ? list : FALLBACK_CATS);
      } catch (_) { setCats(FALLBACK_CATS); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader label="Loading categories..." />;

  if (!cats.length) {
    return <EmptyState title="No categories" description="Master data isn't seeded yet." />;
  }

  const flowSub = flow === 'SELL' ? 'Sell your device' : flow === 'REPAIR' ? 'Book a repair' : 'Add to your devices';

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#00008B', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 4, paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <Text className="text-white/80 text-[11px] font-bold tracking-widest">{flowSub.toUpperCase()}</Text>
        <Text className="text-white text-[22px] font-extrabold mt-1">Pick a device category</Text>
        <Text className="text-white/85 text-[12px] mt-1">We support all major device types & brands.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-3 mb-4 flex-row items-center -mt-4">
          <Sparkles size={14} color="#00008B" />
          <Text className="text-[12px] text-text ml-2 flex-1">Pick a category to continue with brand & model selection.</Text>
        </View>

        <Text className="text-[11px] font-extrabold text-text-muted tracking-widest mb-2 px-1">CATEGORIES</Text>
        <View className="flex-row flex-wrap -mx-1.5">
          {cats.map((c) => {
            const meta = ICON_BY_ID[c.id] || ICON_BY_ID.SMARTPHONE;
            const Icon = meta.icon;
            const isPopular = POPULAR.has(c.id) || c.popular;
            return (
              <View key={c.id} style={{ width: '50%' }} className="p-1.5">
                <Pressable
                  onPress={() => navigation.navigate('SelectBrand', { flow, categoryId: c.id, categoryName: c.name })}
                  className="rounded-2xl overflow-hidden border border-border active:opacity-85"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
                >
                  <LinearGradient colors={meta.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 14 }}>
                    {isPopular ? (
                      <View className="absolute right-2 top-2 bg-danger rounded-full px-2 py-0.5">
                        <Text className="text-white text-[9px] font-bold tracking-wide">POPULAR</Text>
                      </View>
                    ) : null}
                    <View
                      className="h-12 w-12 rounded-2xl bg-white items-center justify-center mb-3"
                      style={{ shadowColor: meta.color, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
                    >
                      <Icon size={24} color={meta.color} strokeWidth={2} />
                    </View>
                    <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{c.name}</Text>
                    {c.sub ? (
                      <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{c.sub}</Text>
                    ) : null}
                    <View className="flex-row items-center mt-3 bg-white/70 self-start rounded-full pl-2.5 pr-1.5 py-1">
                      <Text className="text-[10px] font-bold text-text mr-0.5">Select</Text>
                      <ChevronRight size={11} color="#0F172A" />
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
