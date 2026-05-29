import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Laptop, Watch, Tablet, Headphones, ChevronRight, ShieldCheck, Wrench, Clock } from 'lucide-react-native';
import { SectionHeader, OfferBanner, EmptyState, Loader } from '../../../components/rnr';
import { getDeviceCategories } from '../../../api/masterData';

// Per-code icon/emoji/tint so admin-driven categories keep a friendly visual
// while still passing the real category id/code/name down the cascade.
const CODE_META = {
  MOBILE:        { icon: Smartphone, color: '#00008B', bg: '#EEF2FF', emoji: '📱', sub: 'iPhone, Android, all brands' },
  SMARTPHONE:    { icon: Smartphone, color: '#00008B', bg: '#EEF2FF', emoji: '📱', sub: 'iPhone, Android, all brands' },
  LAPTOP:        { icon: Laptop,     color: '#7C3AED', bg: '#F5F3FF', emoji: '💻', sub: 'Apple, Dell, HP, Lenovo, Asus' },
  SMARTWATCH:    { icon: Watch,      color: '#B45309', bg: '#FFFBEB', emoji: '⌚', sub: 'Apple Watch, Wear OS, fitness' },
  WATCH:         { icon: Watch,      color: '#B45309', bg: '#FFFBEB', emoji: '⌚', sub: 'Apple Watch, Wear OS, fitness' },
  TABLET:        { icon: Tablet,     color: '#0369A1', bg: '#F0F9FF', emoji: '📲', sub: 'iPad, Galaxy Tab, more' },
  AUDIO:         { icon: Headphones, color: '#BE185D', bg: '#FFF1F2', emoji: '🎧', sub: 'Earbuds, headphones, speakers' },
  AUDIO_DEVICES: { icon: Headphones, color: '#BE185D', bg: '#FFF1F2', emoji: '🎧', sub: 'Earbuds, headphones, speakers' },
};
const DEFAULT_META = { icon: Smartphone, color: '#00008B', bg: '#EEF2FF', emoji: '📱', sub: 'Tap to see all brands' };

// Resolve an admin-uploaded category image (base64 preferred) to an <Image>
// uri, or null when the category has no image.
function imgUri(item) {
  if (!item) return null;
  const b64 = item.imageBase64 && String(item.imageBase64).trim();
  if (b64) return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
  const url = item.imageUrl && String(item.imageUrl).trim();
  return url || null;
}

const PROMISES = [
  { icon: <ShieldCheck size={18} color="#10B981" />, label: '30-day Warranty' },
  { icon: <Wrench size={18} color="#00008B" />, label: 'Certified Techs' },
  { icon: <Clock size={18} color="#F59E0B" />, label: 'Same-day Service' },
];

export default function RepairHomeScreen({ navigation }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      try {
        const list = await getDeviceCategories();
        setCats((list || []).filter((c) => c.isActive !== false));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader label="Loading categories..." />;

  // Responsive grid: 2 cards per row on phones, 3 on wider screens/tablets.
  const numCols = width >= 600 ? 3 : 2;
  const gridGap = 10;
  const gridPadH = 14;
  const cardW = Math.floor((width - gridPadH * 2 - gridGap * (numCols - 1)) / numCols);
  const imgH = Math.round(cardW * 0.66);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 12, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View className="px-4">
            <Text className="text-white text-[12px] font-bold tracking-widest">REPAIR HUB</Text>
            <Text className="text-white text-[24px] font-extrabold mt-1">What do you want to repair?</Text>
            <Text className="text-white/80 text-[13px] mt-1">Trusted shops · Doorstep pickup · Genuine parts</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row px-4 mt-4">
          {PROMISES.map((p) => (
            <View key={p.label} className="flex-1 bg-card border border-border rounded-2xl py-3 px-2 items-center mx-1">
              {p.icon}
              <Text className="text-[10px] font-bold text-text text-center mt-1.5">{p.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Choose Your Device" caption="Pick the category you need fixed" />
        {cats.length === 0 ? (
          <View className="px-4">
            <EmptyState title="No categories yet" description="The admin hasn't published any device categories." />
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ paddingHorizontal: gridPadH }}>
            {cats.map((c, i) => {
              const code = (c.code || '').toUpperCase();
              const meta = CODE_META[code] || DEFAULT_META;
              const uri = imgUri(c);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => navigation.navigate('RepairSelectDevice', { flow: 'REPAIR', categoryId: c.id, categoryCode: code, categoryName: c.name })}
                  className="bg-card border border-border rounded-2xl p-2.5 active:opacity-80"
                  style={{
                    width: cardW,
                    marginLeft: i % numCols === 0 ? 0 : gridGap,
                    marginBottom: gridGap,
                    shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
                  }}
                >
                  <View
                    className="rounded-xl items-center justify-center overflow-hidden mb-2"
                    style={{ width: '100%', height: imgH, backgroundColor: uri ? '#FFFFFF' : meta.bg }}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: 34 }}>{meta.emoji}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-[14px] font-extrabold text-text" numberOfLines={1}>{c.name}</Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                  <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={2}>{meta.sub}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View className="px-4 mt-2">
          <OfferBanner
            badge="LIMITED TIME"
            title="Flat 15% OFF on first repair"
            subtitle="Use code FIRSTFIX at checkout — auto-applied for new users."
            cta="Book now"
            palette="emerald"
            onPress={() => navigation.navigate('RepairSelectDevice', { flow: 'REPAIR' })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
