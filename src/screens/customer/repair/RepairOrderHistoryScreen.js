import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { Card, CardTitle, Loader, EmptyState, Badge } from '../../../components/rnr';
import { getRepairBooking } from '../../../api/orders';

export default function RepairOrderHistoryScreen({ route }) {
  const { bookingId } = route.params || {};
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setB(await getRepairBooking(bookingId)); } catch (_) {}
      setLoading(false);
    })();
  }, [bookingId]);

  if (loading) return <Loader label="Loading tracking..." />;

  const events = b?.events || [];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Card className="rounded-2xl mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <CardTitle>Tracking ID</CardTitle>
          <Badge variant="softPrimary">#{b?.bookingNumber || '—'}</Badge>
        </View>
        <Text className="text-[12px] text-text-muted">Live updates from your shop. Pull to refresh.</Text>
      </Card>

      <Card className="rounded-2xl">
        <CardTitle className="mb-2">Status Timeline</CardTitle>
        {events.length === 0 ? (
          <EmptyState
            icon={<Clock size={28} color="#00008B" />}
            title="No events yet"
            description="We'll update this as your booking progresses."
          />
        ) : (
          events.map((e, idx) => {
            const isLast = idx === events.length - 1;
            const done = idx < events.length - 1;
            return (
              <View key={e.id || idx} className="flex-row">
                <View className="items-center mr-3" style={{ width: 24 }}>
                  <View className={`h-6 w-6 rounded-full items-center justify-center ${done ? 'bg-success' : 'bg-primary'}`}>
                    {done ? <Check size={14} color="#fff" /> : <View className="h-2 w-2 rounded-full bg-white" />}
                  </View>
                  {!isLast ? <View className="flex-1 w-0.5 bg-border my-1" /> : null}
                </View>
                <View className="flex-1 pb-4">
                  <Text className="text-[13px] font-extrabold text-text">{(e.status || '').replace(/_/g, ' ')}</Text>
                  {e.createdAt ? (
                    <Text className="text-[11px] text-text-muted mt-0.5">
                      {new Date(e.createdAt).toLocaleString()}
                    </Text>
                  ) : null}
                  {e.note ? <Text className="text-[12px] text-text mt-1">{e.note}</Text> : null}
                </View>
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}
