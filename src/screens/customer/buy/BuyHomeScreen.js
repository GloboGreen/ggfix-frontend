import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, ChevronRight } from 'lucide-react-native';
import { SearchBar, EmptyState, Loader } from '../../../components/rnr';
import { getDeviceCategories } from '../../../api/masterData';

// Per-code emoji/tint fallback so admin-driven categories keep a friendly
// visual when they have no uploaded image yet.
const CODE_META = {
  MOBILE:        { emoji: '📱', bg: '#EEF2FF' },
  SMARTPHONE:    { emoji: '📱', bg: '#EEF2FF' },
  LAPTOP:        { emoji: '💻', bg: '#F5F3FF' },
  SMARTWATCH:    { emoji: '⌚', bg: '#FFFBEB' },
  SMARTWATCHES:  { emoji: '⌚', bg: '#FFFBEB' },
  TABLET:        { emoji: '📲', bg: '#F0F9FF' },
  AUDIO:         { emoji: '🎧', bg: '#FFF1F2' },
  AUDIO_DEVICES: { emoji: '🎧', bg: '#FFF1F2' },
};
const DEFAULT_META = { emoji: '📱', bg: '#EEF2FF' };

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

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 12, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View className="px-4 flex-row items-center">
            <View className="flex-1">
              <Text className="text-white text-[12px] font-bold tracking-widest">SHOP REFURBISHED</Text>
              <Text className="text-white text-[22px] font-extrabold mt-1">Pick a category to begin</Text>
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
        <View className="px-4 mt-4 mb-2">
          <Text className="text-[15px] font-extrabold text-text">Shop by Category</Text>
          <Text className="text-[11px] text-text-muted mt-0.5">Tap a category to see its products</Text>
        </View>

        {loading ? (
          <View className="py-8"><Loader label="Loading categories..." /></View>
        ) : cats.length === 0 ? (
          <View className="px-4">
            <EmptyState title="No categories yet" description="The admin hasn't published any device categories." />
          </View>
        ) : (
          <View className="px-3">
            {cats.map((c) => {
              const code = (c.code || '').toUpperCase();
              const meta = CODE_META[code] || DEFAULT_META;
              const uri = imgUri(c);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => openCategory(c)}
                  className="flex-row items-center bg-card border border-border rounded-2xl p-3 mb-2 active:opacity-80"
                  style={{
                    shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
                  }}
                >
                  <View
                    className="rounded-xl items-center justify-center overflow-hidden mr-3"
                    style={{ width: 56, height: 56, backgroundColor: uri ? '#F8FAFC' : meta.bg }}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={{ width: '90%', height: '90%' }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{c.name}</Text>
                    {c.description ? (
                      <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{c.description}</Text>
                    ) : (
                      <Text className="text-[11px] text-text-muted mt-0.5">Browse {c.name.toLowerCase()} listings</Text>
                    )}
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
