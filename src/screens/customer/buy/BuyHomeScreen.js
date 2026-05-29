import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, ArrowRight } from 'lucide-react-native';
import { SearchBar, SectionHeader, OfferBanner, Badge, EmptyState, Loader } from '../../../components/rnr';
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

// Resolve an admin-uploaded category image (base64 preferred) to an <Image>
// uri, or null when the category has no image.
function imgUri(item) {
  if (!item) return null;
  const b64 = item.imageBase64 && String(item.imageBase64).trim();
  if (b64) return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
  const url = item.imageUrl && String(item.imageUrl).trim();
  return url || null;
}

const COLLECTIONS = [
  { title: 'Best Selling Android', sub: 'Top picks under ₹15,000', palette: 'emerald', emoji: '🤖' },
  { title: 'Best Selling Apple', sub: 'Refurbished iPhones', palette: 'primary', emoji: '🍎' },
  { title: 'Premium Smartwatches', sub: 'Apple, Samsung & more', palette: 'violet', emoji: '⌚' },
];

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

  // Responsive grid: 2 cards per row on phones, 3 on wider screens/tablets.
  const numCols = width >= 600 ? 3 : 2;
  const gridGap = 10;
  const gridPadH = 14;
  const cardW = Math.floor((width - gridPadH * 2 - gridGap * (numCols - 1)) / numCols);
  const imgH = Math.round(cardW * 0.7);

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
              <Text className="text-white text-[22px] font-extrabold mt-1">Like new. Half the price.</Text>
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
          <SearchBar placeholder="Search mobiles, accessories & more..." onPress={() => navigation.navigate('BuyCategory', {})} />
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 mt-4">
          <OfferBanner
            badge="DEAL OF THE DAY"
            title="Up to 60% off — Today only"
            subtitle="Hand-picked refurbished devices with 6-month warranty."
            cta="Shop deals"
            palette="amber"
            onPress={() => navigation.navigate('BuyListing', { title: 'Deal of the Day' })}
          />
        </View>

        <SectionHeader title="Shop by Category" caption="Pick a category to browse" />
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
                  onPress={() => navigation.navigate('BuyCategory', { categoryId: c.id, categoryCode: code, categoryName: c.name })}
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
                    style={{ width: '100%', height: imgH, backgroundColor: uri ? '#F8FAFC' : meta.bg }}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={{ width: '90%', height: '90%' }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: 34 }}>{meta.emoji}</Text>
                    )}
                  </View>
                  <Text className="text-[13px] font-extrabold text-text text-center" numberOfLines={1}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <SectionHeader title="Top Collections" caption="Curated for you" />
        <View className="px-4">
          {COLLECTIONS.map((col, idx) => {
            const palettes = {
              primary: ['#00008B', '#2563EB'],
              emerald: ['#059669', '#10B981'],
              violet: ['#7C3AED', '#A855F7'],
              amber: ['#F59E0B', '#FB923C'],
            };
            const colors = palettes[col.palette] || palettes.primary;
            return (
              <Pressable
                key={col.title}
                onPress={() => navigation.navigate('BuyListing', { title: col.title })}
                className="rounded-2xl overflow-hidden mb-3"
                style={{ shadowColor: colors[0], shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
              >
                <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
                  <View className="flex-row items-center">
                    <View className="flex-1 pr-3">
                      <Badge variant="default" className="bg-white/20 self-start mb-2"><Text className="text-white text-[9px] font-bold">COLLECTION 0{idx + 1}</Text></Badge>
                      <Text className="text-white text-[18px] font-extrabold leading-6">{col.title}</Text>
                      <Text className="text-white/85 text-[12px] mt-1">{col.sub}</Text>
                      <View className="flex-row items-center mt-3 bg-white/20 self-start rounded-full px-3 py-1.5">
                        <Text className="text-white text-[12px] font-bold mr-1">View all</Text>
                        <ArrowRight size={13} color="#fff" />
                      </View>
                    </View>
                    <View className="h-20 w-20 rounded-full bg-white/15 items-center justify-center">
                      <Text style={{ fontSize: 40 }}>{col.emoji}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
