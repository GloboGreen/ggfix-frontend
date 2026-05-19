import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(instant) {
  if (!instant) return '—';
  const d = new Date(instant);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OwnerEmployeeLeaveScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState('All');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!employee?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/leaves`, {
        query: { month, year },
      });
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id, month, year]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === 'All' ? list : list.filter((l) => l.status === filter.toUpperCase());
  const counts = {
    Leave: list.length,
    Processing: list.filter((l) => l.status === 'PROCESSING').length,
    Rejected: list.filter((l) => l.status === 'REJECTED').length,
    Approved: list.filter((l) => l.status === 'APPROVED').length,
  };

  if (!employee) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><Text style={styles.error}>Employee not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>This month</Text>
            <View style={styles.monthYearRow}>
              <TouchableOpacity onPress={() => { let m = month - 1; let y = year; if (m < 1) { m = 12; y--; } setMonth(m); setYear(y); }}>
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.monthYearText}>{MONTHS[month - 1]} {year}</Text>
              <TouchableOpacity onPress={() => { let m = month + 1; let y = year; if (m > 12) { m = 1; y++; } setMonth(m); setYear(y); }}>
                <Ionicons name="chevron-forward" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.countRow}>
            <View style={[styles.countBox, { backgroundColor: '#FCE7F3' }]}><Text style={styles.countNum}>{counts.Leave}</Text><Text style={styles.countLabel}>Leave</Text></View>
            <View style={[styles.countBox, { backgroundColor: '#FED7AA' }]}><Text style={styles.countNum}>{counts.Processing}</Text><Text style={styles.countLabel}>Processing</Text></View>
            <View style={[styles.countBox, { backgroundColor: '#FEE2E2' }]}><Text style={styles.countNum}>{counts.Rejected}</Text><Text style={styles.countLabel}>Rejected</Text></View>
            <View style={[styles.countBox, { backgroundColor: '#DCFCE7' }]}><Text style={styles.countNum}>{counts.Approved}</Text><Text style={styles.countLabel}>Approved</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.applyLeaveBtn} onPress={() => navigation.navigate('OwnerEmployeeApplyLeave', { employee })}>
          <Text style={styles.applyLeaveBtnText}>Apply for leave</Text>
        </TouchableOpacity>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Previous leave</Text>
          <View style={styles.filterRow}>
            {['All', 'Approved', 'Processing', 'Rejected'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {loading && list.length === 0 ? (
            <ActivityIndicator size="small" color="#3B4FD7" style={{ marginVertical: 16 }} />
          ) : filtered.length === 0 ? (
            <Text style={styles.empty}>No leave requests.</Text>
          ) : (
            filtered.map((item) => (
              <View key={item.id} style={styles.leaveCard}>
                <Text style={styles.leaveDate}>{formatDate(item.startDate)}</Text>
                <Text style={styles.leaveReason}>{item.reason || '—'}</Text>
                <Text style={styles.leaveMeta}>{item.appliedDaysLabel} • Requested {formatDateTime(item.requestedAt)}</Text>
                <View style={[styles.statusChip, item.status === 'APPROVED' && styles.statusApproved, item.status === 'REJECTED' && styles.statusRejected, item.status === 'PROCESSING' && styles.statusProcessing]}>
                  <Text style={styles.statusChipText}>{item.status}</Text>
                </View>
                {item.status === 'PROCESSING' && employee?.id && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.approveBtn} onPress={async () => { try { await ticketApi.patch(`/technicians/${employee.id}/leaves/${item.id}`, { body: { status: 'APPROVED' } }); load(true); } catch (e) { Alert.alert('Error', e.message); } }}>
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={async () => { try { await ticketApi.patch(`/technicians/${employee.id}/leaves/${item.id}`, { body: { status: 'REJECTED' } }); load(true); } catch (e) { Alert.alert('Error', e.message); } }}>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  monthYearText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  monthYearRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countRow: { flexDirection: 'row', gap: 8 },
  countBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  countNum: { fontSize: 18, fontWeight: '700', color: '#111827' },
  countLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  applyLeaveBtn: { marginTop: 12, backgroundColor: '#3B4FD7', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  applyLeaveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: '#3B4FD7' },
  filterChipText: { fontSize: 12, color: '#374151' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  leaveCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 8 },
  leaveDate: { fontSize: 14, fontWeight: '600', color: '#111827' },
  leaveReason: { fontSize: 13, color: '#374151', marginTop: 4 },
  leaveMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  statusChip: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#E5E7EB' },
  statusApproved: { backgroundColor: '#86EFAC' },
  statusRejected: { backgroundColor: '#FCA5A5' },
  statusProcessing: { backgroundColor: '#FDE047' },
  statusChipText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: '#22C55E', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#DC2626', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  error: { fontSize: 14, color: '#DC2626' },
});
