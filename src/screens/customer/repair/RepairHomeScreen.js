import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Laptop, Watch, Tablet, Headphones, ChevronRight, ShieldCheck, Wrench, Clock } from 'lucide-react-native';
import { SearchBar, SectionHeader, OfferBanner } from '../../../components/rnr';

const CATS = [
  { id: 'SMARTPHONE', name: 'Smartphones', sub: 'iPhone, Android, all brands', emoji: '📱', icon: <Smartphone size={24} color="#00008B" />, color: '#EEF2FF' },
  { id: 'LAPTOP', name: 'Laptops', sub: 'Apple, Dell, HP, Lenovo, Asus', emoji: '💻', icon: <Laptop size={24} color="#7C3AED" />, color: '#F5F3FF' },
  { id: 'SMARTWATCH', name: 'Smartwatches', sub: 'Apple Watch, Wear OS, fitness', emoji: '⌚', icon: <Watch size={24} color="#B45309" />, color: '#FFFBEB' },
  { id: 'TABLET', name: 'Tablets', sub: 'iPad, Galaxy Tab, more', emoji: '📲', icon: <Tablet size={24} color="#0369A1" />, color: '#F0F9FF' },
  { id: 'AUDIO', name: 'Audio Devices', sub: 'Earbuds, headphones, speakers', emoji: '🎧', icon: <Headphones size={24} color="#BE185D" />, color: '#FFF1F2' },
];

const PROMISES = [
  { icon: <ShieldCheck size={18} color="#10B981" />, label: '30-day Warranty' },
  { icon: <Wrench size={18} color="#00008B" />, label: 'Certified Techs' },
  { icon: <Clock size={18} color="#F59E0B" />, label: 'Same-day Service' },
];

export default function RepairHomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 12, paddingBottom: 32, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View className="px-4">
            <Text className="text-white text-[12px] font-bold tracking-widest">REPAIR HUB</Text>
            <Text className="text-white text-[24px] font-extrabold mt-1">What do you want to repair?</Text>
            <Text className="text-white/80 text-[13px] mt-1">Trusted shops · Doorstep pickup · Genuine parts</Text>
          </View>
        </LinearGradient>
        <View className="px-4 -mt-6">
          <SearchBar placeholder="Search your model — e.g. iPhone 14" onPress={() => navigation.navigate('RepairSelectDevice', { flow: 'REPAIR' })} />
        </View>
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
        <View className="px-3">
          {CATS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => navigation.navigate('RepairSelectDevice', { flow: 'REPAIR', categoryId: c.id, categoryName: c.name })}
              className="bg-card border border-border rounded-2xl p-4 flex-row items-center mb-3 mx-1 active:opacity-80"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
            >
              <View className="h-14 w-14 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: c.color }}>
                <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-text">{c.name}</Text>
                <Text className="text-[12px] text-text-muted mt-0.5">{c.sub}</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

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
