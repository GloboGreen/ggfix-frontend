import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Smartphone,
  ChevronRight,
  Filter,
  Phone,
  Wrench,
  ClipboardList,
  X,
} from 'lucide-react-native';
import {
  SearchBar,
  Badge,
  EmptyState,
  Loader,
  Chip,
} from '../../../components/rnr';
import { ticketApi } from '../../../api/client';
import { getModelsByBrand } from '../../../api/masterData';

const STATUS_VARIANT = {
  CREATED:           { variant: 'softWarning', label: 'Service Accepted' },
  ASSIGNED:          { variant: 'softPrimary', label: 'Technician Assigned' },
  IN_DIAGNOSIS:      { variant: 'softSecondary', label: 'In Diagnosis' },
  IN_REPAIR:         { variant: 'softSecondary', label: 'In Service Process' },
  QUOTED:            { variant: 'softWarning', label: 'Re-Estimated' },
  APPROVED:          { variant: 'softPrimary', label: 'Customer Approved' },
  READY:             { variant: 'softSuccess', label: 'Out For Delivery' },
  DELIVERED:         { variant: 'softSuccess', label: 'Delivered' },
  CANCELLED:         { variant: 'softDanger',  label: 'Cancelled' },
  RETURNED:          { variant: 'softDanger',  label: 'Returned' },
};

