import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Smartphone, Laptop, Watch, Tablet, Headphones, Wrench, ChevronRight } from 'lucide-react-native';
import { ScreenHeader } from '../../components/rnr';

// Pick the device icon based on the category code.
const ICONS_BY_CODE = {
  MOBILE: Smartphone,
  SMARTPHONE: Smartphone,
  LAPTOP: Laptop,
  TABLET: Tablet,
  SMARTWATCH: Watch,
  SMARTWATCHES: Watch,
  AUDIO: Headphones,
  AUDIO_DEVICES: Headphones,
};

export default function OwnerSellChooseSalesCategoryScreen({ navigation, route }) {
  const params = route?.params || {};
  const { categoryCode, categoryName, modelName, modelImageUrl } = params;
  const DeviceIcon = ICONS_BY_CODE[(categoryCode || '').toUpperCase()] || Smartphone;

  const tiles = [
    {
      key: 'device',
      title: categoryName || 'Mobile',
      sub: `List the whole ${(categoryName || 'device').toLowerCase()} for sale`,
      Icon: DeviceIcon,
      color: '#00008B',
      bg: 'bg-primary/10',
      onPress: () => navigation.navigate('SelectVariant', params),
    },
    {
      key: 'parts',
      title: 'Spare Parts',
      sub: 'List individual parts (display, battery, camera…)',
      Icon: Wrench,
      color: '#10B981',
      bg: 'bg-success/10',
      onPress: () => navigation.navigate('OwnerSellSpareParts', params),
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Choose Sales Category" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {modelName ? (
          <View className="bg-card border border-border rounded-2xl p-3 mb-4 flex-row items-center">
            <View className="h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center mr-3 overflow-hidden">
              {modelImageUrl ? (
                <Image source={{ uri: modelImageUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
              ) : (
                <DeviceIcon size={22} color="#00008B" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Selected</Text>
              <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{modelName}</Text>
              {categoryName ? <Text className="text-[11px] text-text-muted">{categoryName}</Text> : null}
            </View>
          </View>
        ) : null}

        <Text className="text-text-muted text-xs px-1 mb-3 uppercase tracking-widest font-extrabold">
          What are you selling?
        </Text>

        {tiles.map((t) => {
          const Icon = t.Icon;
          return (
            <Pressable
              key={t.key}
              onPress={t.onPress}
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
