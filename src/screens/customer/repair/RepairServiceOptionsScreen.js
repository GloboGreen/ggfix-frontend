import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  Truck,
  Store,
  ShieldCheck,
  Sparkles,
  Clock,
  IndianRupee,
  ChevronRight,
  Wrench,
  CheckCircle2,
  Phone,
} from 'lucide-react-native';
import { BottomActionBar, Badge } from '../../../components/rnr';

const OPTIONS = [
  {
    key: 'PICKUP',
    target: 'RepairPickupShops',
    title: 'Doorstep Pickup',
    tagline: 'Most popular',
    description: 'Free pickup & drop. Pick a nearby shop and a slot — we handle the rest.',
    palette: ['#00008B', '#2563EB'],
    accent: '#00008B',
    icon: Truck,
    badge: 'POPULAR',
    badgeVariant: 'softWarning',
    highlights: [
      { icon: Truck, label: 'Free pickup' },
      { icon: ShieldCheck, label: '30-day warranty' },
      { icon: Clock, label: 'Same-day available' },
    ],
    eta: 'Pickup in 30 min',
    price: 'From ₹399',
  },
  {
    key: 'ENQUIRY',
    target: 'ShopChat',
    targetParams: { mode: 'ENQUIRY' },
    title: 'Service Enquiry',
    tagline: 'Talk first, book later',
    description: 'Chat with shop technicians to clarify the issue & get a quote before booking.',
    palette: ['#059669', '#10B981'],
    accent: '#10B981',
    icon: MessageCircle,
    badge: 'FREE',
    badgeVariant: 'softSuccess',
    highlights: [
      { icon: MessageCircle, label: 'Live chat' },
      { icon: Phone, label: 'Call back' },
      { icon: IndianRupee, label: 'No obligation' },
    ],
    eta: 'Replies in ~10 min',
    price: 'No charge',
  },
];

export default function RepairServiceOptionsScreen({ navigation, route }) {
  const params = route.params || {};
  const [selected, setSelected] = useState('PICKUP');

  const onContinue = () => {
    const opt = OPTIONS.find((o) => o.key === selected);
    if (!opt) return;
    navigation.navigate(opt.target, { ...params, ...(opt.targetParams || {}) });
  };

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#00008B', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <Text className="text-white/80 text-[11px] font-bold tracking-widest">SERVICE OPTIONS</Text>
        <Text className="text-white text-[22px] font-extrabold mt-1">How do you want to proceed?</Text>
        <Text className="text-white/85 text-[12px] mt-1">Choose the option that fits you best.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>

        {/* Device + services summary if present */}
        {(params.device || params.services?.length) ? (
          <View className="bg-card border border-border rounded-2xl p-3 mb-4 -mt-4 flex-row items-center"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
            <View className="h-11 w-11 rounded-2xl bg-primary/10 items-center justify-center mr-3">
              <Wrench size={20} color="#00008B" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Booking for</Text>
              <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>
                {params.device?.modelName || 'Device'}
              </Text>
              {params.services?.length ? (
                <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>
                  {params.services.length} service{params.services.length === 1 ? '' : 's'} · {params.services.map((s) => s.name).join(', ')}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSelected(opt.key)}
              className={`bg-card rounded-2xl border mb-4 overflow-hidden active:opacity-90 ${isSelected ? 'border-primary' : 'border-border'}`}
              style={isSelected
                ? { shadowColor: opt.accent, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }
                : { shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }
              }
            >
              {/* Gradient header */}
              <LinearGradient
                colors={opt.palette}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16 }}
              >
                <View className="flex-row items-start">
                  <View
                    className="h-14 w-14 rounded-2xl bg-white items-center justify-center mr-3"
                    style={{ shadowColor: opt.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
                  >
                    <Icon size={26} color={opt.accent} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-[17px] font-extrabold mr-2">{opt.title}</Text>
                      {opt.badge ? (
                        <View className="bg-white/20 rounded-full px-2 py-0.5">
                          <Text className="text-white text-[9px] font-bold tracking-wide">{opt.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-white/85 text-[11px] mt-0.5 font-semibold">{opt.tagline}</Text>
                  </View>
                  {/* Radio indicator */}
                  <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-white/50'}`}>
                    {isSelected ? <View className="h-3 w-3 rounded-full" style={{ backgroundColor: opt.accent }} /> : null}
                  </View>
                </View>
                <Text className="text-white/90 text-[12px] mt-3 leading-5">{opt.description}</Text>
              </LinearGradient>

              {/* Body */}
              <View className="px-4 py-3">
                <View className="flex-row -mx-1">
                  {opt.highlights.map((h) => {
                    const HIcon = h.icon;
                    return (
                      <View key={h.label} className="flex-1 mx-1 bg-background rounded-xl p-2.5 items-center">
                        <HIcon size={14} color={opt.accent} />
                        <Text className="text-[10px] font-bold text-text mt-1 text-center" numberOfLines={1}>{h.label}</Text>
                      </View>
                    );
                  })}
                </View>
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center">
                    <Clock size={12} color="#64748B" />
                    <Text className="text-[11px] text-text-muted ml-1">{opt.eta}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-[10px] text-text-muted mr-1">Starts at</Text>
                    <Text className="text-[14px] font-extrabold" style={{ color: opt.accent }}>{opt.price}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Walk-in suggestion (subtle) */}
        <View className="bg-card border border-border rounded-2xl p-3 flex-row items-center"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
          <View className="h-10 w-10 rounded-full bg-background items-center justify-center mr-3">
            <Store size={18} color="#64748B" />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-bold text-text">Walk-in to a shop</Text>
            <Text className="text-[11px] text-text-muted mt-0.5">Find shops on the map and visit directly. No appointment needed.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('NearbyShops')}
            className="bg-background border border-border rounded-full px-3 py-1.5 active:opacity-70"
          >
            <Text className="text-[11px] font-bold text-text">Find</Text>
          </Pressable>
        </View>

        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-3 mt-4 flex-row items-center">
          <Sparkles size={14} color="#00008B" />
          <Text className="text-[11px] text-text-muted ml-2 flex-1">
            Both options support 30-day warranty and verified shops.
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar
        title={selected === 'ENQUIRY' ? 'Start Enquiry Chat' : 'Continue to Shops'}
        onPress={onContinue}
      />
    </View>
  );
}
