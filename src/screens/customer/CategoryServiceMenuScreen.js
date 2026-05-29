import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Wrench, Tag, ShoppingBag } from 'lucide-react-native';

// Static service images. Replace the placeholder PNGs in
// src/assets/services/ with the real artwork (keep the same filenames).
const SERVICE_IMAGES = {
  repair: require('../../assets/services/repair.png'),
  sell: require('../../assets/services/sell.png'),
  buy: require('../../assets/services/buy.png'),
};

export default function CategoryServiceMenuScreen({ navigation, route }) {
  const { categoryId, categoryCode, categoryName } = route.params || {};
  const deviceLabel = categoryName || 'device';

  const options = [
    {
      key: 'repair',
      title: 'Repair Service',
      sub: `Book a repair for your ${deviceLabel}`,
      icon: Wrench,
      onPress: () =>
        navigation.navigate('RepairSelectDevice', { flow: 'REPAIR', categoryId, categoryCode, categoryName }),
    },
    {
      key: 'sell',
      title: 'Sell Product',
      sub: 'Get an instant quote and sell',
      icon: Tag,
      onPress: () => navigation.navigate('SellSelectDevice', { flow: 'SELL', categoryId, categoryCode, categoryName }),
    },
    {
      key: 'buy',
      title: 'Buy Product',
      sub: 'Shop devices and accessories',
      icon: ShoppingBag,
      onPress: () => navigation.navigate('BuyCategory', { categoryId, categoryName }),
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <Text className="text-[14px] text-text-muted mb-4">
          What would you like to do with your{' '}
          <Text className="font-extrabold text-text">{deviceLabel}</Text>?
        </Text>

        {options.map((o) => {
          const Icon = o.icon;
          return (
            <Pressable
              key={o.key}
              onPress={o.onPress}
              className="bg-card border border-border rounded-2xl overflow-hidden mb-3 active:opacity-90"
            >
              <Image
                source={SERVICE_IMAGES[o.key]}
                style={{ width: '100%', height: 150, backgroundColor: '#FFFFFF' }}
                resizeMode="contain"
              />
              <View className="flex-row items-center p-3">
                <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                  <Icon size={19} color="#00008B" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-[15px] font-extrabold text-text">{o.title}</Text>
                  <Text className="text-[12px] text-text-muted mt-0.5">{o.sub}</Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
