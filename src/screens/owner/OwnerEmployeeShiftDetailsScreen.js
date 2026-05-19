import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(t) {
  if (!t) return '—';
  const s = typeof t === 'string' ? t : '';
  return s.slice(0, 5) || '—';
}

export default function OwnerEmployeeShiftDetailsScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDay = useCallback(async (dateStr) => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/attendance/day`, {
        query: { date: dateStr },
      });
      setDayData(res);
    } catch {
      setDayData(null);
    } finally {
      setLoading(false);
    }
  }, [employee?.id]);

  React.useEffect(() => {
    loadDay(selectedDate);
  }, [selectedDate, loadDay]);

  const d = new Date(selectedDate);
  const dayName = DAYS[d.getDay()];
  const monthYear = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(weekStart);
    x.setDate(weekStart.getDate() + i);
    return x.toISOString().slice(0, 10);
  });

  if (!employee) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><Text style={styles.error}>Employee not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateDay}>{d.getDate()}</Text>
          <Text style={styles.dateLabel}>{dayName}</Text>
          <Text style={styles.dateMonth}>{monthYear}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip}>
          {weekDays.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const dt = new Date(dateStr);
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.weekDay, isSelected && styles.weekDaySelected, isToday && !isSelected && styles.weekDayToday]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[styles.weekDayName, isSelected && styles.weekDayTextSelected]}>{DAYS[dt.getDay()].slice(0, 3)}</Text>
                <Text style={[styles.weekDayNum, isSelected && styles.weekDayTextSelected]}>{dt.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.todayBtn} onPress={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#3B4FD7" style={{ marginVertical: 24 }} />
          ) : dayData ? (
            <View style={styles.scheduleRow}>
              <View style={styles.timeBlock}>
                <Ionicons name="log-in-outline" size={20} color="#22C55E" />
                <Text style={styles.timeLabel}>Check-in</Text>
                <Text style={styles.timeValue}>{formatTime(dayData.checkInTime)}</Text>
              </View>
              <View style={styles.timeBlock}>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={styles.timeLabel}>Check-out</Text>
                <Text style={[styles.timeValue, { color: '#DC2626' }]}>{formatTime(dayData.checkOutTime)}</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>Working</Text>
                <Text style={styles.timeValue}>{dayData.workingHours || '—'}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.empty}>No attendance recorded for this day.</Text>
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
  dateHeader: { alignItems: 'center', marginBottom: 12 },
  dateDay: { fontSize: 36, fontWeight: '700', color: '#111827' },
  dateLabel: { fontSize: 14, color: '#6B7280' },
  dateMonth: { fontSize: 14, color: '#6B7280' },
  weekStrip: { marginVertical: 8 },
  weekDay: { width: 56, paddingVertical: 10, alignItems: 'center', marginRight: 8, borderRadius: 12, backgroundColor: '#FFFFFF' },
  weekDaySelected: { backgroundColor: '#22C55E' },
  weekDayToday: { borderWidth: 2, borderColor: '#22C55E' },
  weekDayName: { fontSize: 12, color: '#6B7280' },
  weekDayNum: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 4 },
  weekDayTextSelected: { color: '#FFFFFF' },
  todayBtn: { alignSelf: 'flex-end', backgroundColor: '#22C55E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  todayBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  scheduleRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  timeBlock: { flex: 1, minWidth: 90, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  timeLabel: { fontSize: 12, color: '#6B7280' },
  timeValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 4 },
  empty: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  error: { fontSize: 14, color: '#DC2626' },
});
