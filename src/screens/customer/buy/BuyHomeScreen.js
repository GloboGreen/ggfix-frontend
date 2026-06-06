import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, ChevronRight } from 'lucide-react-native';
import { SearchBar, SectionHeader, EmptyState, Loader } from '../../../components/rnr';
import { getDeviceCategories } from '../../../api/masterData';

// Per-code emoji/tint + tagline fallback so admin-driven categories keep a
// friendly visual when they have no uploaded image yet.
const CODE_META = {
  MOBILE:        { emoji: '📱', bg: '#EEF2FF', sub: 'iPhone, Android, all brands' },
  SMARTPHONE:    { emoji: '📱', bg: '#EEF2FF', sub: 'iPhone, Android, all brands' },
  LAPTOP:        { emoji: '💻', bg: '#F5F3FF', sub: 'Apple, Dell, HP, Lenovo, Asus' },
  SMARTWATCH:    { emoji: '⌚', bg: '#FFFBEB', sub: 'Apple Watch, Wear OS, fitness' },
  SMARTWATCHES:  { emoji: '⌚', bg: '#FFFBEB', sub: 'Apple Watch, Wear OS, fitness' },
  TABLET:        { emoji: '📲', bg: '#F0F9FF', sub: 'iPad, Galaxy Tab, more' },
  AUDIO:         { emoji: '🎧', bg: '#FFF1F2', sub: 'Earbuds, headphones, speakers' },
  AUDIO_DEVICES: { emoji: '🎧', bg: '#FFF1F2', sub: 'Earbuds, headphones, speakers' },
};
const DEFAULT_META = { emoji: '📱', bg: '#EEF2FF', sub: 'Tap to see all listings' };

function imgUri(item) {
  if (!item) return null;
  const b64 = item.imageBase64 && String(item.imageBase64).trim();
  if (b64) return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
  const url = item.imageUrl && String(item.imageUrl).trim();
  return url || null;
}

export default function BuyHomeScreen({ navigation }) {
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

  const openCategory = (c) => {
    navigation.navigate('BuyListing', {
      categoryId: c.id,
      categoryCode: (c.code || '').toUpperCase(),
      categoryName: c.name,
      title: c.name,
    });
  };

  // Same grid math as Repair Home — 2 cols phones, 3 cols tablets, 0.66 image
  // aspect. Keeps the three home screens visually consistent.
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
          <View className="px-4 flex-row items-start">
            <View className="flex-1">
              <Text className="text-white text-[12px] font-bold tracking-widest">SHOP REFURBISHED</Text>
              <Text className="text-white text-[24px] font-extrabold mt-1">Pick a category to begin</Text>
              <Text className="text-white/80 text-[13px] mt-1">Best deals · Verified shops · Quality assured</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('MyCart')}
              className="h-10 w-10 rounded-full bg-white/15 items-center justify-center active:opacity-80"
            >
              <ShoppingCart size={18} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>
        <View className="px-4 -mt-5">
          <SearchBar placeholder="Search mobiles, accessories & more..." onPress={() => navigation.navigate('BuyListing', {})} />
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title="Shop by Category" caption="Tap a category to see its products" />
        {loading ? (
          <View className="py-8"><Loader label="Loading categories..." /></View>
        ) : cats.length === 0 ? (
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
                  onPress={() => openCategory(c)}
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
      </ScrollView>
    </View>
  );
}
