import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OwnerLeaveRequestsScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ticketApi.get('/technicians/leaves/pending');
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleApprove = async (item) => {
    setActionId(item.id);
    try {
      await ticketApi.patch(`/technicians/${item.technicianId}/leaves/${item.id}`, { body: { status: 'APPROVED' } });
      load(true);
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Failed to approve');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (item) => {
    setActionId(item.id);
    try {
      await ticketApi.patch(`/technicians/${item.technicianId}/leaves/${item.id}`, { body: { status: 'REJECTED' } });
      load(true);
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Failed to reject');
    } finally {
      setActionId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={['#5090C1']} />}
      >
        <Text style={styles.title}>Pending leave requests</Text>
        <Text style={styles.subtitle}>Approve or deny requests from your employees.</Text>
        {loading && list.length === 0 ? (
          <ActivityIndicator size="large" color="#5090C1" style={styles.loader} />
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#7D7D7D" />
            <Text style={styles.emptyText}>No pending leave requests</Text>
          </View>
        ) : (
          list.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.techName}>{item.technicianName ?? 'Employee'}</Text>
              <Text style={styles.dates}>{formatDate(item.startDate)} – {formatDate(item.endDate)}</Text>
              {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
              <Text style={styles.meta}>{item.appliedDaysLabel ?? ''}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.approveBtn, actionId === item.id && styles.btnDisabled]}
                  onPress={() => handleApprove(item)}
                  disabled={actionId != null}
                >
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, actionId === item.id && styles.btnDisabled]}
                  onPress={() => handleReject(item)}
                  disabled={actionId != null}
                >
                  <Text style={styles.rejectBtnText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7D7D7D', marginBottom: 16 },
  loader: { marginVertical: 24 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#7D7D7D', marginTop: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E9ED' },
  techName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  dates: { fontSize: 14, color: '#7D7D7D', marginTop: 4 },
  reason: { fontSize: 13, color: '#1A1A1A', marginTop: 6 },
  meta: { fontSize: 12, color: '#7D7D7D', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  approveBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#22C55E', alignItems: 'center' },
  rejectBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  approveBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
