import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Minus, Plus, Share2, Printer, Smartphone, Wrench, ArrowLeft } from 'lucide-react-native';
import { Card, CardTitle, Loader, Badge, Button } from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { ticketApi } from '../../../api/client';

/**
 * Pure-RN faux barcode: deterministic bar-width pattern based on the input
 * string so the same tracking ID always renders the same pattern. Good
 * enough for visual print/share â€” not a scannable Code 128, but reads as
 * a barcode for the receipt header.
 */
function CodePattern({ value, width = 280, height = 70 }) {
  if (!value) return null;
  const bars = [];
  let h = 7;
  for (let i = 0; i < (value.length || 1) * 10 && bars.length < 90; i++) {
    h = (h * 31 + (value.charCodeAt(i % value.length) || 1)) >>> 0;
    bars.push((h % 3) + 1);
  }
  const total = bars.reduce((s, w) => s + w, 0);
  const unit = width / total;
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'stretch', backgroundColor: '#FFFFFF' }}>
      {bars.map((w, i) => (
        <View key={i} style={{ width: w * unit, backgroundColor: i % 2 === 0 ? '#0F172A' : '#FFFFFF' }} />
      ))}
    </View>
  );
}

export default function BarcodePrintScreen({ navigation, route }) {
  const ticketId = route?.params?.ticketId;
  const [ticket, setTicket] = useState(null);
  const [copies, setCopies] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const t = await ticketApi.get(`/tickets/${ticketId}`).catch(() => null);
      setTicket(t);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Loader label="Loading barcode..." />;

  const trackingId = ticket?.trackingId || ticketId || 'NO-ID';
  const deviceName = ticket?.deviceModelName || ticket?.modelName || 'Device';
  const services = ticket?.repairServicesSummary
    || ticket?.services?.map?.((s) => s.serviceName).join(', ')
    || 'â€”';
  const customerName = ticket?.customerName || 'â€”';

  const handleShare = async () => {
    const msg =
      `ðŸ“¦ GGFix Barcode Slip\n\n` +
      `Tracking: ${trackingId}\n` +
      `Customer: ${customerName}\n` +
      `Device: ${deviceName}\n` +
      `Service: ${services}\n` +
      `Copies: ${copies}\n\n` +
      `Stick this slip on the device before placing it on the workbench.`;
    try {
      await Share.share({ message: msg, title: `Barcode ${trackingId}` });
    } catch (e) {
      notify('Share failed', e?.message || 'Try again');
    }
  };

  const handlePrint = () => {
    notify(
      'Printing not configured',
      `${copies} slip${copies > 1 ? 's' : ''} for ${trackingId}.\n\nNative print needs Expo Print â€” use the Share button for now and pick "Print" from the share sheet.`,
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 140 }}>
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-start">
            <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
              <Smartphone size={18} color="#00008B" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">Booking</Text>
              <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{trackingId}</Text>
              <Text className="text-[11px] text-text mt-0.5" numberOfLines={1}>{deviceName}</Text>
            </View>
            <Badge variant="softPrimary">{copies} COPY</Badge>
          </View>
        </Card>

        <Card className="rounded-2xl mb-2.5">
          <CardTitle className="mb-2">Barcode Slip</CardTitle>
          <View className="bg-white border-2 border-dashed border-border rounded-xl p-3 items-center">
            <View className="flex-row mb-2 w-full">
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted">Service Number</Text>
                <Text className="text-[12px] font-extrabold text-text">{trackingId}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted">Device Model</Text>
                <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{deviceName}</Text>
              </View>
            </View>
            <View className="flex-row mb-3 w-full">
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted">Customer</Text>
                <Text className="text-[12px] font-bold text-text" numberOfLines={1}>{customerName}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted">Service</Text>
                <Text className="text-[12px] font-bold text-text" numberOfLines={1}>{services}</Text>
              </View>
            </View>
            <CodePattern value={trackingId} />
            <Text className="text-[12px] tracking-widest font-bold text-text mt-1">
              {String(trackingId).toUpperCase().split('').join(' ')}
            </Text>
          </View>
        </Card>

        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-[12px] font-extrabold text-text">Number of copies</Text>
              <Text className="text-[10px] text-text-muted mt-0.5">How many slips do you want?</Text>
            </View>
            <View className="flex-row items-center bg-background border border-border rounded-full">
              <Pressable
                onPress={() => setCopies((c) => Math.max(1, c - 1))}
                className="h-8 w-8 rounded-full items-center justify-center active:opacity-70"
              >
                <Minus size={14} color="#0F172A" />
              </Pressable>
              <Text className="text-[14px] font-extrabold text-text w-8 text-center">{copies}</Text>
              <Pressable
                onPress={() => setCopies((c) => Math.min(20, c + 1))}
                className="h-8 w-8 rounded-full bg-primary items-center justify-center active:opacity-80"
              >
                <Plus size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        </Card>

        <View className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 flex-row items-start">
          <Wrench size={12} color="#00008B" style={{ marginTop: 2 }} />
          <Text className="text-[10px] text-text-muted ml-2 flex-1 leading-4">
            Stick this slip on the device before placing it on the workbench. The barcode encodes the tracking ID for quick scanning.
          </Text>
        </View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 bg-card border-t border-border px-3 pt-2.5 pb-5 flex-row"
            style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 }}>
        <Button
          variant="outline"
          className="flex-1 mr-2"
          onPress={() => navigation.goBack()}
          leftIcon={<ArrowLeft size={14} color="#00008B" />}
        >
          Back
        </Button>
        <Button
          variant="outline"
          className="flex-1 mx-1"
          onPress={handleShare}
          leftIcon={<Share2 size={14} color="#00008B" />}
        >
          Share
        </Button>
        <Button
          className="flex-1 ml-2"
          onPress={handlePrint}
          leftIcon={<Printer size={14} color="#fff" />}
        >
          Print
        </Button>
      </View>
    </View>
  );
}

