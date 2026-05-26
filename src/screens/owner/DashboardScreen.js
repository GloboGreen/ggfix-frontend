import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlusCircle,
  Receipt,
  BarChart3,
  HelpCircle,
  Users,
  ShoppingBag,
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
} from 'lucide-react-native';
import { ticketApi } from '../../api/client';
import { Loader, SectionHeader, Badge } from '../../components/rnr';

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
          style={{ paddingTop: 12, paddingBottom: 40, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View className="px-4 flex-row items-center">
            <View className="h-11 w-11 rounded-2xl bg-white/15 items-center justify-center mr-3">
              <Wrench size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-white/75 text-[11px]">Good day</Text>
              <Text className="text-white text-[18px] font-extrabold">Shop · Owner</Text>
              <View className="flex-row items-center mt-0.5">
                <ShieldCheck size={11} color="#A7F3D0" />
                <Text className="text-emerald-200 text-[10px] font-bold ml-1">VERIFIED SHOP OWNER</Text>
              </View>
            </View>
            <Pressable className="h-10 w-10 rounded-full bg-white/15 items-center justify-center active:opacity-80">
              <Bell size={18} color="#fff" />
            </Pressable>
          </View>

          <View className="px-4 mt-4">
            <Text className="text-white/80 text-[12px]">Today at a glance</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
      >
        {/* KPI strip */}
        <View className="mx-4 -mt-7 bg-card border border-border rounded-3xl p-4 flex-row"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
          <View className="flex-1 px-1">
            <Text className="text-[10px] font-bold text-text-muted tracking-widest">TOTAL BOOKINGS</Text>
            <Text className="text-[26px] font-extrabold text-primary mt-1">{total}</Text>
            <View className="flex-row items-center mt-0.5">
              <TrendingUp size={11} color="#10B981" />
              <Text className="text-[10px] font-bold text-success ml-1">All-time</Text>
            </View>
          </View>
          <View className="w-px bg-border mx-1" />
          <View className="flex-1 px-1">
            <Text className="text-[10px] font-bold text-text-muted tracking-widest">ACTIVE</Text>
            <Text className="text-[26px] font-extrabold text-secondary mt-1">
              {(summary?.serviceAccepted || 0) + (summary?.technicianAssigned || 0) + (summary?.inServiceProcess || 0)}
            </Text>
            <Text className="text-[10px] font-bold text-text-muted mt-0.5">in pipeline</Text>
          </View>
          <View className="w-px bg-border mx-1" />
          <View className="flex-1 px-1">
            <Text className="text-[10px] font-bold text-text-muted tracking-widest">DELIVERED</Text>
            <Text className="text-[26px] font-extrabold text-success mt-1">{summary?.delivered || 0}</Text>
            <Text className="text-[10px] font-bold text-text-muted mt-0.5">closed jobs</Text>
          </View>
        </View>

        <SectionHeader title="Quick Access" caption="Tap to jump in" />
        <View className="px-3 flex-row flex-wrap">
          {[
            { key: 'NewBooking',   label: 'New Booking',      icon: PlusCircle, color: '#00008B', bg: '#EEF2FF', via: 'parent' },
            { key: 'Billing',      label: 'Billing & Delivery', icon: Receipt,  color: '#2563EB', bg: '#DBEAFE' },
            { key: 'Reports',      label: 'Sales Report',      icon: BarChart3, color: '#10B981', bg: '#D1FAE5' },
            { key: '_enquiry',     label: 'Enquiry',           icon: HelpCircle, color: '#F59E0B', bg: '#FEF3C7' },
            { key: 'OwnerEmployeeList', label: 'Employees',    icon: Users,     color: '#7C3AED', bg: '#EDE9FE', via: 'parent' },
            { key: 'BuySell',      label: 'Buy / Sell',        icon: ShoppingBag, color: '#EC4899', bg: '#FCE7F3' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <View key={t.label} style={{ width: '33.333%' }} className="p-1.5">
                <Pressable
                  onPress={() => { if (t.via === 'parent') gotoParent(t.key); else navigation.navigate(t.key); }}
                  className="bg-card border border-border rounded-2xl p-3 items-center active:opacity-80"
                  style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                >
                  <View className="h-11 w-11 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: t.bg }}>
                    <Icon size={20} color={t.color} />
                  </View>
                  <Text className="text-[11px] font-extrabold text-text text-center" numberOfLines={2}>{t.label}</Text>
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
                <View key={s.key} style={{ width: '50%' }} className="p-1.5">
                  <Pressable
                    onPress={() => gotoParent('Bookings')}
                    className="bg-card border border-border rounded-2xl p-3 flex-row items-center active:opacity-80"
                    style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                  >
                    <View className={`h-11 w-11 rounded-2xl items-center justify-center mr-3 ${s.bg}`}>
                      <Icon size={20} color={s.color} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[20px] font-extrabold ${s.text}`}>{value}</Text>
                      <Text className="text-[11px] text-text-muted leading-tight" numberOfLines={2}>{s.label.replace('\n', ' ')}</Text>
                    </View>
                    {isHot ? <Badge variant={value > 3 ? 'softDanger' : 'softWarning'}>{value > 3 ? 'HOT' : 'NEW'}</Badge> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View className="px-4 mt-2">
          <Pressable
            onPress={() => gotoParent('NewBooking')}
            className="bg-primary rounded-2xl p-4 flex-row items-center active:opacity-90"
            style={{ shadowColor: '#00008B', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}
          >
            <View className="h-12 w-12 rounded-2xl bg-white/15 items-center justify-center mr-3">
              <PlusCircle size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-[15px] font-extrabold">Create new booking</Text>
              <Text className="text-white/80 text-[11px] mt-0.5">Walk-in customer or scheduled pickup</Text>
            </View>
            <ChevronRight size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
