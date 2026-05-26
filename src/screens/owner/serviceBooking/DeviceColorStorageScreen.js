import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Smartphone,
  Cpu,
  HardDrive,
  Palette,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import { BottomActionBar, Input, Loader, ScreenHeader, Badge } from '../../../components/rnr';
import { getColors, getRamOptions, getStorageOptions } from '../../../api/masterData';

const COLOR_SWATCHES = {
  black: '#0F172A',
  white: '#F8FAFC',
  silver: '#CBD5E1',
  gold: '#F5E6B0',
  rose: '#FBCFE8',
  blue: '#3B82F6',
  red: '#EF4444',
  green: '#10B981',
  purple: '#A855F7',
  pink: '#EC4899',
  graphite: '#4B5563',
  midnight: '#1E1B4B',
  starlight: '#FAF7F0',
  sierra: '#B7BCC8',
  alpine: '#3F4754',
  sky: '#7DD3FC',
};

function swatchFor(name) {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(COLOR_SWATCHES)) {
    if (n.includes(key)) return COLOR_SWATCHES[key];
  }
  return '#94A3B8';
}

export default function DeviceColorStorageScreen({ navigation, route }) {
  const params = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [rams, setRams] = useState([]);
  const [storages, setStorages] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [color, setColor] = useState('');
  const [ram, setRam] = useState(null);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, s, c] = await Promise.all([
          getRamOptions(), getStorageOptions(), getColors().catch(() => []),
        ]);
        setRams(r);
        setStorages(s);
        setColorsList(c);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const onContinue = () => {
    if (!color.trim() || !ram || !storage) return;
    const ramLabel = rams.find((x) => x.id === ram)?.label;
    const storageLabel = storages.find((x) => x.id === storage)?.label;
    navigation.navigate('DeviceServices', {
      ...params,
      color: color.trim(),
      ramOptionId: ram,
      storageOptionId: storage,
      ramLabel,
      storageLabel,
    });
  };

  const ready = color && ram && storage;

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Color & Storage" onBack={() => navigation.goBack()} />
        <Loader label="Loading device options..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Color & Storage" subtitle={params.brandName} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Device summary */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-4 flex-row items-center"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
          <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mr-3">
            <Smartphone size={26} color="#00008B" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-text-muted uppercase tracking-widest">Device Model</Text>
            <Text className="text-[15px] font-extrabold text-text mt-0.5" numberOfLines={2}>
              {params.modelName || 'Device'}
            </Text>
            {params.brandName ? (
              <Text className="text-[11px] text-text-muted mt-0.5">{params.brandName}</Text>
            ) : null}
          </View>
          {ready ? <Badge variant="softSuccess">READY</Badge> : null}
        </View>

        {/* Color */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-4">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-warning/10 items-center justify-center mr-2">
              <Palette size={14} color="#F59E0B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">Model Color</Text>
            {color ? (
              <View className="flex-row items-center">
                <View
                  className="h-4 w-4 rounded-full border border-border mr-1"
                  style={{ backgroundColor: swatchFor(color) }}
                />
                <Text className="text-[11px] font-bold text-text">{color}</Text>
              </View>
            ) : null}
          </View>

          {colorsList.length > 0 ? (
            <View className="flex-row flex-wrap -mx-1">
              {colorsList.map((c) => {
                const active = color === c.name;
                const sw = swatchFor(c.name);
                return (
                  <View key={c.id || c.name} className="p-1" style={{ width: '33.333%' }}>
                    <Pressable
                      onPress={() => setColor(c.name)}
                      className={`rounded-xl border p-2.5 items-center ${active ? 'bg-primary/5 border-primary' : 'bg-card border-border'}`}
                    >
                      <View className="flex-row items-center justify-center">
                        <View
                          className="h-5 w-5 rounded-full border border-border"
                          style={{ backgroundColor: sw }}
                        />
                        {active ? (
                          <View className="ml-1 h-4 w-4 rounded-full bg-primary items-center justify-center">
                            <Check size={10} color="#fff" />
                          </View>
                        ) : null}
                      </View>
                      <Text
                        className={`text-[11px] font-bold mt-1.5 text-center ${active ? 'text-primary' : 'text-text'}`}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <Input
              placeholder="e.g. Silver Shadow"
              value={color}
              onChangeText={setColor}
              className="py-2 text-[13px]"
            />
          )}
        </View>

        {/* RAM */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-4">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <Cpu size={14} color="#00008B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">RAM</Text>
            <Text className="text-[11px] text-text-muted">Memory</Text>
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {rams.map((r) => {
              const active = ram === r.id;
              return (
                <View key={r.id} className="p-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => setRam(r.id)}
                    className={`rounded-xl border py-3 items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[14px] font-extrabold ${active ? 'text-white' : 'text-text'}`}>
                      {r.label}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Storage */}
        <View className="bg-card border border-border rounded-2xl p-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-secondary/10 items-center justify-center mr-2">
              <HardDrive size={14} color="#2563EB" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">Storage</Text>
            <Text className="text-[11px] text-text-muted">Capacity</Text>
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {storages.map((s) => {
              const active = storage === s.id;
              return (
                <View key={s.id} className="p-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => setStorage(s.id)}
                    className={`rounded-xl border py-3 items-center ${active ? 'bg-secondary border-secondary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[14px] font-extrabold ${active ? 'text-white' : 'text-text'}`}>
                      {s.label}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomActionBar
        title="Continue"
        onPress={onContinue}
        disabled={!ready}
      />
    </View>
  );
}
