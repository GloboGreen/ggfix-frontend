import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlusCircle,
  Receipt,
  BarChart3,
  HelpCircle,
  Users,
  ShoppingBag,
  Tag,
  CheckCircle2,
  UserCheck,
  Wrench,
  PackageCheck,
  Truck,
  PackageOpen,
  Clock,
  TrendingUp,
  Bell,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  ArrowLeftRight,
  Store,
  X,
  Check,
} from 'lucide-react-native';
import { ticketApi } from '../../api/client';
import { Loader, SectionHeader, Badge } from '../../components/rnr';
import { getSession } from '../../auth/session';
import { fetchMe, switchShop } from '../../api/auth';

function useBookingCounts() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.get('/tickets/counts');
      setCounts(data || {});
    } catch (e) {
      setError(e.message || 'Failed to load counts');
      setCounts({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = counts
    ? {
        serviceAccepted: Number(counts.CREATED ?? 0),
        technicianAssigned: Number(counts.assignedCount ?? 0),
        inServiceProcess: Number(counts.IN_DIAGNOSIS ?? 0) + Number(counts.IN_REPAIR ?? 0),
        workCompleted: Number(counts.READY ?? 0),
        outForDelivery: Number(counts.READY ?? 0),
        delivered: Number(counts.DELIVERED ?? 0),
        workPending: Number(counts.QUOTED ?? 0) + Number(counts.APPROVED ?? 0),
        total: Number(counts.total ?? 0),
      }
    : null;

  return { summary, loading, error, refresh: load };
}

const STATUSES = [
  { key: 'serviceAccepted',   label: 'Service\nAccepted',   icon: CheckCircle2, color: '#10B981', bg: 'bg-success/10',   text: 'text-success'   },
  { key: 'technicianAssigned',label: 'Technician\nAssigned',icon: UserCheck,    color: '#0EA5E9', bg: 'bg-info/10',      text: 'text-info'      },
  { key: 'inServiceProcess',  label: 'In Service\nProcess', icon: Wrench,       color: '#2563EB', bg: 'bg-secondary/10', text: 'text-secondary' },
  { key: 'workCompleted',     label: 'Work\nCompleted',     icon: PackageCheck, color: '#7C3AED', bg: 'bg-primary/10',   text: 'text-primary'   },
  { key: 'outForDelivery',    label: 'Out for\nDelivery',   icon: Truck,        color: '#F59E0B', bg: 'bg-warning/10',   text: 'text-warning'   },
  { key: 'delivered',         label: 'Delivered',           icon: PackageOpen,  color: '#10B981', bg: 'bg-success/10',   text: 'text-success'   },
  { key: 'workPending',       label: 'Work\nPending',       icon: Clock,        color: '#EF4444', bg: 'bg-danger/10',    text: 'text-danger'    },
];

export default function DashboardScreen({ navigation }) {
  const { summary, loading, error, refresh } = useBookingCounts();
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [switching, setSwitching] = useState(false);

  const reloadSession = useCallback(async () => {
    try { setSession(await fetchMe()); }
    catch { try { setSession(await getSession()); } catch { setSession(null); } }
  }, []);

  useEffect(() => { reloadSession(); }, [reloadSession]);

  const shopName = session?.shopName || (session?.shops?.find?.((s) => s.isActive)?.name) || 'Shop · Owner';
  const shops = session?.shops || [];
  const hasMultipleShops = shops.length > 1;

  const handleSwitch = async (shopId) => {
    if (!shopId || shopId === session?.shopId) { setShowSwitcher(false); return; }
    setSwitching(true);
    try {
      await switchShop(shopId);
      await reloadSession();
      await refresh();      // refresh ticket counts for the new shop
      setShowSwitcher(false);
    } catch (e) {
      setShowSwitcher(false);
    } finally {
      setSwitching(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const gotoParent = (route) => {
    const parent = navigation.getParent && navigation.getParent();
    if (parent) parent.navigate(route);
    else navigation.navigate(route);
  };

  if (loading && !summary) {
    return <Loader label="Loading dashboard..." />;
  }

  const total = summary?.total ?? 0;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#1E1EAC', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 8, paddingBottom: 12, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}
        >
          <View className="px-4 flex-row items-center">
            <View className="h-10 w-10 rounded-2xl bg-white/15 items-center justify-center mr-2.5">
              <Wrench size={18} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-white/75 text-[10px]">Good day</Text>
              <Text className="text-white text-[16px] font-extrabold leading-5" numberOfLines={1}>{shopName}</Text>
              <View className="flex-row items-center mt-0.5">
                <ShieldCheck size={10} color="#A7F3D0" />
                <Text className="text-emerald-200 text-[9px] font-bold ml-1 tracking-wide">VERIFIED SHOP OWNER</Text>
              </View>
            </View>
            {hasMultipleShops ? (
              <Pressable
                onPress={() => setShowSwitcher(true)}
                className="h-9 px-2.5 rounded-full bg-white/15 items-center justify-center active:opacity-80 flex-row mr-1.5"
              >
                <ArrowLeftRight size={14} color="#fff" />
                <Text className="text-white text-[10px] font-bold ml-1">{shops.length}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setShowNotifications(true)}
              className="h-9 w-9 rounded-full bg-white/15 items-center justify-center active:opacity-80"
            >
              <Bell size={16} color="#fff" />
            </Pressable>
          </View>

          <View className="px-4 mt-2">
            <Text className="text-white/80 text-[11px]">Today at a glance</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
      >
        {/* KPI strip — sits cleanly below the header, no negative-margin clipping */}
        <View className="mx-4 mt-3 bg-card border border-border rounded-2xl p-3 flex-row"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
          <View className="flex-1 px-1">
            <Text className="text-[9px] font-bold text-text-muted tracking-widest">BOOKINGS</Text>
            <Text className="text-[20px] font-extrabold text-primary mt-0.5 leading-6">{total}</Text>
            <View className="flex-row items-center">
              <TrendingUp size={9} color="#10B981" />
              <Text className="text-[9px] font-bold text-success ml-0.5">All-time</Text>
            </View>
          </View>
          <View className="w-px bg-border my-1" />
          <View className="flex-1 px-1">
            <Text className="text-[9px] font-bold text-text-muted tracking-widest">ACTIVE</Text>
            <Text className="text-[20px] font-extrabold text-secondary mt-0.5 leading-6">
              {(summary?.serviceAccepted || 0) + (summary?.technicianAssigned || 0) + (summary?.inServiceProcess || 0)}
            </Text>
            <Text className="text-[9px] font-bold text-text-muted">in pipeline</Text>
          </View>
          <View className="w-px bg-border my-1" />
          <View className="flex-1 px-1">
            <Text className="text-[9px] font-bold text-text-muted tracking-widest">DELIVERED</Text>
            <Text className="text-[20px] font-extrabold text-success mt-0.5 leading-6">{summary?.delivered || 0}</Text>
            <Text className="text-[9px] font-bold text-text-muted">closed jobs</Text>
          </View>
        </View>

        <SectionHeader title="Quick Access" caption="Tap to jump in" />
        <View className="px-3 flex-row flex-wrap">
          {[
            { key: 'NewBooking',   label: 'New Booking',      icon: PlusCircle, color: '#00008B', bg: '#EEF2FF', via: 'parent' },
            // 'Bookings' is a sibling TAB (not a Stack route), so navigate at tab level — no `via: parent`.
            { key: 'Bookings',     label: 'All Bookings',     icon: ClipboardList, color: '#0EA5E9', bg: '#E0F2FE' },
            { key: 'Billing',      label: 'Billing & Delivery', icon: Receipt,  color: '#2563EB', bg: '#DBEAFE' },
            { key: 'Reports',      label: 'Sales Report',      icon: BarChart3, color: '#10B981', bg: '#D1FAE5' },
            { key: '_enquiry',     label: 'Enquiry',           icon: HelpCircle, color: '#F59E0B', bg: '#FEF3C7' },
            { key: 'OwnerEmployeeList', label: 'Employees',    icon: Users,     color: '#7C3AED', bg: '#EDE9FE', via: 'parent' },
            { key: 'Buy',          label: 'Buy',               icon: ShoppingBag, color: '#EC4899', bg: '#FCE7F3' },
            { key: 'Sell',         label: 'Sell',              icon: Tag,         color: '#10B981', bg: '#D1FAE5' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <View key={t.label} style={{ width: '33.333%' }} className="p-1">
                <Pressable
                  onPress={() => { if (t.via === 'parent') gotoParent(t.key); else navigation.navigate(t.key); }}
                  className="bg-card border border-border rounded-xl px-2 py-2.5 items-center active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                >
                  <View className="h-9 w-9 rounded-xl items-center justify-center mb-1.5" style={{ backgroundColor: t.bg }}>
                    <Icon size={16} color={t.color} />
                  </View>
                  <Text className="text-[10px] font-extrabold text-text text-center" numberOfLines={2}>{t.label}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <SectionHeader title="Booking Status" caption="Live pipeline" action="View all" onAction={() => gotoParent('Bookings')} />
        {error ? (
          <View className="mx-4 bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
            <Text className="text-[12px] text-danger">{error}</Text>
          </View>
        ) : (
          <View className="px-3 flex-row flex-wrap">
            {STATUSES.map((s) => {
              const Icon = s.icon;
              const value = summary?.[s.key] ?? 0;
              const isHot = value > 0;
              return (
                <View key={s.key} style={{ width: '50%' }} className="p-1">
                  <Pressable
                    onPress={() => gotoParent('Bookings')}
                    className="bg-card border border-border rounded-xl p-2.5 flex-row items-center active:opacity-80"
                    style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                  >
                    <View className={`h-9 w-9 rounded-xl items-center justify-center mr-2 ${s.bg}`}>
                      <Icon size={16} color={s.color} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[17px] font-extrabold leading-5 ${s.text}`}>{value}</Text>
                      <Text className="text-[10px] text-text-muted leading-tight" numberOfLines={2}>{s.label.replace('\n', ' ')}</Text>
                    </View>
                    {isHot ? <Badge variant={value > 3 ? 'softDanger' : 'softWarning'}>{value > 3 ? 'HOT' : 'NEW'}</Badge> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View className="px-4 mt-3">
          <Pressable
            onPress={() => gotoParent('NewBooking')}
            className="bg-primary rounded-xl p-3 flex-row items-center active:opacity-90"
            style={{ shadowColor: '#00008B', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
          >
            <View className="h-10 w-10 rounded-xl bg-white/15 items-center justify-center mr-2.5">
              <PlusCircle size={18} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-[13px] font-extrabold">Create new booking</Text>
              <Text className="text-white/80 text-[10px] mt-0.5">Walk-in customer or scheduled pickup</Text>
            </View>
            <ChevronRight size={16} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Shop switcher */}
      <Modal visible={showSwitcher} transparent animationType="fade" onRequestClose={() => setShowSwitcher(false)}>
        <Pressable
          onPress={() => setShowSwitcher(false)}
          style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[16px] font-extrabold text-text">Switch Shop</Text>
              <Pressable onPress={() => setShowSwitcher(false)} hitSlop={8}><X size={20} color="#0F172A" /></Pressable>
            </View>
            <Text className="text-[12px] text-text-muted mb-3">Choose which of your shops to manage.</Text>
            {shops.map((s) => {
              const active = s.id === session?.shopId;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => handleSwitch(s.id)}
                  disabled={switching || active}
                  className={`flex-row items-center py-3 px-3 rounded-xl border mb-2 ${active ? 'border-primary bg-primary/10' : 'border-border'}`}
                >
                  <View className={`h-8 w-8 rounded-lg ${active ? 'bg-primary' : 'bg-primary/10'} items-center justify-center mr-2.5`}>
                    <Store size={14} color={active ? '#fff' : '#00008B'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-[14px] font-bold ${active ? 'text-primary' : 'text-text'}`} numberOfLines={1}>{s.name}</Text>
                    <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{s.slug}</Text>
                  </View>
                  {active ? (
                    <View className="h-6 w-6 rounded-full bg-emerald-100 items-center justify-center">
                      <Check size={14} color="#10B981" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
            {switching ? (
              <View className="flex-row items-center justify-center mt-1">
                <ActivityIndicator color="#00008B" />
                <Text className="text-[12px] text-text-muted ml-2">Switching…</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Notifications placeholder (real feed wires later) */}
      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <Pressable
          onPress={() => setShowNotifications(false)}
          style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28, minHeight: 220 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Bell size={16} color="#0F172A" />
                <Text className="text-[16px] font-extrabold text-text ml-1.5">Notifications</Text>
              </View>
              <Pressable onPress={() => setShowNotifications(false)} hitSlop={8}><X size={20} color="#0F172A" /></Pressable>
            </View>
            <View className="items-center py-8">
              <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                <Bell size={20} color="#00008B" />
              </View>
              <Text className="text-[13px] font-bold text-text">You're all caught up</Text>
              <Text className="text-[11px] text-text-muted mt-1 text-center px-6">
                Booking updates, payouts and team alerts for <Text className="font-bold text-text">{shopName}</Text> will appear here.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
