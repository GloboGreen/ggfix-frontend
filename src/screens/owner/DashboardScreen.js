import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

const RADIAL_SIZE = 56;
const RADIAL_RING = 8;
const RADIAL_INNER = RADIAL_SIZE - RADIAL_RING * 2;

/** Lighten hex color for glassy highlight */
function lighten(hex, pct = 0.4) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + (255 - (num >> 16 & 0xff)) * pct);
  const g = Math.min(255, ((num >> 8) & 0xff) + (255 - (num >> 8 & 0xff)) * pct);
  const b = Math.min(255, (num & 0xff) + (255 - (num & 0xff)) * pct);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Map backend status counts to dashboard tiles
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

  useEffect(() => {
    load();
  }, [load]);

  const summary = counts
    ? {
        serviceAccepted: Number(counts.CREATED ?? 0),
        technicianAssigned: Number(counts.assignedCount ?? 0),
        inServiceProcess:
          Number(counts.IN_DIAGNOSIS ?? 0) + Number(counts.IN_REPAIR ?? 0),
        workCompleted: Number(counts.READY ?? 0),
        outForDelivery: Number(counts.READY ?? 0), // same as ready for pickup
        delivered: Number(counts.DELIVERED ?? 0),
        workPending: Number(counts.QUOTED ?? 0) + Number(counts.APPROVED ?? 0),
        total: Number(counts.total ?? 0),
      }
    : null;

  return { summary, loading, error, refresh: load };
}

export default function DashboardScreen({ navigation }) {
  const { summary, loading, error, refresh } = useBookingCounts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const shopName = 'Shop';
  const ownerName = 'Owner';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.owner}>{ownerName}</Text>
            <Text style={styles.caption}>Verified shop owner</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMetricLabel}>Total Bookings</Text>
            <Text style={styles.headerMetricValue}>
              {summary != null ? String(summary.total) : '—'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          <QuickTile
            icon="add-circle-outline"
            label="New Booking"
            onPress={() => {
              const parent = navigation.getParent && navigation.getParent();
              if (parent) {
                parent.navigate('NewBooking');
              } else {
                navigation.navigate('NewBooking');
              }
            }}
          />
          <QuickTile
            icon="receipt-outline"
            label="Billing & Delivery"
            onPress={() => navigation.navigate('Billing')}
          />
          <QuickTile
            icon="bar-chart-outline"
            label="Sales Report"
            onPress={() => navigation.navigate('Reports')}
          />
          <QuickTile
            icon="help-circle-outline"
            label="Enquiry"
            onPress={() => {}}
          />
          <QuickTile
            icon="people-outline"
            label="Employees"
            onPress={() => {
              const parent = navigation.getParent && navigation.getParent();
              if (parent) parent.navigate('OwnerEmployeeList');
              else navigation.navigate('OwnerEmployeeList');
            }}
          />
          <QuickTile
            icon="bag-handle-outline"
            label="Buy / Sell"
            onPress={() => navigation.navigate('BuySell')}
          />
        </View>

        <Text style={styles.sectionTitle}>Booking Status Summary</Text>
        {loading && !summary ? (
          <ActivityIndicator size="small" color="#3B4FD7" style={{ marginVertical: 16 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.statusGrid}>
            <StatusTile
              label="Service Accepted"
              value={summary ? String(summary.serviceAccepted) : '0'}
              color="#22C55E"
            />
            <StatusTile
              label="Technician Assigned"
              value={summary ? String(summary.technicianAssigned) : '0'}
              color="#22C55E"
            />
            <StatusTile
              label="In Service Process"
              value={summary ? String(summary.inServiceProcess) : '0'}
              color="#0EA5E9"
            />
            <StatusTile
              label="Work Completed"
              value={summary ? String(summary.workCompleted) : '0'}
              color="#6366F1"
            />
            <StatusTile
              label="Out for Delivery"
              value={summary ? String(summary.outForDelivery) : '0'}
              color="#F97316"
            />
            <StatusTile
              label="Delivered"
              value={summary ? String(summary.delivered) : '0'}
              color="#22C55E"
            />
            <StatusTile
              label="Work Pending"
              value={summary ? String(summary.workPending) : '0'}
              color="#F97316"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickTile({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.quickTile} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#111827" />
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusTile({ label, value, color }) {
  const highlight = lighten(color, 0.5);
  return (
    <View style={styles.statusTile}>
      <View style={styles.radialWrap}>
        <View style={[styles.radialOuter, { shadowColor: color, borderColor: highlight }]}>
          <View style={[styles.radialRing, { backgroundColor: color }]} />
          <View style={styles.radialGloss} />
          <View style={styles.radialInner}>
            <Text style={[styles.radialValue, { color }]} numberOfLines={1}>{value}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  headerLeft: { flex: 2 },
  headerRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  shopName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  owner: { fontSize: 14, color: '#111827', marginTop: 2 },
  caption: { fontSize: 11, color: '#4B5563', marginTop: 4 },
  headerMetricLabel: { fontSize: 11, color: '#6B7280' },
  headerMetricValue: { fontSize: 16, fontWeight: '700', color: '#16A34A', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 8 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 11,
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  radialWrap: {
    width: RADIAL_SIZE,
    height: RADIAL_SIZE,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialOuter: {
    width: RADIAL_SIZE,
    height: RADIAL_SIZE,
    borderRadius: RADIAL_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  radialRing: {
    position: 'absolute',
    width: RADIAL_SIZE,
    height: RADIAL_SIZE,
    borderRadius: RADIAL_SIZE / 2,
    opacity: 0.92,
  },
  radialGloss: {
    position: 'absolute',
    width: RADIAL_SIZE - 2,
    height: RADIAL_SIZE / 2,
    top: 1,
    borderTopLeftRadius: RADIAL_SIZE / 2,
    borderTopRightRadius: RADIAL_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  radialInner: {
    width: RADIAL_INNER,
    height: RADIAL_INNER,
    borderRadius: RADIAL_INNER / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusLabel: { fontSize: 11, color: '#4B5563', textAlign: 'center', paddingHorizontal: 2 },
  errorText: { fontSize: 13, color: '#DC2626', marginVertical: 12 },
});

