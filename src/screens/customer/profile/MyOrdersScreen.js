import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  FileText, Clock, Receipt, Package, Truck, MessageCircle,
  ShoppingBag, Tag, Wrench, Smartphone, CalendarClock, Store, Phone,
  CheckCircle2, ReceiptText, ChevronRight,
} from 'lucide-react-native';
import {
  Loader,
  EmptyState,
  Badge,
  Chip,
} from '../../../components/rnr';
import { listMyOrders, getRepairBooking, getSellOrder } from '../../../api/orders';
import { getShop } from '../../../api/shops';
import { getBrands, getModelsByBrand, getRamOptions, getStorageOptions } from '../../../api/masterData';

const TABS = [
  { key: 'Buy',     label: 'Buy',     icon: ShoppingBag,   color: '#7C3AED', bg: 'bg-primary/10' },
  { key: 'Sell',    label: 'Sell',    icon: Tag,           color: '#10B981', bg: 'bg-success/10' },
  { key: 'Pickup',  label: 'Pickup',  icon: Truck,         color: '#00008B', bg: 'bg-primary/10' },
  { key: 'Enquiry', label: 'Enquiry', icon: MessageCircle, color: '#2563EB', bg: 'bg-secondary/10' },
  { key: 'Service', label: 'Service', icon: Wrench,        color: '#F59E0B', bg: 'bg-warning/10' },
];
// Backend stores repair bookings split by service mode: doorstep-pickup → PICKUP,
// enquiry → ENQUIRY, walk-in → REPAIR. Service tab shows every repair regardless
// of delivery mode (walk-in + doorstep pickup), since a pickup booking is still
// a service booking — the customer just chose pickup as the delivery channel.
// A pickup booking therefore appears in both the Pickup and Service tabs.
const TAB_MAP = { Buy: 'BUY', Sell: 'SELL', Pickup: 'PICKUP', Enquiry: 'ENQUIRY', Service: 'REPAIR' };
const TAB_ORDER_TYPES = { Service: ['REPAIR', 'PICKUP'] };
const REPAIR_TABS = new Set(['Pickup', 'Enquiry', 'Service']);
const STATUS_FILTERS = ['Pending', 'Completed', 'Cancelled'];

const STATUS_VARIANT = {
  PENDING: 'softWarning',
  IN_PROGRESS: 'softPrimary',
  COMPLETED: 'softSuccess',
  CANCELLED: 'softDanger',
};

const hashed = (n) => (n ? (String(n).startsWith('#') ? n : `#${n}`) : '');

