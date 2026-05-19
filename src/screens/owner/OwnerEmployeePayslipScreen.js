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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function OwnerEmployeePayslipScreen({ route, navigation }) {
  const { employee, month: routeMonth, year: routeYear } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const month = routeMonth ?? new Date().getMonth() + 1;
  const year = routeYear ?? new Date().getFullYear();

  const load = useCallback(async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/payslips/${month}/${year}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
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

  const periodStart = data?.periodStart ? formatDate(data.periodStart) : '—';
  const periodEnd = data?.periodEnd ? formatDate(data.periodEnd) : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Ionicons name="calendar-outline" size={20} color="#374151" />
              <Text style={styles.monthTitle}>{MONTHS[month - 1]} {year}</Text>
            </View>
            <Text style={styles.periodText}>{periodStart} - {periodEnd}</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#3B4FD7" style={{ marginVertical: 24 }} />
          ) : data ? (
            <>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                  <Text style={styles.rowLabel}>Present : {data.presentDays ?? 0} Days</Text>
                </View>
                <Text style={styles.rowRight}>Daily Wage : {data.dailyWageDays ?? 0} Days</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="cash-outline" size={20} color="#22C55E" />
                  <Text style={styles.rowLabel}>Regular Salary : ₹ {data.regularSalary ?? '0'}</Text>
                </View>
                <Text style={styles.rowRight}>Regular Wage : ₹ {data.regularWage ?? '0'}</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="wallet-outline" size={20} color="#22C55E" />
                  <Text style={styles.rowLabel}>Net Salary : ₹ {data.netSalary ?? '0'}</Text>
                </View>
                <Text style={styles.rowRight}>Net Wage : ₹ {data.netWage ?? '0'}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.empty}>No payslip data for this month.</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  periodText: { fontSize: 12, color: '#6B7280' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 14, color: '#374151' },
  rowRight: { fontSize: 13, color: '#6B7280' },
  empty: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  error: { fontSize: 14, color: '#DC2626' },
});
