import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  Wrench,
  BatteryMedium,
  Cpu,
  Zap,
  Volume2,
  Aperture,
  LayoutGrid,
  Smartphone,
  Droplets,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react-native';
import { Button, Card, ScreenHeader } from '../../../components/rnr';
import { getRepairServices } from '../../../api/masterData';

const WARRANTY_OPTIONS = [
  { code: 'W_3M', label: '3 Months' },
  { code: 'W_6M', label: '6 Months' },
  { code: 'W_12M', label: '12 Months' },
];

export default function DeviceServicesScreen({ navigation, route }) {
  const params = route?.params || {};
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  // { [serviceId]: { price, warranty, ... } }
  const [picked, setPicked] = useState({});

  useEffect(() => {
    (async () => {
      try { setServices(await getRepairServices()); } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const toggle = (s) => {
    setPicked((p) => {
      const next = { ...p };
      if (next[s.id]) delete next[s.id];
      else next[s.id] = { price: '', warranty: 'W_6M', serviceId: s.id, serviceCode: s.code, serviceName: s.name };
      return next;
    });
  };
  const setField = (id, key, value) => {
    setPicked((p) => ({ ...p, [id]: { ...p[id], [key]: value } }));
  };

  const onContinue = () => {
    const selected = Object.values(picked).map((p) => ({
      ...p,
      price: Number(String(p.price).replace(/[^0-9.]/g, '')) || 0,
    }));
    if (selected.length === 0) return;
    navigation.navigate('ServicePriceEstimate', { ...params, services: selected });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Device Services" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#00008B" /></View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Device Services" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Card className="flex-row items-center mb-4 rounded-2xl">
          <View className="h-14 w-14 rounded-xl bg-primary/10 items-center justify-center mr-3">
            <Smartphone size={26} color="#00008B" />
          </View>
          <View className="flex-1">
            <Text className="text-text-muted text-[11px] uppercase tracking-widest">Device</Text>
            <Text className="font-extrabold text-text text-[14px] mt-0.5" numberOfLines={1}>
              {params.modelName || ''}{params.ramLabel ? ` · ${params.ramLabel}` : ''}{params.storageLabel ? ` · ${params.storageLabel}` : ''}
            </Text>
            {params.color ? <Text className="text-text-muted text-[12px] mt-0.5">Color: {params.color}</Text> : null}
          </View>
        </Card>

        {services.map((s) => {
          const isPicked = !!picked[s.id];
          const row = picked[s.id] || {};
          const Icon = iconFor(s.code);
          return (
            <View key={s.id} className={`bg-card border rounded-2xl p-3 mb-3 ${isPicked ? 'border-primary' : 'border-border'}`}>
              <View className="flex-row items-start">
                <View className={`h-11 w-11 rounded-xl items-center justify-center mr-3 ${isPicked ? 'bg-primary' : 'bg-background'}`}>
                  <Icon size={20} color={isPicked ? '#fff' : '#0F172A'} />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="font-extrabold text-text text-[14px]" numberOfLines={1}>{s.name}</Text>
                  <View className="flex-row items-center mt-2">
                    <View className={`flex-row items-center rounded-lg border px-2 ${isPicked ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'}`}>
                      <Text className="text-text-muted text-[13px] mr-1">₹</Text>
                      <TextInput
                        editable={isPicked}
                        placeholder="0.00"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={String(row.price ?? '')}
                        onChangeText={(v) => setField(s.id, 'price', v)}
                        className="text-text text-[13px] py-1.5 min-w-[88px]"
                        style={{ paddingVertical: 6 }}
                      />
                    </View>
                  </View>
                </View>
                <View className="items-end">
                  <Pressable className="mb-2 active:opacity-70">
                    <Text className="text-primary text-[10px] underline">See last 5 prices</Text>
                  </Pressable>
                  {isPicked ? (
                    <Pressable
                      onPress={() => toggle(s)}
                      className="flex-row items-center bg-danger/10 border border-danger/30 rounded-full px-3 py-1.5 active:opacity-70"
                    >
                      <X size={12} color="#EF4444" />
                      <Text className="text-danger text-[12px] font-bold ml-1">Remove</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => toggle(s)}
                      className="flex-row items-center bg-primary rounded-full px-3.5 py-1.5 active:opacity-80"
                    >
                      <Plus size={12} color="#fff" />
                      <Text className="text-white text-[12px] font-bold ml-1">Add</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-[10px] font-bold text-text-muted tracking-widest mb-1.5">WARRANTY</Text>
                <View className="flex-row -mx-1">
                  {WARRANTY_OPTIONS.map((w) => {
                    const active = row.warranty === w.code;
                    return (
                      <Pressable
                        key={w.code}
                        disabled={!isPicked}
                        onPress={() => setField(s.id, 'warranty', w.code)}
                        className={`flex-1 mx-1 py-2 rounded-xl border items-center ${
                          !isPicked
                            ? 'bg-background border-border opacity-50'
                            : active
                              ? 'bg-primary border-primary'
                              : 'bg-card border-border'
                        }`}
                      >
                        <Text
                          numberOfLines={1}
                          className={`text-[11px] font-bold ${active && isPicked ? 'text-white' : 'text-text'}`}
                        >
                          {w.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border" style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 }}>
        <Button
          rightIcon={<ChevronRight size={18} color="#fff" />}
          onPress={onContinue}
          disabled={Object.keys(picked).length === 0}
          fullWidth
        >
          Continue ({Object.keys(picked).length} selected)
        </Button>
      </View>
    </View>
  );
}

function iconFor(code) {
  switch (code) {
    case 'DISPLAY': return Smartphone;
    case 'BATTERY': return BatteryMedium;
    case 'MOTHERBOARD': return Cpu;
    case 'CHARGING_PORT': return Zap;
    case 'SPEAKER': return Volume2;
    case 'CAMERA': return Aperture;
    case 'BUTTON': return LayoutGrid;
    case 'WATER_DAMAGE': return Droplets;
    case 'DEAD_PHONE': return Smartphone;
    default: return Wrench;
  }
}
