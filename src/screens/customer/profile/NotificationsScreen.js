import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Bell, PackageCheck, Tag, ShieldCheck, CheckCircle2,
} from 'lucide-react-native';
import { Card, EmptyState, Badge, Chip, Loader } from '../../../components/rnr';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../../api/notifications';

const FILTERS = ['All', 'Orders', 'Offers', 'System'];

const META_BY_TYPE = {
  orders: { icon: PackageCheck, color: '#10B981', bg: 'bg-success/10' },
  offers: { icon: Tag, color: '#F59E0B', bg: 'bg-warning/10' },
  system: { icon: ShieldCheck, color: '#00008B', bg: 'bg-primary/10' },
};

const ago = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return 'Yesterday';
  return d.toLocaleDateString();
};

export default function NotificationsScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await listNotifications()); } catch (_) { setItems([]); }
  }, []);

  // Reload on focus so newly-pushed status notifications appear.
  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => { await load(); if (active) setLoading(false); })();
    return () => { active = false; };
  }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onOpen = async (n) => {
    if (!n.read) {
      try { await markNotificationRead(n.id); } catch (_) {}
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.bookingId) navigation.navigate('RepairOrderDetails', { bookingId: n.bookingId, fromOrders: true });
  };

  const onMarkAll = async () => {
    try { await markAllNotificationsRead(); } catch (_) {}
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  };

  if (loading) return <Loader label="Loading notifications..." />;

  const visible = items.filter((m) => {
    if (filter === 'All') return true;
    return (m.type || 'orders') === filter.toLowerCase();
  });

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border px-3 py-3 flex-row flex-wrap">
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {visible.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} color="#00008B" />}
          title="You're all caught up"
          description="We'll ping you when something new happens with your bookings."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
        >
          <View className="flex-row items-center justify-between px-1 mb-2">
            <Text className="text-[12px] text-text-muted">{visible.length} notifications</Text>
            <Pressable onPress={onMarkAll} className="flex-row items-center active:opacity-70">
              <CheckCircle2 size={14} color="#00008B" />
              <Text className="text-[12px] font-bold text-primary ml-1">Mark all read</Text>
            </Pressable>
          </View>
          {visible.map((n) => {
            const meta = META_BY_TYPE[n.type] || META_BY_TYPE.orders;
            const Icon = meta.icon;
            return (
              <Pressable key={n.id} onPress={() => onOpen(n)} className="active:opacity-80">
                <Card className={`mb-2 rounded-2xl ${!n.read ? 'border-primary/30' : ''}`} padded>
                  <View className="flex-row items-start">
                    <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${meta.bg}`}>
                      <Icon size={18} color={meta.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-[13px] font-extrabold text-text flex-1" numberOfLines={1}>{n.title}</Text>
                        {!n.read ? <Badge variant="softPrimary">NEW</Badge> : null}
                      </View>
                      {n.body ? <Text className="text-[12px] text-text-muted mt-1 leading-5">{n.body}</Text> : null}
                      <Text className="text-[10px] text-text-muted mt-1.5">{ago(n.createdAt)}</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
