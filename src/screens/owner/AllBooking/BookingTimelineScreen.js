import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, CardTitle, Loader, Badge } from '../../../components/rnr';
import { ticketApi } from '../../../api/client';
import {
  ServiceHistoryTimeline,
  getCurrentPhaseLabel,
} from '../../common/serviceHistoryPhases';

const hashed = (n) => (n ? (String(n).startsWith('#') ? n : `#${n}`) : '');

export default function BookingTimelineScreen({ route }) {
  const ticketId = route?.params?.ticketId;
  const [ticket, setTicket] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    try {
      const [t, ev] = await Promise.all([
        ticketApi.get(`/tickets/${ticketId}`).catch(() => null),
        ticketApi.get(`/tickets/${ticketId}/events`).catch(() => []),
      ]);
      setTicket(t);
      setEvents(Array.isArray(ev) ? ev : (ev?.content ?? []));
      setError(null);
    } catch (e) {
      setError(e?.message || 'Failed to load history');
    }
  }, [ticketId]);

  // Match the customer history's poll cadence so the owner timeline reflects
  // technician/status changes without manual refresh.
  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => { await load(); if (active) setLoading(false); })();
    timer.current = setInterval(load, 10000);
    return () => { active = false; if (timer.current) clearInterval(timer.current); };
  }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loader label="Loading history..." />;

  const currentLabel = getCurrentPhaseLabel(events, ticket?.status);
  const tracking = ticket?.trackingId ? hashed(ticket.trackingId) : ticketId;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
    >
      <Card className="rounded-2xl mb-3">
        <Text className="text-[10px] text-text-muted uppercase tracking-widest">Tracking ID</Text>
        <Text className="text-[15px] font-extrabold text-text mt-0.5">{tracking}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-[11px] text-text-muted mr-1">Current:</Text>
          <Badge variant="softSuccess">{currentLabel || 'Booking placed'}</Badge>
        </View>
        <Text className="text-[10px] text-text-muted mt-1">
          {events.length} event{events.length === 1 ? '' : 's'} - live from the shop. Pull to refresh.
        </Text>
      </Card>

      {error ? (
        <View className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 mb-3">
          <Text className="text-[12px] text-danger">{error}</Text>
        </View>
      ) : null}

      <Card className="rounded-2xl">
        <CardTitle className="mb-2">Service History</CardTitle>
        <ServiceHistoryTimeline events={events} status={ticket?.status} />
      </Card>
    </ScrollView>
  );
}
