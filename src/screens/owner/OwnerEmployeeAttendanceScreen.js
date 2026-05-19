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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function OwnerEmployeeAttendanceScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!employee?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/attendance`, {
        query: { month, year },
      });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id, month, year]);

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
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Attendance overview</Text>
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
          {loading && !data ? (
            <ActivityIndicator size="large" color="#3B4FD7" style={{ marginVertical: 24 }} />
          ) : data ? (
            <>
              <View style={styles.statsRow}>
                <View style={[styles.statCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.statValue}>{data.presentDays ?? 0}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={[styles.statCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.statValue}>{data.lateHours ?? '0'} Hrs</Text>
                  <Text style={styles.statLabel}>Late</Text>
                </View>
                <View style={[styles.statCircle, { backgroundColor: '#FED7AA' }]}>
                  <Text style={styles.statValue}>{data.permissionCount ?? 0}</Text>
                  <Text style={styles.statLabel}>Permission</Text>
                </View>
                <View style={[styles.statCircle, { backgroundColor: '#E9D5FF' }]}>
                  <Text style={styles.statValue}>{data.leaveDays ?? 0}</Text>
                  <Text style={styles.statLabel}>Leaves</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.dailyReportRow} onPress={() => {}}>
                <Text style={styles.dailyReportLabel}>Daily Attendance Report</Text>
                <Text style={styles.dailyReportLink}>Click here</Text>
              </TouchableOpacity>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#E9D5FF' }]} /><Text style={styles.legendText}>Leave</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FDE047' }]} /><Text style={styles.legendText}>Late</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FDBA74' }]} /><Text style={styles.legendText}>Permission</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} /><Text style={styles.legendText}>Week off</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#86EFAC' }]} /><Text style={styles.legendText}>Holiday</Text></View>
              </View>
              <Text style={styles.subSectionTitle}>Daily attendance</Text>
              {(data.dailyRecords && data.dailyRecords.length > 0) ? (
                data.dailyRecords.map((day) => (
                  <View key={day.date} style={[styles.dayCard, day.status === 'LEAVE' && styles.dayCardLeave, day.status === 'WEEK_OFF' && styles.dayCardWeekOff]}>
                    <Text style={styles.dayDate}>{day.dayLabel}, {day.date}</Text>
                    {day.status === 'LEAVE' || day.status === 'WEEK_OFF' ? (
                      <View style={[styles.badge, day.status === 'LEAVE' ? styles.badgeLeave : styles.badgeWeekOff]}>
                        <Text style={styles.badgeText}>{day.status === 'LEAVE' ? 'Leave' : 'Week off'}</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.dayMeta}>Check In: {day.checkInTime || '—'}</Text>
                        <Text style={styles.dayMeta}>Check Out: {day.checkOutTime || '—'}</Text>
                        <Text style={styles.dayMeta}>Working: {day.workingHours || '—'}</Text>
                        {day.notes ? <Text style={styles.dayNotes}>{day.notes}</Text> : null}
                      </>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>No attendance records for this month.</Text>
              )}
            </>
          ) : null}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  monthYearRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthYearText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  dailyReportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 8 },
  dailyReportLabel: { fontSize: 14, color: '#374151' },
  dailyReportLink: { fontSize: 14, color: '#EC4899', fontWeight: '600' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#6B7280' },
  subSectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  dayCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 8 },
  dayCardLeave: { backgroundColor: '#FEE2E2' },
  dayCardWeekOff: { backgroundColor: '#FCE7F3' },
  dayDate: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dayMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  dayNotes: { fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
  badge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeLeave: { backgroundColor: '#FCA5A5' },
  badgeWeekOff: { backgroundColor: '#F9A8D4' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  empty: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  error: { fontSize: 14, color: '#DC2626' },
});
