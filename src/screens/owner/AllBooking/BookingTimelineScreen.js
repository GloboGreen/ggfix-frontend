import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Check, Clock } from 'lucide-react-native';
import { Card, CardTitle, Loader, EmptyState, Badge } from '../../../components/rnr';
import { ticketApi } from '../../../api/client';

const STATUS_COLOR = {
  CREATED:      { color: '#22C55E', bg: 'bg-success/10' },
  ASSIGNED:     { color: '#7C3AED', bg: 'bg-primary/10' },
  IN_DIAGNOSIS: { color: '#0EA5E9', bg: 'bg-info/10' },
  IN_REPAIR:    { color: '#2563EB', bg: 'bg-secondary/10' },
  QUOTED:       { color: '#F59E0B', bg: 'bg-warning/10' },
  APPROVED:     { color: '#00008B', bg: 'bg-primary/10' },
  PENDING:      { color: '#F97316', bg: 'bg-warning/10' },
  READY:        { color: '#10B981', bg: 'bg-success/10' },
  DELIVERED:    { color: '#10B981', bg: 'bg-success/10' },
  CANCELLED:    { color: '#EF4444', bg: 'bg-danger/10' },
};

function colorFor(status) {
  return STATUS_COLOR[String(status || '').toUpperCase()] || { color: '#64748B', bg: 'bg-background' };
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString([], { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function BookingTimelineScreen({ route }) {
  const ticketId = route?.params?.ticketId;
  const [events, setEvents] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const [t, ev] = await Promise.all([
        ticketApi.get(`/tickets/${ticketId}`).catch(() => null),
        ticketApi.get(`/tickets/${ticketId}/events`).catch(() => []),
      ]);
      setTicket(t);
      setEvents(Array.isArray(ev) ? ev : ev?.content ?? []);
    } catch (e) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Loader label="Loading history..." />;

  const trackingId = ticket?.trackingId || ticketId;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Tracking</Text>
              <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{trackingId}</Text>
            </View>
            <Badge variant="softPrimary">{events.length} EVENT{events.length === 1 ? '' : 'S'}</Badge>
          </View>
        </Card>

        <Card className="rounded-2xl">
          <CardTitle className="mb-2">Status Timeline</CardTitle>
          {error ? (
            <View className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 mb-2">
              <Text className="text-[12px] text-danger">{error}</Text>
            </View>
          ) : null}
          {events.length === 0 ? (
            <EmptyState
              icon={<Clock size={26} color="#00008B" />}
              title="No events yet"
              description="Updates will appear as the booking progresses."
            />
          ) : (
            events.map((e, idx) => {
              const isLast = idx === events.length - 1;
              const done = idx < events.length - 1;
              const meta = colorFor(e.status);
              return (
                <View key={e.id || idx} className="flex-row">
                  <View className="items-center mr-3" style={{ width: 24 }}>
                    <View
                      className="h-6 w-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: meta.color }}
                    >
                      {done ? <Check size={14} color="#fff" /> : <View className="h-2 w-2 rounded-full bg-white" />}
                    </View>
                    {!isLast ? <View className="flex-1 w-0.5 bg-border my-1" /> : null}
                  </View>
                  <View className="flex-1 pb-3">
                    <Text className="text-[12px] font-extrabold" style={{ color: meta.color }}>
                      {(e.status || '').replace(/_/g, ' ')}
                    </Text>
                    {e.createdAt ? (
                      <Text className="text-[10px] text-text-muted mt-0.5">{formatTime(e.createdAt)}</Text>
                    ) : null}
                    {e.note ? <Text className="text-[11px] text-text mt-1 leading-4">{e.note}</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

