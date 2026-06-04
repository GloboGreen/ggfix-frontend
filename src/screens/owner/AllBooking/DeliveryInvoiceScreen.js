import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Share2, Printer, ArrowLeft, Receipt, Building2 } from 'lucide-react-native';
import { Card, CardTitle, Loader, PriceRow, PriceDivider, Badge, Button } from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { ticketApi } from '../../../api/client';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function priceItemsFromTicket(ticket) {
  if (Array.isArray(ticket.priceItems)) return ticket.priceItems;
  if (ticket.priceItemsJson) {
    try {
      const parsed = JSON.parse(ticket.priceItemsJson);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return ticket.services?.map?.((s) => ({ id: s.id, label: s.serviceName, amount: s.price })) || [];
}

function buildReceiptText(t) {
  const items = priceItemsFromTicket(t);
  const subtotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  return (
    `🧾 GGFix — Delivery Invoice\n` +
    `â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n` +
    `Receipt #: ${t.trackingId || t.id}\n` +
    `Date: ${formatDate(t.deliveredAt || t.createdAt)}\n\n` +
    `From: ${t.shopName || 'GGFix Service Center'}\n` +
    `${t.shopAddress || ''}\n` +
    `${t.shopPhone ? 'Ph: ' + t.shopPhone : ''}\n\n` +
    `To: ${t.customerName || '—'}\n` +
    `${t.customerPhone ? 'Mobile: ' + t.customerPhone : ''}\n` +
    `${t.customerAddress || ''}\n\n` +
    `Device: ${t.deviceDisplayName || t.deviceModelName || t.modelName || '—'}\n\n` +
    `â”€â”€â”€ Services â”€â”€â”€\n` +
    items.map((i, idx) => `${idx + 1}. ${i.label}   ₹${Number(i.amount || 0).toLocaleString('en-IN')}`).join('\n') +
    `\n\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\n` +
    `GST (18%): ₹${tax.toLocaleString('en-IN')}\n` +
    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
    `Total: ₹${total.toLocaleString('en-IN')}\n\n` +
    `Thank you for choosing GGFix!\n` +
    `30-day repair warranty included.`
  );
}

export default function DeliveryInvoiceScreen({ navigation, route }) {
  const ticketId = route?.params?.ticketId;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const t = await ticketApi.get(`/tickets/${ticketId}`).catch(() => null);
      setTicket(t || {});
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Loader label="Loading invoice..." />;

  const t = ticket || {};
  const items = priceItemsFromTicket(t);
  const subtotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handleShare = async () => {
    try {
      await Share.share({
        message: buildReceiptText(t),
        title: `Invoice ${t.trackingId || t.id}`,
      });
    } catch (e) {
      notify('Share failed', e?.message || 'Try again');
    }
  };

  const handlePrint = () => {
    notify(
      'Print via share sheet',
      'Tap Share and choose "Print" from the system share sheet. Native print needs Expo Print module.',
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 140 }}>
        {/* Letterhead */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-start">
            <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
              <Building2 size={18} color="#00008B" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted uppercase tracking-widest">From</Text>
              <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{t.shopName || 'GGFix Service Center'}</Text>
              <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={2}>{t.shopAddress || 'India'}</Text>
              {t.shopPhone ? <Text className="text-[10px] text-text-muted">Ph: {t.shopPhone}</Text> : null}
            </View>
            <Badge variant="softSuccess">DELIVERY</Badge>
          </View>
        </Card>

        {/* Invoice meta */}
        <Card className="rounded-2xl mb-2.5">
          <View className="flex-row items-center mb-2">
            <Receipt size={14} color="#10B981" />
            <CardTitle className="ml-2">Invoice Details</CardTitle>
          </View>
          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Text className="text-[10px] text-text-muted">Receipt No.</Text>
              <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{t.trackingId || t.id || '—'}</Text>
            </View>
            <View className="px-1 flex-1">
              <Text className="text-[10px] text-text-muted">Date</Text>
              <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{formatDate(t.deliveredAt || t.createdAt)}</Text>
            </View>
          </View>
        </Card>

        {/* Bill to */}
        <Card className="rounded-2xl mb-2.5">
          <CardTitle className="mb-1">Bill To</CardTitle>
          <Text className="text-[12px] font-bold text-text">{t.customerName || '—'}</Text>
          {t.customerPhone ? <Text className="text-[11px] text-text-muted">{t.customerPhone}</Text> : null}
          {t.customerAddress ? <Text className="text-[11px] text-text-muted leading-4 mt-0.5">{t.customerAddress}</Text> : null}
        </Card>

        {/* Items */}
        <Card className="rounded-2xl mb-2.5">
          <CardTitle className="mb-2">Items</CardTitle>
          {/* Table header */}
          <View className="flex-row border-b border-border pb-1.5 mb-1">
            <Text className="text-[10px] font-extrabold text-text-muted w-6">#</Text>
            <Text className="text-[10px] font-extrabold text-text-muted flex-1">DESCRIPTION</Text>
            <Text className="text-[10px] font-extrabold text-text-muted text-right" style={{ width: 70 }}>AMOUNT</Text>
          </View>
          {items.length === 0 ? (
            <Text className="text-[12px] text-text-muted py-2">No items recorded</Text>
          ) : items.map((item, i) => (
            <View key={item.id || i} className="flex-row py-1.5 border-b border-border">
              <Text className="text-[11px] text-text w-6">{i + 1}</Text>
              <Text className="text-[11px] text-text flex-1 pr-2" numberOfLines={2}>{item.label}</Text>
              <Text className="text-[11px] font-bold text-text text-right" style={{ width: 70 }}>
                ₹{Number(item.amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <View className="mt-1.5">
            <PriceRow label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
            <PriceRow label="GST (18%)" value={`₹${tax.toLocaleString('en-IN')}`} />
            <PriceDivider />
            <PriceRow label="Total" value={`₹${total.toLocaleString('en-IN')}`} bold />
          </View>
        </Card>

        {/* Footer note */}
        <View className="bg-success/5 border border-success/20 rounded-xl p-2.5 mb-1 flex-row items-start">
          <Text className="text-[10px] text-text-muted leading-4 flex-1">
            We declare that this invoice shows the actual price of the goods described above and all particulars are true and correct. 30-day repair warranty included.
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
          onPress={handlePrint}
          leftIcon={<Printer size={14} color="#00008B" />}
        >
          Print
        </Button>
        <Button
          className="flex-1 ml-2"
          onPress={handleShare}
          leftIcon={<Share2 size={14} color="#fff" />}
        >
          Share
        </Button>
      </View>
    </View>
  );
}