const STATUS_FILTERS = [
  { key: 'ALL',       label: 'All' },
  { key: 'CREATED',   label: 'Service Accepted' },
  { key: 'IN_REPAIR', label: 'In Service' },
  { key: 'READY',     label: 'Out For Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const DATE_FILTERS = ['Today', 'Yesterday', 'This Week', 'This Month', 'Last 3 Months', 'Last 6 Months'];

export default function BookingHistoryScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await ticketApi.get('/tickets', {
          query: {
            page: 0,
            size: 50,
            q: query || undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
          },
        });
        const content = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
        // Enrich each ticket with the model's catalog image and proper name —
        // tickets don't always carry deviceImageUrl / deviceDisplayName, but we
        // have brandId+modelId on every row.
        const brandIds = Array.from(new Set(content.map((t) => t.brandId).filter(Boolean)));
        const modelById = {};
        if (brandIds.length) {
          await Promise.all(brandIds.map(async (bId) => {
            try {
              const models = await getModelsByBrand(bId);
              (models || []).forEach((m) => { modelById[m.id] = m; });
            } catch (_) {}
          }));
        }
        const enriched = content.map((t) => {
          const m = t.modelId ? modelById[t.modelId] : null;
          const modelUrl = m?.imageUrl || (m?.imageBase64 ? `data:image/png;base64,${m.imageBase64}` : null);
          return {
            ...t,
            _modelName: m?.name || t.deviceDisplayName || t.modelName || null,
            _modelImage: t.deviceImageUrl || modelUrl || null,
          };
        });
        setItems(enriched);
      } catch (e) {
        setError(e.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, statusFilter],
  );

  // Reload on focus so EditBooking â†’ goBack triggers a refresh automatically.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const counts = useMemo(() => ({
    total: items.length,
  }), [items]);

  const renderItem = ({ item }) => {
    const deviceName = item._modelName || item.deviceDisplayName || item.deviceModelName || item.modelName || 'Device';
    const deviceImage = item._modelImage || item.deviceImageUrl || null;
    const color = item.color;
    const trackingId = item.trackingId || (item.id ? item.id.slice(0, 8).toUpperCase() : '-');
    const statusMeta = STATUS_VARIANT[String(item.status || '').toUpperCase()] || { variant: 'softPrimary', label: item.status || 'Pending' };
    const customerName = item.customerName || item.customerFullName || item.customer?.name || '-';
    const phone = item.customerPhone || item.customer?.phone || '';
    const services = item.repairServicesSummary || (item.services?.map?.((s) => s.serviceName).join(', ')) || '';

    return (
      <Pressable
        onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
        className="bg-card border border-border rounded-xl p-3 mb-2 active:opacity-80"
        style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
      >
        <View className="flex-row items-start mb-1.5">
          <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mr-2.5 overflow-hidden">
            {deviceImage ? (
              <Image source={{ uri: deviceImage }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : (
              <Smartphone size={18} color="#00008B" />
            )}
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-[11px] text-text-muted">Tracking · <Text className="text-text font-bold">{trackingId}</Text></Text>
            <Text className="text-[13px] font-extrabold text-text mt-0.5" numberOfLines={1}>{deviceName}</Text>
            {color ? <Text className="text-[11px] text-text-muted mt-0.5">Color: {color}</Text> : null}
          </View>
          <Badge variant={statusMeta.variant}>{statusMeta.label.toUpperCase()}</Badge>
        </View>

        <View className="border-t border-border pt-2 mt-1">
          <Row icon={<Smartphone size={11} color="#64748B" />} label="Customer" value={customerName} />
          {phone ? <Row icon={<Phone size={11} color="#64748B" />} label="Mobile" value={phone} /> : null}
          {services ? <Row icon={<Wrench size={11} color="#64748B" />} label="Services" value={services} numberOfLines={1} /> : null}
        </View>

        <View className="flex-row items-center justify-end mt-1.5">
          <Text className="text-[10px] font-bold text-primary mr-0.5">View Details</Text>
          <ChevronRight size={12} color="#00008B" />
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View className="bg-card px-4 py-2.5 border-b border-border">
          <View className="flex-row items-center mb-2.5">
            <View className="h-9 w-9 rounded-xl bg-primary/10 items-center justify-center mr-2">
              <ClipboardList size={18} color="#00008B" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-extrabold text-text">Bookings History</Text>
              <Text className="text-[10px] text-text-muted">{counts.total} booking{counts.total === 1 ? '' : 's'}</Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Search Tracking ID, name, mobile..."
                onClear={() => setQuery('')}
              />
            </View>
            <Pressable
              onPress={() => setShowFilters((v) => !v)}
              className={`h-10 px-3 rounded-2xl items-center justify-center flex-row ${showFilters || statusFilter !== 'ALL' || dateFilter ? 'bg-primary' : 'bg-card border border-border'}`}
            >
              <Filter size={14} color={showFilters || statusFilter !== 'ALL' || dateFilter ? '#fff' : '#0F172A'} />
              <Text className={`text-[12px] font-bold ml-1 ${showFilters || statusFilter !== 'ALL' || dateFilter ? 'text-white' : 'text-text'}`}>Filters</Text>
            </Pressable>
          </View>

          {/* Active filter chips */}
          {(statusFilter !== 'ALL' || dateFilter) ? (
            <View className="flex-row flex-wrap mt-2">
              {statusFilter !== 'ALL' ? (
                <Pressable onPress={() => setStatusFilter('ALL')} className="flex-row items-center bg-primary rounded-full pl-2.5 pr-1.5 py-1 mr-2 active:opacity-80">
                  <Text className="text-white text-[10px] font-bold mr-1">{STATUS_FILTERS.find(f => f.key === statusFilter)?.label}</Text>
                  <X size={10} color="#fff" />
                </Pressable>
              ) : null}
              {dateFilter ? (
                <Pressable onPress={() => setDateFilter(null)} className="flex-row items-center bg-secondary rounded-full pl-2.5 pr-1.5 py-1 mr-2 active:opacity-80">
                  <Text className="text-white text-[10px] font-bold mr-1">{dateFilter}</Text>
                  <X size={10} color="#fff" />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Filter panel */}
          {showFilters ? (
            <View className="bg-background border border-border rounded-xl p-2.5 mt-2">
              <Text className="text-[10px] font-extrabold text-text-muted tracking-widest mb-1.5">BOOKING STATUS</Text>
              <View className="flex-row flex-wrap mb-2">
                {STATUS_FILTERS.map((s) => (
                  <Chip key={s.key} label={s.label} active={statusFilter === s.key} onPress={() => setStatusFilter(s.key)} />
                ))}
              </View>
              <Text className="text-[10px] font-extrabold text-text-muted tracking-widest mb-1.5">BOOKING TIME</Text>
              <View className="flex-row flex-wrap">
                {DATE_FILTERS.map((d) => (
                  <Chip key={d} label={d} active={dateFilter === d} onPress={() => setDateFilter(dateFilter === d ? null : d)} />
                ))}
              </View>
              <View className="flex-row mt-2">
                <Pressable
                  onPress={() => { setStatusFilter('ALL'); setDateFilter(null); }}
                  className="flex-1 mr-1 py-2 rounded-lg bg-card border border-border items-center active:opacity-70"
                >
                  <Text className="text-[12px] font-bold text-text">Clear</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setShowFilters(false); load(true); }}
                  className="flex-1 ml-1 py-2 rounded-lg bg-primary items-center active:opacity-80"
                >
                  <Text className="text-[12px] font-bold text-white">Apply</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      {error ? (
        <View className="mx-4 mt-2 bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
          <Text className="text-[12px] text-danger">{error}</Text>
        </View>
      ) : null}

      {loading && items.length === 0 ? (
        <Loader label="Loading bookings..." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#00008B" />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24 }}
          ListEmptyComponent={
            <EmptyState
              icon={<ClipboardList size={26} color="#00008B" />}
              title="No bookings found"
              description={query || statusFilter !== 'ALL' ? 'Try clearing filters.' : 'Bookings will appear here as they are created.'}
              actionLabel={query || statusFilter !== 'ALL' ? 'Clear filters' : null}
              onAction={() => { setQuery(''); setStatusFilter('ALL'); setDateFilter(null); }}
            />
          }
        />
      )}
    </View>
  );
}

function Row({ icon, label, value, numberOfLines }) {
  return (
    <View className="flex-row items-center py-0.5">
      <View className="w-4 items-center mr-1">{icon}</View>
      <Text className="text-[10px] text-text-muted w-16">{label}</Text>
      <Text className="text-[11px] text-text flex-1" numberOfLines={numberOfLines || 1}>{value}</Text>
    </View>
  );
}

