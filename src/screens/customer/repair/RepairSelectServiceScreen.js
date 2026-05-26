import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Smartphone,
  BatteryMedium,
  Cpu,
  Zap,
  Volume2,
  Aperture,
  LayoutGrid,
  Droplets,
  Wrench,
  Plus,
  X,
  ShieldCheck,
  Star,
  Sparkles,
  Search,
} from 'lucide-react-native';
import {
  BottomActionBar,
  EmptyState,
  Loader,
  SearchBar,
  Badge,
} from '../../../components/rnr';
import { getRepairServices } from '../../../api/masterData';

const ICON_MAP = {
  DISPLAY:       { Icon: Smartphone,    tint: '#00008B', bg: 'bg-primary/10',   sub: 'Cracked screen · Touch issues' },
  BATTERY:       { Icon: BatteryMedium, tint: '#10B981', bg: 'bg-success/10',   sub: 'Backup drop · Swelling · Replace' },
  MOTHERBOARD:   { Icon: Cpu,           tint: '#7C3AED', bg: 'bg-primary/10',   sub: 'Logic board · Firmware · Boot loop' },
  CHARGING_PORT: { Icon: Zap,           tint: '#F59E0B', bg: 'bg-warning/10',   sub: 'Loose port · No charging · USB-C' },
  SPEAKER:       { Icon: Volume2,       tint: '#EC4899', bg: 'bg-danger/10',    sub: 'No sound · Crackling · Mic issues' },
  CAMERA:        { Icon: Aperture,      tint: '#0EA5E9', bg: 'bg-info/10',      sub: 'Front · Rear · Lens damage' },
  BUTTON:        { Icon: LayoutGrid,    tint: '#64748B', bg: 'bg-background',   sub: 'Power · Volume · Home button' },
  WATER_DAMAGE:  { Icon: Droplets,      tint: '#2563EB', bg: 'bg-secondary/10', sub: 'Liquid contact · Full diagnostic' },
  DEAD_PHONE:    { Icon: Smartphone,    tint: '#EF4444', bg: 'bg-danger/10',    sub: 'Won\'t turn on · No display' },
};
const DEFAULT_META = { Icon: Wrench, tint: '#00008B', bg: 'bg-primary/10', sub: 'Custom repair service' };

function metaFor(code) { return ICON_MAP[code] || DEFAULT_META; }

const POPULAR_CODES = new Set(['DISPLAY', 'BATTERY', 'CHARGING_PORT']);