export default function MyOrdersScreen({ navigation }) {
  const [tab, setTab] = useState('Service'); // repair bookings land here
  const [status, setStatus] = useState('Pending');
  const [items, setItems] = useState([]);
  const [details, setDetails] = useState({}); // orderId -> { name, image, specs, services, isPickup }
  // Persistent per-booking enrichment cache. Keyed by booking ref (bookingId)
  // so two customer_orders rows pointing at the same booking share one fetch
  // and re-runs of the enrichment effect (tab switch, focus, items array
  // reference change) skip already-resolved bookings — avoids the repeated
  // 4xx storm we saw in the network tab when the per-booking GET was failing.
  const enrichedCache = useRef(new Map()); // ref/key -> enriched record
  const masterCache = useRef(null); // { brandById, ramById, storageById }
  const modelsByBrand = useRef(new Map());
  const shopCache = useRef(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const types = TAB_ORDER_TYPES[tab] || [TAB_MAP[tab]];
      const lists = await Promise.all(types.map((t) => listMyOrders({ orderType: t, status })));
      // Merge (dedupe by id) and sort newest-first when a tab pulls multiple types.
      const byId = {};
      lists.flat().forEach((o) => { if (o && o.id) byId[o.id] = o; });
      const merged = Object.values(byId).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
      setItems(merged);
    } catch (e) {
      // Surface fetch failures instead of silently showing the empty state —
      // otherwise a 401/CORS/500 looks identical to "you have no orders".
      setItems([]);
      setError(e?.message || 'Failed to load orders');
    } finally { setLoading(false); }
  }, [tab, status]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Enrich orders with device name/image/specs resolved from the booking/sell
  // order + master data. Cached by ref so re-runs (focus, tab switch, items
  // reference change) reuse prior fetches instead of hammering the API.
  useEffect(() => {
    if (!items.length || !(REPAIR_TABS.has(tab) || tab === 'Sell')) { setDetails({}); return undefined; }
    let cancelled = false;
    (async () => {
      // Master data: brands / ram / storage. Fetched once per session.
      if (!masterCache.current) {
        const [brands, rams, storages] = await Promise.all([
          getBrands().catch(() => []),
          getRamOptions().catch(() => []),
          getStorageOptions().catch(() => []),
        ]);
        const brandById = {}; (brands || []).forEach((b) => { brandById[b.id] = b; });
        const ramById = {}; (rams || []).forEach((r) => { ramById[r.id] = r; });
        const storageById = {}; (storages || []).forEach((s) => { storageById[s.id] = s; });
        masterCache.current = { brandById, ramById, storageById };
      }
      const { brandById, ramById, storageById } = masterCache.current;
      const modelFor = async (brandId, modelId) => {
        if (!brandId || !modelId) return null;
        if (!modelsByBrand.current.has(brandId)) {
          modelsByBrand.current.set(brandId, await getModelsByBrand(brandId).catch(() => []));
        }
        return (modelsByBrand.current.get(brandId) || []).find((m) => m.id === modelId) || null;
      };
      const shopFor = async (shopId) => {
        if (!shopId) return null;
        if (!shopCache.current.has(shopId)) {
          shopCache.current.set(shopId, await getShop(shopId).catch(() => null));
        }
        return shopCache.current.get(shopId);
      };
      const modelImg = (m) => m?.imageUrl || (m?.imageBase64 ? `data:image/png;base64,${m.imageBase64}` : null);

      const enrichOne = async (o) => {
        if (tab === 'Sell') {
          const ref = o.referenceId || o.payload?.sellOrderId;
          if (!ref) return null;
          const cacheKey = `sell:${ref}`;
          if (enrichedCache.current.has(cacheKey)) return enrichedCache.current.get(cacheKey);
          const so = await getSellOrder(ref).catch(() => null);
          if (!so) { enrichedCache.current.set(cacheKey, null); return null; }
          const model = await modelFor(so.brandId, so.modelId);
          const brandName = brandById[so.brandId]?.name;
          const ramStorage = [ramById[so.ramOptionId]?.label, storageById[so.storageOptionId]?.label].filter(Boolean).join(' / ');
          const rec = {
            name: model?.name || (brandName ? `${brandName} device` : 'Sell Device'),
            image: modelImg(model),
            specs: [brandName, so.color, ramStorage].filter(Boolean).join(' · '),
          };
          enrichedCache.current.set(cacheKey, rec);
          return rec;
        }
        const ref = o.payload?.bookingId || o.referenceId;
        const p = o.payload || {};
        const cacheKey = `bk:${ref || o.id}`;
        if (enrichedCache.current.has(cacheKey)) return enrichedCache.current.get(cacheKey);
        // Service-tab cards already have enough booking data in customer_orders
        // payload. Avoid a protected detail fan-out here; details/history/receipt
        // fetch the booking on click.
        const shouldFetchBooking = ref && tab !== 'Service';
        const bk = shouldFetchBooking ? await getRepairBooking(ref).catch(() => null) : null;
        const brandId = bk?.brandId || p.brandId;
        const modelId = bk?.modelId || p.modelId;
        const ramOptionId = bk?.ramOptionId || p.ramOptionId;
        const storageOptionId = bk?.storageOptionId || p.storageOptionId;
        const color = bk?.color || p.color;
        const shopId = bk?.shopId || o.shopId || p.shopId;
        const serviceMode = bk?.serviceMode || p.serviceMode;
        const bkServices = (bk?.services || []).map((s) => s?.serviceName).filter(Boolean);
        const payloadServices = (p.services || []).map((s) => s?.serviceName || s?.name).filter(Boolean);
        const services = bkServices.length ? bkServices : payloadServices;
        const issueSummary = bk?.issueSummary || p.issueSummary;
        const model = await modelFor(brandId, modelId);
        const brandName = brandById[brandId]?.name;
        const ramStorage = [ramById[ramOptionId]?.label, storageById[storageOptionId]?.label].filter(Boolean).join(' / ');
        const sh = await shopFor(shopId);
        const shopName = sh?.name || p.shopName || null;
        const shopPhone = sh?.phone || sh?.mobile || null;
        const shopAddress = sh?.address || null;
        const rec = {
          name: bk?.modelName || model?.name || (brandName ? `${brandName} device` : null),
          image: modelImg(model),
          specs: [brandName, color, ramStorage].filter(Boolean).join(' · '),
          services,
          issueSummary,
          isPickup: serviceMode === 'PICKUP' || !!bk?.pickupAddressId || !!bk?.pickupDate || !!bk?.pickupSlotStart,
          shopName,
          shopPhone,
          shopAddress,
        };
        enrichedCache.current.set(cacheKey, rec);
        return rec;
      };

      // Dedupe by cache key first so two customer_orders rows sharing a
      // bookingId only trigger one in-flight fetch.
      const seen = new Map(); // cacheKey -> Promise<rec>
      const perOrder = await Promise.all((items || []).map(async (o) => {
        const ref = tab === 'Sell'
          ? (o.referenceId || o.payload?.sellOrderId)
          : (o.payload?.bookingId || o.referenceId);
        const cacheKey = tab === 'Sell' ? `sell:${ref}` : `bk:${ref || o.id}`;
        if (!seen.has(cacheKey)) seen.set(cacheKey, enrichOne(o));
        const rec = await seen.get(cacheKey);
        return [o.id, rec];
      }));
      if (cancelled) return;
      const next = {};
      for (const [id, rec] of perOrder) if (rec) next[id] = rec;
      setDetails(next);
    })();
    return () => { cancelled = true; };
  }, [items, tab]);

  // Each tab now fetches exactly the orderType(s) it should show, so no extra filtering.
  const visibleItems = items;

  const openOrder = (o) => {
    if (tab === 'Sell') {
      const sid = o.referenceId || o.payload?.sellOrderId;
      if (sid) navigation.navigate('SellOrderDetails', { sellOrderId: sid });
      return;
    }
    // Service tab: rows mirrored from a shop-created ticket carry payload.ticketId
    // and read from the tickets table. Customer-placed pickups go through the
    // repair_bookings detail screen as before.
    const ticketId = o.payload?.ticketId;
    if (tab === 'Service' && ticketId) {
      navigation.navigate('ServiceTicketDetails', { ticketId, fromOrders: true });
      return;
    }
    const ref = o.payload?.bookingId || o.referenceId;
    if (!ref) return;
    if (REPAIR_TABS.has(tab)) {
      navigation.navigate('RepairOrderDetails', { bookingId: ref, fromOrders: true });
    }
  };

  const openTimeline = (o) => {
    const ref = o.payload?.bookingId || o.referenceId;
    if (!ref) return;
    // Pickup and Service have distinct status flows / screens.
    const isPickup = tab === 'Pickup' || o.payload?.serviceMode === 'PICKUP' || details[o.id]?.isPickup;
    navigation.navigate(isPickup ? 'RepairPickupStatus' : 'RepairOrderHistory', { bookingId: ref });
  };

  const onReschedule = (o) => {
    const ref = o.payload?.bookingId || o.referenceId;
    if (ref) navigation.navigate('RepairPickupSlot', { rescheduleBookingId: ref, shopId: o.payload?.shopId });
  };

  const openReceipt = (o) => {
    const ref = o.payload?.bookingId || o.referenceId;
    if (ref) navigation.navigate('ServiceReceipt', { bookingId: ref });
  };

  const openInvoice = (o) => {
    const ref = o.payload?.bookingId || o.referenceId;
    if (ref) navigation.navigate('InvoiceReceipt', { bookingId: ref });
  };

  const tabMeta = TABS.find((t) => t.key === tab) || TABS[0];

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className={`flex-row items-center px-3 py-1.5 rounded-full mr-1.5 ${active ? 'bg-primary' : 'bg-background border border-border'}`}
              >
                <Icon size={12} color={active ? '#fff' : t.color} />
                <Text className={`ml-1 text-[11px] font-bold ${active ? 'text-white' : 'text-text'}`}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="flex-row px-3 pb-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </View>

      {loading ? (
        <Loader label="Fetching your orders..." />
      ) : error ? (
        <EmptyState
          icon={<Package size={26} color="#DC2626" />}
          title="Couldn't load orders"
          description={error}
        />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          icon={<Package size={26} color="#00008B" />}
          title={`No ${tab.toLowerCase()} orders`}
          description={`You don't have any ${status.toLowerCase()} ${tab.toLowerCase()} orders yet.`}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 24 }}>
          {visibleItems.map((o) => {
            const p = o.payload || {};
            const d = details[o.id] || {};
            const variant = STATUS_VARIANT[String(o.status).toUpperCase()] || 'softPrimary';
            const TabIcon = tabMeta.icon;
            const title = d.name || p.deviceName || p.title || o.orderType;
            return (
              <Pressable
                key={o.id}
                onPress={() => openOrder(o)}
                className="bg-card border border-border rounded-xl p-3 mb-2 active:opacity-80"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                {/* Service booking header */}
                {tab === 'Service' ? (
                  <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-border">
                    <View className="flex-row items-center flex-1 pr-2">
                      <CheckCircle2 size={15} color="#10B981" />
                      <Text className="text-[12px] font-extrabold text-text ml-1.5">Service Booking</Text>
                    </View>
                    <Text className="text-[10px] text-text-muted mr-1">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                    </Text>
                    <ChevronRight size={15} color="#94A3B8" />
                  </View>
                ) : null}

                {/* Row 1: device image/icon + title + status */}
                <View className="flex-row items-start">
                  <View className={`h-11 w-11 rounded-xl items-center justify-center mr-2.5 overflow-hidden ${d.image ? 'bg-background' : tabMeta.bg}`}>
                    {d.image ? (
                      <Image source={{ uri: d.image }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                    ) : (
                      <TabIcon size={16} color={tabMeta.color} />
                    )}
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{title}</Text>
                    <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{hashed(o.orderNumber)}</Text>
                    {d.specs ? (
                      <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{d.specs}</Text>
                    ) : null}
                    {tab === 'Service' && d.services?.length ? (
                      <View className="self-start bg-primary/10 rounded-full px-2 py-0.5 mt-1">
                        <Text className="text-[9px] font-bold text-primary">{d.services.length} Part(s)</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Badge variant={variant}>{
                      (tab === 'Service' && o.phaseLabel)
                        ? o.phaseLabel
                        : (o.status || '').replace(/_/g, ' ')
                    }</Badge>
                    {tab === 'Sell' ? (
                      <View className="mt-2"><ChevronRight size={18} color="#94A3B8" /></View>
                    ) : null}
                  </View>
                </View>

                {/* Repair services */}
                {d.services?.length ? (
                  tab === 'Service' ? (
                    <View className="mt-2">
                      <Text className="text-[10px] font-extrabold text-text-muted uppercase tracking-wide">Booked Repair Services</Text>
                      {d.services.map((s, i) => (
                        <Text key={i} className="text-[11px] text-text mt-0.5" numberOfLines={1}>{i + 1}. {s}</Text>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-[11px] text-text-muted mt-1.5" numberOfLines={2}>
                      Repair: {d.services.join(', ')}
                    </Text>
                  )
                ) : d.issueSummary && tab !== 'Service' ? (
                  <Text className="text-[11px] text-text-muted mt-1.5" numberOfLines={2}>
                    Repair: {d.issueSummary}
                  </Text>
                ) : null}

                {/* Shop name + address + mobile number */}
                {(d.shopName || p.shopName) ? (
                  <View className="mt-1.5">
                    <View className="flex-row items-center">
                      <Store size={12} color="#00008B" />
                      <Text className="text-[12px] font-bold text-text ml-1" numberOfLines={1}>{d.shopName || p.shopName}</Text>
                    </View>
                    {d.shopAddress ? (
                      <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={2}>Shop Address : {d.shopAddress}</Text>
                    ) : null}
                    {d.shopPhone ? (
                      <Text className="text-[10px] text-text-muted mt-0.5">Mobile Number : {d.shopPhone}</Text>
                    ) : null}
                  </View>
                ) : null}

                {/* Status line (service)
                    Prefer the live timeline phase the backend derives from
                    repair_booking_events.latest so the card reflects "Technician
                    Work Started" / "Customer Approved" / etc. instead of the
                    static customer_orders.status. */}
                {tab === 'Service' ? (
                  <Text className="text-[11px] font-bold text-success mt-1.5" numberOfLines={2}>
                    Status : {o.phaseLabel || (o.status || '').replace(/_/g, ' ')}
                  </Text>
                ) : null}

                {/* Amount + date */}
                <View className="flex-row items-center justify-between mt-1.5">
                  {o.totalAmount != null && Number(o.totalAmount) > 0 ? (
                    <Text className="text-[13px] font-extrabold text-primary">₹{Number(o.totalAmount).toLocaleString()}</Text>
                  ) : <View />}
                  <Text className="text-[10px] text-text-muted">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>

                {/* Actions */}
                {tab === 'Service' ? (
                  <View className="flex-row mt-2 pt-1.5 border-t border-border -mx-0.5">
                    <Pressable onPress={() => openOrder(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70">
                      <FileText size={11} color="#00008B" />
                      <Text className="ml-1 text-[9px] font-bold text-primary">View Details</Text>
                    </Pressable>
                    <Pressable onPress={() => openTimeline(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70 border-l border-border">
                      <Clock size={11} color="#2563EB" />
                      <Text className="ml-1 text-[9px] font-bold text-secondary">History</Text>
                    </Pressable>
                    <Pressable onPress={() => openReceipt(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70 border-l border-border">
                      <Receipt size={11} color="#10B981" />
                      <Text className="ml-1 text-[9px] font-bold text-success">Receipt</Text>
                    </Pressable>
                    {(() => {
                      const completed = String(o.status || '').toUpperCase() === 'COMPLETED';
                      return (
                        <Pressable
                          disabled={!completed}
                          onPress={() => openInvoice(o)}
                          className={`flex-1 flex-row items-center justify-center py-1 border-l border-border ${completed ? 'active:opacity-70' : 'opacity-40'}`}
                        >
                          <ReceiptText size={11} color="#7C3AED" />
                          <Text className="ml-1 text-[9px] font-bold text-primary">Invoice</Text>
                        </Pressable>
                      );
                    })()}
                  </View>
                ) : tab === 'Sell' ? null : (
                  <View className="flex-row mt-2 pt-1.5 border-t border-border -mx-0.5">
                    <Pressable onPress={() => openOrder(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70">
                      <FileText size={11} color="#00008B" />
                      <Text className="ml-1 text-[10px] font-bold text-primary">Details</Text>
                    </Pressable>
                    <Pressable onPress={() => openTimeline(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70 border-l border-border">
                      <Clock size={11} color="#2563EB" />
                      <Text className="ml-1 text-[10px] font-bold text-secondary">{tab === 'Pickup' ? 'History' : 'Track'}</Text>
                    </Pressable>
                    {tab === 'Pickup' ? (
                      <Pressable onPress={() => onReschedule(o)} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70 border-l border-border">
                        <CalendarClock size={11} color="#F59E0B" />
                        <Text className="ml-1 text-[10px] font-bold text-warning">Re-Schedule</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => (REPAIR_TABS.has(tab) ? openReceipt(o) : openOrder(o))} className="flex-1 flex-row items-center justify-center py-1 active:opacity-70 border-l border-border">
                        <Receipt size={11} color="#10B981" />
                        <Text className="ml-1 text-[10px] font-bold text-success">Receipt</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
