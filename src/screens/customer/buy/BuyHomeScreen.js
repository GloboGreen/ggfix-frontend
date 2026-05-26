import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, ArrowRight, Smartphone, Laptop, Watch, Tablet, Headphones, Cable } from 'lucide-react-native';
import { SearchBar, SectionHeader, OfferBanner, Badge } from '../../../components/rnr';

const CATS = [
  { id: 'SMARTPHONE', name: 'Smartphones', emoji: '📱', color: '#EEF2FF' },
  { id: 'LAPTOP', name: 'Laptops', emoji: '💻', color: '#F5F3FF' },
  { id: 'SMARTWATCH', name: 'Smartwatches', emoji: '⌚', color: '#FFFBEB' },
  { id: 'TABLET', name: 'Tablets', emoji: '📲', color: '#F0F9FF' },
  { id: 'AUDIO', name: 'Audio', emoji: '🎧', color: '#FFF1F2' },
  { id: 'ACCESSORIES', name: 'Accessories', emoji: '🔌', color: '#ECFDF5' },
];

const COLLECTIONS = [
  { title: 'Best Selling Android', sub: 'Top picks under ₹15,000', palette: 'emerald', emoji: '🤖' },
  { title: 'Best Selling Apple', sub: 'Refurbished iPhones', palette: 'primary', emoji: '🍎' },
  { title: 'Premium Smartwatches', sub: 'Apple, Samsung & more', palette: 'violet', emoji: '⌚' },
];

export default function BuyHomeScreen({ navigation }) {
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
          <SearchBar placeholder="Search mobiles, accessories & more..." onPress={() => navigation.navigate('BuyCategory', { categoryId: 'SMARTPHONE', categoryName: 'Smartphones' })} />
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
        <View className="px-3 flex-row flex-wrap">
          {CATS.map((c) => (
            <View key={c.id} style={{ width: '33.333%' }} className="p-1.5">
              <Pressable
                onPress={() => navigation.navigate('BuyCategory', { categoryId: c.id, categoryName: c.name })}
                className="bg-card border border-border rounded-2xl p-3 items-center active:opacity-80"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="h-12 w-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: c.color }}>
                  <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
                </View>
                <Text className="text-[12px] font-bold text-text text-center" numberOfLines={1}>{c.name}</Text>
              </Pressable>
            </View>
          ))}
        </View>

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
