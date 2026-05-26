import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Bell,
  PackageCheck,
  Truck,
  Tag,
  Wrench,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { Card, EmptyState, Badge, Chip } from '../../../components/rnr';

const MOCK = [
  {
    id: 1,
    icon: PackageCheck,
    color: '#10B981',
    bg: 'bg-success/10',
    title: 'Repair completed',
    body: 'Your iPhone 13 screen replacement is done. Pickup scheduled tomorrow 10–12 PM.',
    time: '2h ago',
    unread: true,
    type: 'orders',
  },
  {
    id: 2,
    icon: Tag,
    color: '#F59E0B',
    bg: 'bg-warning/10',
    title: 'Flat 20% OFF on battery jobs',
    body: 'Use code POWER20 at checkout. Valid till Sunday for all customers.',
    time: '5h ago',
    unread: true,
    type: 'offers',
  },
  {
    id: 3,
    icon: Truck,
    color: '#2563EB',
    bg: 'bg-secondary/10',
    title: 'Pickup partner assigned',
    body: 'Karthik is on the way to pick up your device. ETA 25 mins.',
    time: 'Yesterday',
    unread: true,
    type: 'orders',
  },
  {
    id: 4,
    icon: Wrench,
    color: '#00008B',
    bg: 'bg-primary/10',
    title: 'Diagnosis ready',
    body: 'Check the estimate for your Samsung S22 — battery + charging port.',
    time: '2 days ago',
    type: 'orders',
  },
  {
    id: 5,
    icon: ShieldCheck,
    color: '#10B981',
    bg: 'bg-success/10',
    title: 'Warranty registered',
    body: '30-day repair warranty is active on booking #GG-49281.',
    time: '3 days ago',
    type: 'system',
  },
];

const FILTERS = ['All', 'Orders', 'Offers', 'System'];

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('All');

  const items = MOCK.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Orders') return m.type === 'orders';
    if (filter === 'Offers') return m.type === 'offers';
    if (filter === 'System') return m.type === 'system';
    return true;
  });

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-3 py-3 flex-row flex-wrap">
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {items.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} color="#00008B" />}
          title="You're all caught up"
          description="We'll ping you when something new happens with your bookings."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between px-1 mb-2">
            <Text className="text-[12px] text-text-muted">{items.length} notifications</Text>
            <Pressable className="flex-row items-center active:opacity-70">
              <CheckCircle2 size={14} color="#00008B" />
              <Text className="text-[12px] font-bold text-primary ml-1">Mark all read</Text>
            </Pressable>
          </View>
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <Card key={n.id} className={`mb-2 rounded-2xl ${n.unread ? 'border-primary/30' : ''}`} padded>
                <View className="flex-row items-start">
                  <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${n.bg}`}>
                    <Icon size={18} color={n.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[13px] font-extrabold text-text flex-1" numberOfLines={1}>{n.title}</Text>
                      {n.unread ? <Badge variant="softPrimary">NEW</Badge> : null}
                    </View>
                    <Text className="text-[12px] text-text-muted mt-1 leading-5">{n.body}</Text>
                    <Text className="text-[10px] text-text-muted mt-1.5">{n.time}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