export default function RepairSelectServiceScreen({ navigation, route }) {
  const device = route?.params?.device || {};
  const [services, setServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setServices(await getRepairServices()); } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return services;
    const needle = q.toLowerCase();
    return services.filter((s) => (s.name || '').toLowerCase().includes(needle));
  }, [services, q]);

  const popular = useMemo(() => filtered.filter((s) => POPULAR_CODES.has(s.code)), [filtered]);
  const others = useMemo(() => filtered.filter((s) => !POPULAR_CODES.has(s.code)), [filtered]);

  const toggle = (id) => {
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const onContinue = () => {
    const chosen = services.filter((s) => selectedIds.includes(s.id));
    navigation.navigate('RepairReview', { device, services: chosen });
  };

  if (loading) return <Loader label="Loading services..." />;

  const selectedCount = selectedIds.length;

  return (
    <View className="flex-1 bg-background">
      {/* Sticky device summary + search */}
      <View className="bg-card border-b border-border px-4 pt-3 pb-3"
            style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        <View className="flex-row items-center mb-3">
          <View className="h-11 w-11 rounded-2xl bg-primary/10 items-center justify-center mr-3">
            <Smartphone size={20} color="#00008B" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-text-muted uppercase tracking-widest">Your Device</Text>
            <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{device.modelName || 'Device'}</Text>
            <View className="flex-row items-center mt-0.5">
              {device.color ? <Text className="text-[10px] text-text-muted">{device.color}</Text> : null}
              {device.ramLabel ? <Text className="text-[10px] text-text-muted"> · {device.ramLabel}</Text> : null}
              {device.storageLabel ? <Text className="text-[10px] text-text-muted"> · {device.storageLabel}</Text> : null}
            </View>
          </View>
          {selectedCount > 0 ? (
            <Badge variant="default">{selectedCount} SELECTED</Badge>
          ) : null}
        </View>
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Search a repair service..."
          onClear={() => setQ('')}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>

        {/* Trust strip */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <ShieldCheck size={16} color="#10B981" />
            <Text className="text-[10px] font-bold text-text mt-1">30-day Warranty</Text>
          </View>
          <View className="flex-1 mx-1 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Star size={16} color="#F59E0B" />
            <Text className="text-[10px] font-bold text-text mt-1">Certified Techs</Text>
          </View>
          <View className="flex-1 ml-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Sparkles size={16} color="#00008B" />
            <Text className="text-[10px] font-bold text-text mt-1">Genuine Parts</Text>
          </View>
        </View>

        {/* Popular */}
        {!q && popular.length > 0 ? (
          <>
            <View className="flex-row items-center mb-2">
              <Sparkles size={13} color="#F59E0B" />
              <Text className="text-[11px] font-extrabold text-warning ml-1.5 tracking-widest">MOST BOOKED</Text>
            </View>
            {popular.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                selected={selectedIds.includes(s.id)}
                onToggle={() => toggle(s.id)}
                popular
              />
            ))}
            <View className="h-2" />
          </>
        ) : null}

        {/* Others */}
        {others.length > 0 ? (
          <>
            <Text className="text-[11px] font-extrabold text-text-muted tracking-widest mb-2">
              {q ? 'SEARCH RESULTS' : 'ALL SERVICES'}
            </Text>
            {others.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                selected={selectedIds.includes(s.id)}
                onToggle={() => toggle(s.id)}
              />
            ))}
          </>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={28} color="#00008B" />}
            title="No services match"
            description={q ? `Try a different keyword.` : 'No repair services configured.'}
          />
        ) : null}

        {selectedCount > 0 ? (
          <View className="bg-primary/5 border border-primary/10 rounded-2xl p-3 mt-4 flex-row items-center">
            <Wrench size={14} color="#00008B" />
            <Text className="text-[12px] text-text ml-2 flex-1">
              You've selected <Text className="font-extrabold text-primary">{selectedCount}</Text> service{selectedCount === 1 ? '' : 's'}.
              Next, you'll get a price estimate.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomActionBar
        priceCaption="Selected"
        priceValue={`${selectedCount}`}
        priceLabel={`service${selectedCount === 1 ? '' : 's'}`}
        title="Continue"
        onPress={onContinue}
        disabled={selectedCount === 0}
      />
    </View>
  );
}

function ServiceRow({ service, selected, onToggle, popular }) {
  const meta = metaFor(service.code);
  const Icon = meta.Icon;
  return (
    <Pressable
      onPress={onToggle}
      className={`bg-card border rounded-2xl p-3 mb-2.5 active:opacity-85 ${selected ? 'border-primary' : 'border-border'}`}
      style={selected
        ? { shadowColor: '#00008B', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }
        : { shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }
      }
    >
      <View className="flex-row items-center">
        <View className={`h-11 w-11 rounded-2xl items-center justify-center mr-3 ${meta.bg}`}>
          <Icon size={20} color={meta.tint} />
        </View>
        <View className="flex-1 pr-2">
          <View className="flex-row items-center">
            <Text className="text-[14px] font-extrabold text-text flex-1" numberOfLines={1}>{service.name}</Text>
            {popular ? <Badge variant="softWarning">HOT</Badge> : null}
          </View>
          <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{service.description || meta.sub}</Text>
        </View>
        {selected ? (
          <Pressable
            onPress={onToggle}
            className="bg-danger/10 border border-danger/30 rounded-full px-3 py-1.5 flex-row items-center active:opacity-70"
          >
            <X size={12} color="#EF4444" />
            <Text className="text-danger text-[12px] font-bold ml-1">Remove</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onToggle}
            className="bg-primary rounded-full px-3.5 py-1.5 flex-row items-center active:opacity-80"
          >
            <Plus size={12} color="#fff" />
            <Text className="text-white text-[12px] font-bold ml-1">Add</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
