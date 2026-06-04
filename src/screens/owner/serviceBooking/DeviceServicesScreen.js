import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from 'lucide-react-native';
import { Button, Card, ScreenHeader } from '../../../components/rnr';
import { getRepairServices, getRepairCategories } from '../../../api/masterData';

const WARRANTY_OPTIONS = [
  { code: 'W_3M', label: '3 Months' },
  { code: 'W_6M', label: '6 Months' },
  { code: 'W_12M', label: '12 Months' },
];

const priceNum = (v) => Number(String(v ?? '').replace(/[^0-9.]/g, '')) || 0;

export default function DeviceServicesScreen({ navigation, route }) {
  const params = route?.params || {};
  const [services, setServices] = useState([]);
  const [mainCats, setMainCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-service input state, regardless of picked status — so the price the user
  // typed is what +Add commits, and persists if they Remove and re-Add.
  // When entering from "Edit Booking", prefillServices seeds the rows + picks so
  // existing line items show as already added with their saved price/warranty.
  const seedFromPrefill = () => {
    const prefill = Array.isArray(params.prefillServices) ? params.prefillServices : [];
    const rowSeed = {};
    const idSeed = new Set();
    for (const s of prefill) {
      if (!s?.serviceId) continue;
      rowSeed[s.serviceId] = { price: String(s.price ?? ''), warranty: s.warranty || '' };
      idSeed.add(s.serviceId);
    }
    return { rowSeed, idSeed };
  };
  const seed = useMemo(seedFromPrefill, []);
  const [rows, setRows] = useState(seed.rowSeed); // { [serviceId]: { price, warranty } }
  const [pickedIds, setPickedIds] = useState(() => new Set(seed.idSeed));
  const [expanded, setExpanded] = useState({}); // { [groupId]: bool }

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          getRepairServices().catch(() => []),
          getRepairCategories().catch(() => []),
        ]);
        setServices(s);
        setMainCats(c);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  // Group services by main category (categoryId on the service points to repair-category).
  const groups = useMemo(() => {
    const catById = {};
    (mainCats || []).forEach((c) => { catById[c.id] = c; });
    const byCat = new Map();
    (services || []).forEach((s) => {
      const key = s.categoryId || '__ungrouped__';
      if (!byCat.has(key)) byCat.set(key, { id: key, name: catById[key]?.name || 'Other', services: [] });
      byCat.get(key).services.push(s);
    });
    return Array.from(byCat.values());
  }, [services, mainCats]);

  // When entering from Edit Booking, auto-expand the groups that already have
  // prefilled picks so the user can see/modify them without hunting for them.
  useEffect(() => {
    if (pickedIds.size === 0 || groups.length === 0) return;
    setExpanded((prev) => {
      const next = { ...prev };
      let touched = false;
      for (const g of groups) {
        if (next[g.id]) continue;
        if (g.services.some((s) => pickedIds.has(s.id))) { next[g.id] = true; touched = true; }
      }
      return touched ? next : prev;
    });
    // We only want this to run once groups become available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const ensureRow = (id) => rows[id] || { price: '', warranty: '' };
  const setField = (id, key, value) => {
    setRows((p) => {
      const existing = p[id] || { price: '', warranty: '' };
      return { ...p, [id]: { ...existing, [key]: value } };
    });
  };

  const addService = (s) => {
    if (!(priceNum(ensureRow(s.id).price) > 0)) return;
    setPickedIds((p) => { const n = new Set(p); n.add(s.id); return n; });
  };
  const removeService = (s) => {
    setPickedIds((p) => { const n = new Set(p); n.delete(s.id); return n; });
  };

  const toggleGroup = (gid) => setExpanded((e) => ({ ...e, [gid]: !e[gid] }));

  const onContinue = () => {
    const byId = {}; (services || []).forEach((s) => { byId[s.id] = s; });
    const selected = [...pickedIds].map((id) => {
      const s = byId[id]; const r = ensureRow(id);
      return {
        serviceId: id,
        serviceCode: s?.code,
        serviceName: s?.name,
        price: priceNum(r.price),
        warranty: r.warranty || null,
      };
    });
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

  const totalSelected = pickedIds.size;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Device Services" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Card className="flex-row items-center mb-4 rounded-2xl">
          <View className="h-14 w-14 rounded-xl bg-primary/10 items-center justify-center mr-3 overflow-hidden">
            {params.imageUrl ? (
              <Image source={{ uri: params.imageUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" />
            ) : (
              <Smartphone size={26} color="#00008B" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-text-muted text-[11px] uppercase tracking-widest">Device</Text>
            <Text className="font-extrabold text-text text-[14px] mt-0.5" numberOfLines={1}>
              {params.modelName || ''}{params.ramLabel ? ` · ${params.ramLabel}` : ''}{params.storageLabel ? ` · ${params.storageLabel}` : ''}
            </Text>
            {params.color ? <Text className="text-text-muted text-[12px] mt-0.5">Color: {params.color}</Text> : null}
          </View>
        </Card>

        {groups.map((g) => {
          const open = !!expanded[g.id];
          const pickedInGroup = g.services.filter((s) => pickedIds.has(s.id)).length;
          const Chevron = open ? ChevronUp : ChevronDown;
          return (
            <View key={g.id} className="mb-3 bg-card border border-border rounded-2xl overflow-hidden">
              <Pressable
                onPress={() => toggleGroup(g.id)}
                className="flex-row items-center px-3 py-3 active:opacity-80"
              >
                <View className="h-9 w-9 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                  <Wrench size={16} color="#00008B" />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{g.name}</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5">
                    {g.services.length} issue{g.services.length === 1 ? '' : 's'}
                    {pickedInGroup ? ` · ${pickedInGroup} selected` : ''}
                  </Text>
                </View>
                <Chevron size={18} color="#64748B" />
              </Pressable>

              {open ? (
                <View className="px-3 pb-3">
                  {g.services.map((s) => {
                    const r = ensureRow(s.id);
                    const isPicked = pickedIds.has(s.id);
                    const Icon = iconFor(s.code);
                    const canAdd = priceNum(r.price) > 0;
                    return (
                      <View key={s.id} className={`border rounded-2xl p-3 mb-2 ${isPicked ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                        <View className="flex-row items-start">
                          <View className={`h-10 w-10 rounded-xl items-center justify-center mr-3 ${isPicked ? 'bg-primary' : 'bg-card'}`}>
                            <Icon size={18} color={isPicked ? '#fff' : '#0F172A'} />
                          </View>
                          <View className="flex-1 pr-2">
                            <Text className="font-extrabold text-text text-[13px]" numberOfLines={1}>{s.name}</Text>
                            <View className="flex-row items-center mt-2">
                              <View className={`flex-row items-center rounded-lg border px-2 ${isPicked ? 'border-primary/40 bg-card' : 'border-border bg-card'}`}>
                                <Text className="text-text-muted text-[13px] mr-1">₹</Text>
                                <TextInput
                                  placeholder="0.00"
                                  placeholderTextColor="#94A3B8"
                                  keyboardType="numeric"
                                  value={String(r.price ?? '')}
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
                                onPress={() => removeService(s)}
                                className="flex-row items-center bg-danger/10 border border-danger/30 rounded-full px-3 py-1.5 active:opacity-70"
                              >
                                <X size={12} color="#EF4444" />
                                <Text className="text-danger text-[12px] font-bold ml-1">Remove</Text>
                              </Pressable>
                            ) : (
                              <Pressable
                                disabled={!canAdd}
                                onPress={() => addService(s)}
                                className={`flex-row items-center rounded-full px-3.5 py-1.5 ${canAdd ? 'bg-primary active:opacity-80' : 'bg-primary/40'}`}
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
                              const active = r.warranty === w.code;
                              return (
                                <Pressable
                                  key={w.code}
                                  onPress={() => setField(s.id, 'warranty', w.code)}
                                  className={`flex-1 mx-1 py-2 rounded-xl border items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                                >
                                  <Text numberOfLines={1} className={`text-[11px] font-bold ${active ? 'text-white' : 'text-text'}`}>{w.label}</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border" style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 }}>
        <Button
          rightIcon={<ChevronRight size={18} color="#fff" />}
          onPress={onContinue}
          disabled={totalSelected === 0}
          fullWidth
        >
          Continue ({totalSelected} selected)
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
