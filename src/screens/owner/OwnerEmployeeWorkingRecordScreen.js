import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OwnerEmployeeWorkingRecordScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!employee?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/experiences`);
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id]);

  React.useEffect(() => {
    load();
  }, [load]);

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
        <View style={styles.bar}>
          <Text style={styles.barText}>Experience's</Text>
        </View>
        {loading && list.length === 0 ? (
          <ActivityIndicator size="large" color="#3B4FD7" style={{ marginVertical: 24 }} />
        ) : list.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>No work record yet.</Text>
          </View>
        ) : (
          list.map((exp) => (
            <View key={exp.id} style={styles.expCard}>
              <View style={styles.expHeader}>
                <View style={styles.shopThumb} />
                <View style={styles.expMeta}>
                  <View style={styles.expRow}><Ionicons name="business-outline" size={16} color="#6B7280" /><Text style={styles.expText}>Shop: {exp.shopName || '—'}</Text></View>
                  {exp.location ? <View style={styles.expRow}><Ionicons name="location-outline" size={16} color="#6B7280" /><Text style={styles.expText}>Location: {exp.location}</Text></View> : null}
                  <View style={styles.expRow}><Ionicons name="calendar-outline" size={16} color="#6B7280" /><Text style={styles.expText}>Join: {formatDate(exp.joinDate)}</Text></View>
                  <View style={styles.expRow}><Ionicons name="calendar-outline" size={16} color="#6B7280" /><Text style={[styles.expText, exp.relievingDate ? null : styles.presentText]}>Relieving: {exp.relievingDate ? formatDate(exp.relievingDate) : 'Present'}</Text></View>
                  {exp.workingType ? <View style={styles.expRow}><Ionicons name="briefcase-outline" size={16} color="#6B7280" /><Text style={[styles.expText, styles.workingType]}>{exp.workingType}</Text></View> : null}
                  {exp.lastSalary ? <View style={styles.expRow}><Ionicons name="cash-outline" size={16} color="#6B7280" /><Text style={styles.expText}>Last Salary: ₹{exp.lastSalary}</Text></View> : null}
                  {exp.totalDuration ? <View style={styles.expRow}><Ionicons name="calendar-outline" size={16} color="#6B7280" /><Text style={styles.expText}>Duration: {exp.totalDuration}</Text></View> : null}
                </View>
              </View>
              {(exp.totalService != null || exp.completedCount != null || exp.returnCount != null) && (
                <View style={styles.statsRow}>
                  {exp.totalService != null && <View style={styles.stat}><Ionicons name="bar-chart-outline" size={16} color="#6B7280" /><Text style={styles.statText}>Total Service: {exp.totalService}</Text></View>}
                  {exp.completedCount != null && <View style={styles.stat}><Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" /><Text style={styles.statText}>Completed: {exp.completedCount}</Text></View>}
                  {exp.returnCount != null && <View style={styles.stat}><Ionicons name="return-down-back-outline" size={16} color="#6B7280" /><Text style={styles.statText}>Return: {exp.returnCount}</Text></View>}
                </View>
              )}
            </View>
          ))
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Back to profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bar: { backgroundColor: '#22C55E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginBottom: 16 },
  barText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  empty: { fontSize: 14, color: '#6B7280' },
  expCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  expHeader: { flexDirection: 'row', gap: 12 },
  shopThumb: { width: 80, height: 60, borderRadius: 8, backgroundColor: '#E5E7EB' },
  expMeta: { flex: 1 },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  expText: { fontSize: 13, color: '#374151' },
  presentText: { color: '#DC2626', fontWeight: '600' },
  workingType: { color: '#22C55E', fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, color: '#6B7280' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3B4FD7', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  error: { fontSize: 14, color: '#DC2626' },
});
