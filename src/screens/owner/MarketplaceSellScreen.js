import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Smartphone, Wrench, ChevronRight } from 'lucide-react-native';
import { ScreenHeader } from '../../components/rnr';

export default function MarketplaceSellScreen({ navigation }) {
  const tiles = [
    {
      key: 'SelectCategory',
      title: 'Mobile',
      sub: 'List a phone for sale (device condition, photos, price)',
      icon: Smartphone,
      color: '#00008B',
      bg: 'bg-primary/10',
      params: { flow: 'OWNER_LIST' },
    },
    {
      key: 'OwnerSellSpareParts',
      title: 'Spare Parts',
      sub: 'List individual parts (display combo, battery, camera…)',
      icon: Wrench,
      color: '#10B981',
      bg: 'bg-success/10',
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Sell" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-text-muted text-xs px-1 mb-3 uppercase tracking-widest font-extrabold">
          Choose Sales Category
        </Text>

        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Pressable
              key={t.key}
              onPress={() => navigation.navigate(t.key, t.params || undefined)}
              className="bg-card border border-border rounded-2xl p-4 mb-3 flex-row items-center active:opacity-80"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
            >
              <View className={`h-14 w-14 rounded-2xl items-center justify-center mr-3 ${t.bg}`}>
                <Icon size={26} color={t.color} />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-extrabold text-text">{t.title}</Text>
                <Text className="text-[12px] text-text-muted mt-0.5" numberOfLines={2}>{t.sub}</Text>
              </View>
              <ChevronRight size={20} color="#64748B" />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
