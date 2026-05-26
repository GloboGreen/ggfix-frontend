import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tag, ChevronRight, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react-native';
import { SectionHeader, OfferBanner } from '../../../components/rnr';

const CATS = [
  { id: 'SMARTPHONE', name: 'Smartphones',   sub: 'Get instant quote',    emoji: '📱', color: '#EEF2FF' },
  { id: 'LAPTOP',     name: 'Laptops',       sub: 'Fair market value',    emoji: '💻', color: '#F5F3FF' },
  { id: 'SMARTWATCH', name: 'Smartwatches',  sub: 'All brands accepted',  emoji: '⌚', color: '#FFFBEB' },
  { id: 'TABLET',     name: 'Tablets',       sub: 'Top price guaranteed', emoji: '📲', color: '#F0F9FF' },
  { id: 'AUDIO',      name: 'Audio Devices', sub: 'Earbuds & headphones', emoji: '🎧', color: '#FFF1F2' },
];

const STEPS = [
  { n: 1, title: 'Tell us about your device', sub: 'Model · condition · accessories' },
  { n: 2, title: 'Get quotes from shops',     sub: 'Up to 5 instant quotes' },
  { n: 3, title: 'Pickup at your doorstep',   sub: 'Pick the best · free pickup' },
];

export default function SellHomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#059669' }}>
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 8, paddingBottom: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <View className="px-4">
            <Text className="text-white text-[10px] font-bold tracking-widest">SELL & EARN</Text>
            <Text className="text-white text-[19px] font-extrabold mt-0.5">Turn your old tech into cash</Text>
            <Text className="text-white/85 text-[11px] mt-1">Best price from verified shops nearby.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Trust strip — sits cleanly below the header */}
        <View className="px-4 mt-3">
          <View className="flex-row bg-card border border-border rounded-xl p-2"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
            <View className="flex-1 items-center px-1">
              <TrendingUp size={14} color="#10B981" />
              <Text className="text-[10px] font-extrabold text-text mt-0.5 text-center">Best Price</Text>
            </View>
            <View className="w-px bg-border my-1" />
            <View className="flex-1 items-center px-1">
              <ShieldCheck size={14} color="#2563EB" />
              <Text className="text-[10px] font-extrabold text-text mt-0.5 text-center">Verified Shops</Text>
            </View>
            <View className="w-px bg-border my-1" />
            <View className="flex-1 items-center px-1">
              <Sparkles size={14} color="#F59E0B" />
              <Text className="text-[10px] font-extrabold text-text mt-0.5 text-center">Free Pickup</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Select Category" caption="What are you selling today?" />
        <View className="px-3">
          {CATS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => navigation.navigate('SellSelectDevice', { flow: 'SELL', categoryId: c.id })}
              className="bg-card border border-border rounded-xl px-2.5 py-2 flex-row items-center mb-2 mx-1 active:opacity-80"
            >
              <View className="h-10 w-10 rounded-xl items-center justify-center mr-2.5" style={{ backgroundColor: c.color }}>
                <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-extrabold text-text">{c.name}</Text>
                <Text className="text-[11px] text-text-muted mt-0.5">{c.sub}</Text>
              </View>
              <View className="bg-success/10 rounded-full px-2 py-0.5 flex-row items-center mr-1">
                <Tag size={10} color="#10B981" />
                <Text className="text-[10px] font-bold text-success ml-1">Sell</Text>
              </View>
              <ChevronRight size={14} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        <SectionHeader title="How it works" />
        <View className="px-4">
          {STEPS.map((s) => (
            <View key={s.n} className="flex-row items-start mb-2">
              <View className="h-7 w-7 rounded-full bg-primary items-center justify-center mr-2">
                <Text className="text-white text-[11px] font-extrabold">{s.n}</Text>
              </View>
              <View className="flex-1 bg-card border border-border rounded-xl px-2.5 py-2">
                <Text className="text-[12px] font-extrabold text-text">{s.title}</Text>
                <Text className="text-[10px] text-text-muted mt-0.5">{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="px-4 mt-2">
          <OfferBanner
            badge="GUARANTEED"
            title="Top price or free pickup"
            subtitle="Not happy with the offer? Free pickup, no questions."
            cta="Learn more"
            palette="emerald"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}
