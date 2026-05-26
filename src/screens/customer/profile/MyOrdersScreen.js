import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FileText, Clock, Receipt, Package, ChevronRight } from 'lucide-react-native';
import {
  Card,
  Loader,
  EmptyState,
  Badge,
  Chip,
} from '../../../components/rnr';
import { listMyOrders } from '../../../api/orders';

const TABS = [
  { key: 'Buy', label: 'Buy' },
  { key: 'Sell', label: 'Sell' },
  { key: 'Pickup', label: 'Pickup' },
  { key: 'Enquiry', label: 'Enquiry' },
  { key: 'Service', label: 'Service' },
];
const TAB_MAP = { Buy: 'BUY', Sell: 'SELL', Pickup: 'PICKUP', Enquiry: 'ENQUIRY', Service: 'REPAIR' };
const STATUS_FILTERS = ['Pending', 'Completed', 'Cancelled'];

const STATUS_VARIANT = {
  PENDING: 'softWarning',
  IN_PROGRESS: 'softPrimary',
  COMPLETED: 'softSuccess',
  CANCELLED: 'softDanger',
};

export default function MyOrdersScreen() {
  const [tab, setTab] = useState('Buy');
  const [status, setStatus] = useState('Pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listMyOrders({ orderType: TAB_MAP[tab], status });
      setItems(list);
    } finally { setLoading(false); }
  }, [tab, status]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full mr-2 ${tab === t.key ? 'bg-primary' : 'bg-background border border-border'}`}
            >
              <Text className={`text-[12px] font-bold ${tab === t.key ? 'text-white' : 'text-text'}`}>{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View className="flex-row px-3 pb-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </View>

      {loading ? (
        <Loader label="Fetching your orders..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package size={28} color="#00008B" />}
          title={`No ${tab.toLowerCase()} orders`}
          description={`You don't have any ${status.toLowerCase()} ${tab.toLowerCase()} orders yet.`}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
          {items.map((o) => {
            const p = o.payload || {};
            const variant = STATUS_VARIANT[String(o.status).toUpperCase()] || 'softPrimary';
            return (
              <Card key={o.id} className="rounded-2xl mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center mr-2">
                      <Package size={16} color="#00008B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{p.title || o.orderType}</Text>
                      <Text className="text-[11px] text-text-muted">#{o.orderNumber}</Text>
                    </View>
                  </View>
                  <Badge variant={variant}>{(o.status || '').replace(/_/g, ' ')}</Badge>
                </View>

                {p.deviceName ? <Text className="text-[14px] font-bold text-text mt-3">{p.deviceName}</Text> : null}
                {p.shopName ? <Text className="text-[12px] text-text-muted mt-0.5">{p.shopName}</Text> : null}

                <View className="flex-row items-center justify-between mt-3">
                  {o.totalAmount != null ? (
                    <Text className="text-[15px] font-extrabold text-primary">₹{Number(o.totalAmount).toLocaleString()}</Text>
                  ) : <View />}
                  <Text className="text-[11px] text-text-muted">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>

                <View className="flex-row mt-3 -mx-1 pt-2 border-t border-border">
                  <Pressable className="flex-1 flex-row items-center justify-center py-2 active:opacity-70">
                    <FileText size={14} color="#00008B" />
                    <Text className="ml-1.5 text-[11px] font-bold text-primary">Details</Text>
                  </Pressable>
                  <Pressable className="flex-1 flex-row items-center justify-center py-2 active:opacity-70 border-l border-border">
                    <Clock size={14} color="#2563EB" />
                    <Text className="ml-1.5 text-[11px] font-bold text-secondary">Track</Text>
                  </Pressable>
                  <Pressable className="flex-1 flex-row items-center justify-center py-2 active:opacity-70 border-l border-border">
                    <Receipt size={14} color="#10B981" />
                    <Text className="ml-1.5 text-[11px] font-bold text-success">Receipt</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
