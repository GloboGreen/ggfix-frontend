import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Volume2,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { ScreenHeader, SearchBar, SectionHeader, Badge } from '../../../components/rnr';

const CATEGORIES = [
  { id: 'SMARTPHONE', name: 'Smart Phone', sub: 'iPhone · Android', icon: Smartphone, gradient: ['#EEF2FF', '#E0E7FF'], iconColor: '#00008B', popular: true },
  { id: 'TABLET',     name: 'Tablet',      sub: 'iPad · Galaxy Tab',  icon: Tablet,     gradient: ['#F0F9FF', '#E0F2FE'], iconColor: '#0369A1' },
  { id: 'LAPTOP',     name: 'Laptop',      sub: 'Mac · Dell · HP',    icon: Laptop,     gradient: ['#F5F3FF', '#EDE9FE'], iconColor: '#7C3AED', popular: true },
  { id: 'SMARTWATCH', name: 'Smartwatch',  sub: 'Apple · Wear OS',    icon: Watch,      gradient: ['#FFFBEB', '#FEF3C7'], iconColor: '#B45309' },
  { id: 'AIRPODS',    name: 'Airpods',     sub: 'AirPods · Earbuds',  icon: Headphones, gradient: ['#FFF1F2', '#FFE4E6'], iconColor: '#BE185D' },
  { id: 'SPEAKERS',   name: 'Speakers',    sub: 'Bluetooth · Smart',  icon: Volume2,    gradient: ['#ECFDF5', '#D1FAE5'], iconColor: '#047857' },
];

export default function ChooseDeviceScreen({ navigation, route }) {
  const params = route?.params || {};

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Choose a Device" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Customer chip */}
        {params.customer ? (
          <View className="bg-card border border-border rounded-2xl p-3 mb-4 flex-row items-center">
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

        {/* Search */}
        <SearchBar placeholder="Search brand or model..." onPress={() => {}} className="mb-4" />

        {/* Hero tip */}
        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-3 mb-4 flex-row items-center">
          <Sparkles size={16} color="#00008B" />
          <Text className="text-[12px] text-text ml-2 flex-1">
            Pick the device category to start the booking flow.
          </Text>
        </View>

        <Text className="text-[11px] font-bold text-text-muted tracking-widest mb-2 px-1">CATEGORIES</Text>

        <View className="flex-row flex-wrap -mx-1.5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <View key={c.id} style={{ width: '50%' }} className="p-1.5">
                <Pressable
                  onPress={() => navigation.navigate('SelectDeviceBrand', { ...params, categoryId: c.id, categoryName: c.name })}
                  className="rounded-2xl overflow-hidden border border-border active:opacity-85"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
                >
                  <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 14 }}>
                    {c.popular ? (
                      <View className="absolute right-2 top-2 bg-danger rounded-full px-2 py-0.5">
                        <Text className="text-white text-[9px] font-bold tracking-wide">POPULAR</Text>
                      </View>
                    ) : null}

                    <View
                      className="h-12 w-12 rounded-2xl bg-white items-center justify-center mb-3"
                      style={{ shadowColor: c.iconColor, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
                    >
                      <Icon size={24} color={c.iconColor} strokeWidth={2} />
                    </View>

                    <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{c.name}</Text>
                    <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{c.sub}</Text>

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

        <View className="bg-card border border-border rounded-2xl p-3 mt-4 flex-row items-center">
          <View className="h-9 w-9 rounded-full bg-warning/10 items-center justify-center mr-3">
            <Search size={16} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="text-[12px] font-extrabold text-text">Can't find your device?</Text>
            <Text className="text-[11px] text-text-muted mt-0.5">Add a custom device — we'll match it manually.</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </View>
      </ScrollView>
    </View>
  );
}
