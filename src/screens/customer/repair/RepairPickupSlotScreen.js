import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Clock, Store, Phone } from 'lucide-react-native';
import { Card, CardTitle, Loader, BottomActionBar, Badge } from '../../../components/rnr';
import { getShop, getShopPickupSlots } from '../../../api/shops';

function next7Days() {
  const days = [];
  const d0 = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(d0);
    d.setDate(d0.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RepairPickupSlotScreen({ navigation, route }) {
  const params = route.params || {};
  const days = next7Days();
  const [dayIdx, setDayIdx] = useState(1);
  const [slot, setSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, sl] = await Promise.all([
          getShop(params.shopId).catch(() => null),
          getShopPickupSlots(params.shopId).catch(() => []),
        ]);
        setShop(s);
        setSlots(sl);
      } finally { setLoading(false); }
    })();
  }, [params.shopId]);

  if (loading) return <Loader label="Loading slots..." />;

  const slotsToShow = slots.length ? slots : [
    { startTime: '09:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '13:00' },
    { startTime: '13:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '17:00' },
    { startTime: '17:00', endTime: '19:00' },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center mr-3">
              <Store size={22} color="#00008B" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-text-muted uppercase tracking-widest">Pickup From</Text>
              <Text className="text-[15px] font-extrabold text-text mt-0.5">{shop?.name}</Text>
              {shop?.phone ? (
                <View className="flex-row items-center mt-0.5">
                  <Phone size={11} color="#64748B" />
                  <Text className="text-[11px] text-text-muted ml-1">{shop.phone}</Text>
                </View>
              ) : null}
            </View>
            <Badge variant="softSuccess">OPEN</Badge>
          </View>
        </Card>

        <Card className="rounded-2xl mb-3">
          <CardTitle className="mb-2">Choose Pickup Date</CardTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {days.map((d, i) => {
              const active = dayIdx === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setDayIdx(i)}
                  className={`mr-2 px-4 py-2.5 rounded-2xl border min-w-[64px] items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                >
                  <Text className={`text-[10px] font-bold tracking-widest ${active ? 'text-white/85' : 'text-text-muted'}`}>
                    {WEEKDAY[d.getDay()].toUpperCase()}
                  </Text>
                  <Text className={`text-[18px] font-extrabold mt-0.5 ${active ? 'text-white' : 'text-text'}`}>
                    {d.getDate()}
                  </Text>
                  <Text className={`text-[10px] mt-0.5 ${active ? 'text-white/85' : 'text-text-muted'}`}>
                    {d.toLocaleString('default', { month: 'short' })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#00008B" />
            <CardTitle className="ml-2">Pick a Time Slot</CardTitle>
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {slotsToShow.map((s, i) => {
              const label = `${(s.startTime || '').slice(0, 5)} – ${(s.endTime || '').slice(0, 5)}`;
              const active = slot && slot.startTime === s.startTime && slot.endTime === s.endTime;
              return (
                <View key={i} style={{ width: '50%' }} className="p-1">
                  <Pressable
                    onPress={() => setSlot(s)}
                    className={`px-3 py-3 rounded-2xl border items-center ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-text'}`}>{label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Card>

        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-3">
          <Text className="text-[12px] text-primary font-bold">💡 Pro tip</Text>
          <Text className="text-[11px] text-text-muted mt-1">Pickup is free & on-time guaranteed. Reschedule once for free before pickup.</Text>
        </View>
      </ScrollView>

      <BottomActionBar
        title="Continue to Review"
        onPress={() => navigation.navigate('RepairCompleteOrder', {
          ...params,
          pickupDate: days[dayIdx].toISOString().slice(0, 10),
          pickupSlotStart: slot?.startTime,
          pickupSlotEnd: slot?.endTime,
        })}
        disabled={!slot}
      />
    </View>
  );
}
