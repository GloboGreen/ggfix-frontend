import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Smartphone,
  Cpu,
  HardDrive,
  Palette,
  Check,
  Tag,
  ShieldCheck,
} from 'lucide-react-native';
import { notify } from '../../../components/confirm';
import {
  BottomActionBar,
  Input,
  Label,
  Loader,
  Badge,
} from '../../../components/rnr';
import { getRamOptions, getStorageOptions, getColors } from '../../../api/masterData';
import { createSavedDevice, updateSavedDevice } from '../../../api/customer';

const COLOR_SWATCHES = {
  black: '#0F172A', white: '#F8FAFC', silver: '#CBD5E1', gold: '#F5E6B0',
  rose: '#FBCFE8', blue: '#3B82F6', red: '#EF4444', green: '#10B981',
  purple: '#A855F7', pink: '#EC4899', graphite: '#4B5563', midnight: '#1E1B4B',
  starlight: '#FAF7F0', sierra: '#B7BCC8', alpine: '#3F4754', sky: '#7DD3FC',
  phantom: '#475569', cosmic: '#312E81',
};
function swatchFor(name) {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(COLOR_SWATCHES)) {
    if (n.includes(key)) return COLOR_SWATCHES[key];
  }
  return '#94A3B8';
}

export default function SelectVariantScreen({ navigation, route }) {
  const flow = route?.params?.flow || 'PROFILE';
  const isEdit = !!route?.params?.deviceId;
  const modelId = route?.params?.modelId;
  const modelName = route?.params?.modelName || 'Device';
  const brandId = route?.params?.brandId;
  const brandName = route?.params?.brandName;
  const categoryId = route?.params?.categoryId;

  const [rams, setRams] = useState([]);
  const [storages, setStorages] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  const [ram, setRam] = useState(route?.params?.ramOptionId ? { id: route.params.ramOptionId, label: '' } : null);
  const [storage, setStorage] = useState(route?.params?.storageOptionId ? { id: route.params.storageOptionId, label: '' } : null);
  const [color, setColor] = useState(route?.params?.color ? { id: route.params.color, name: route.params.color } : null);
  const [imei, setImei] = useState(route?.params?.imei || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, s, c] = await Promise.all([
          getRamOptions(),
          getStorageOptions(),
          getColors().catch(() => []),
        ]);
        setRams(r);
        setStorages(s);
        setColorsList(c.length ? c : [
          { id: 'Midnight Black', name: 'Midnight Black' },
          { id: 'Phantom Silver', name: 'Phantom Silver' },
          { id: 'Cosmic Blue', name: 'Cosmic Blue' },
          { id: 'Rose Gold', name: 'Rose Gold' },
          { id: 'Starlight', name: 'Starlight' },
          { id: 'Alpine Green', name: 'Alpine Green' },
        ]);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  // Sync display labels for RAM/storage when arriving with only id
  useEffect(() => {
    if (ram && !ram.label) {
      const found = rams.find((r) => r.id === ram.id);
      if (found) setRam(found);
    }
    if (storage && !storage.label) {
      const found = storages.find((s) => s.id === storage.id);
      if (found) setStorage(found);
    }
  }, [rams, storages, ram, storage]);

  const onContinue = async () => {
    if (!ram || !storage || !color) return;
    const payload = {
      categoryId,
      brandId,
      modelId,
      ramOptionId: ram.id,
      storageOptionId: storage.id,
      color: color?.name || color?.id,
      imei: flow === 'SELL' ? imei : undefined,
    };

    if (flow === 'PROFILE') {
      setSaving(true);
      try {
        if (isEdit) await updateSavedDevice(route.params.deviceId, payload);
        else await createSavedDevice(payload);
        navigation.popToTop();
        navigation.navigate('ManageDevice');
      } catch (e) {
        notify('Error', e.message);
      } finally { setSaving(false); }
      return;
    }
    if (flow === 'REPAIR') {
      navigation.navigate('RepairSelectService', { device: { ...payload, modelName } });
      return;
    }
    if (flow === 'SELL') {
      navigation.navigate('SellCondition', { device: { ...payload, modelName, imei } });
      return;
    }
  };

  if (loading) return <Loader label="Loading variants..." />;

  const ready = ram && storage && color && (flow !== 'SELL' || imei.trim());
  const ctaLabel = flow === 'PROFILE'
    ? (isEdit ? 'Update Device' : 'Save Device')
    : flow === 'REPAIR' ? 'Choose Repair Service' : 'Continue';

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>

        {/* Device summary */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3 flex-row items-center"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
          <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mr-3">
            <Smartphone size={26} color="#00008B" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-text-muted uppercase tracking-widest">Your Device</Text>
            <Text className="text-[15px] font-extrabold text-text mt-0.5" numberOfLines={2}>{modelName}</Text>
            {brandName ? (
              <Text className="text-[11px] text-text-muted mt-0.5">{brandName}</Text>
            ) : null}
          </View>
          {ready ? <Badge variant="softSuccess">READY</Badge> : null}
        </View>

        {/* Selection summary chips */}
        {(ram || storage || color) ? (
          <View className="flex-row flex-wrap mb-3">
            {ram?.label ? (
              <View className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <Cpu size={11} color="#00008B" />
                <Text className="text-primary text-[11px] font-bold ml-1">{ram.label}</Text>
              </View>
            ) : null}
            {storage?.label ? (
              <View className="bg-secondary/10 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <HardDrive size={11} color="#2563EB" />
                <Text className="text-secondary text-[11px] font-bold ml-1">{storage.label}</Text>
              </View>
            ) : null}
            {color?.name ? (
              <View className="bg-warning/10 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <View className="h-3 w-3 rounded-full mr-1 border border-border" style={{ backgroundColor: swatchFor(color.name) }} />
                <Text className="text-warning text-[11px] font-bold">{color.name}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Color picker */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-warning/10 items-center justify-center mr-2">
              <Palette size={14} color="#F59E0B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">Color</Text>
            {color ? (
              <View className="flex-row items-center">
                <View className="h-4 w-4 rounded-full border border-border mr-1" style={{ backgroundColor: swatchFor(color.name) }} />
                <Text className="text-[11px] font-bold text-text" numberOfLines={1}>{color.name}</Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {colorsList.map((c) => {
              const name = c.name || c.id;
              const active = color?.name === name || color?.id === name;
              const sw = swatchFor(name);
              return (
                <View key={c.id || name} className="p-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => setColor({ id: c.id || name, name })}
                    className={`rounded-xl border p-2.5 items-center ${active ? 'bg-primary/5 border-primary' : 'bg-card border-border'}`}
                  >
                    <View className="flex-row items-center justify-center">
                      <View className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: sw }} />
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
                      {name}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* RAM */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <Cpu size={14} color="#00008B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">RAM</Text>
            <Text className="text-[11px] text-text-muted">Memory</Text>
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {rams.map((r) => {
              const active = ram?.id === r.id;
              return (
                <View key={r.id} className="p-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => setRam(r)}
                    className={`rounded-xl border py-3 items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[14px] font-extrabold ${active ? 'text-white' : 'text-text'}`}>{r.label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Storage */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-secondary/10 items-center justify-center mr-2">
              <HardDrive size={14} color="#2563EB" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">Storage</Text>
            <Text className="text-[11px] text-text-muted">Capacity</Text>
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {storages.map((s) => {
              const active = storage?.id === s.id;
              return (
                <View key={s.id} className="p-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => setStorage(s)}
                    className={`rounded-xl border py-3 items-center ${active ? 'bg-secondary border-secondary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[14px] font-extrabold ${active ? 'text-white' : 'text-text'}`}>{s.label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* IMEI for sell flow */}
        {flow === 'SELL' ? (
          <View className="bg-card border border-border rounded-2xl p-3 mb-3">
            <View className="flex-row items-center mb-2.5">
              <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center mr-2">
                <Tag size={14} color="#10B981" />
              </View>
              <Text className="text-[13px] font-extrabold text-text flex-1">IMEI Number</Text>
              <Text className="text-[10px] text-text-muted">Required for sell</Text>
            </View>
            <Label className="text-[11px] mb-1">Dial *#06# on your device to find IMEI</Label>
            <Input
              placeholder="15-digit IMEI"
              value={imei}
              onChangeText={setImei}
              keyboardType="number-pad"
              className="py-2 text-[13px]"
            />
          </View>
        ) : null}

        <View className="bg-success/5 border border-success/20 rounded-2xl p-3 flex-row items-center">
          <ShieldCheck size={16} color="#10B981" />
          <Text className="text-[11px] text-text ml-2 flex-1">
            Genuine parts · Certified technicians · 30-day repair warranty
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar
        title={ctaLabel}
        onPress={onContinue}
        loading={saving}
        disabled={!ready}
      />
    </View>
  );
}
