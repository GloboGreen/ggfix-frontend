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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OwnerEmployeeSalaryReportScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!employee?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ticketApi.get(`/technicians/${employee.id}/payslips`, {
        query: { year },
      });
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id, year]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openPayslip = (month, y) => {
    navigation.navigate('OwnerEmployeePayslip', { employee, month, year: y });
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
            <Text style={styles.sectionTitle}>Financial year</Text>
            <View style={styles.yearRow}>
              <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{year}-{String(year + 1).slice(-2)}</Text>
              <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
                <Ionicons name="chevron-forward" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colSno]}>S.No</Text>
            <Text style={[styles.tableCell, styles.colMonth]}>Month</Text>
            <Text style={[styles.tableCell, styles.colDays]}>Present</Text>
            <Text style={[styles.tableCell, styles.colNet]}>Net Salary</Text>
          </View>
          {loading && list.length === 0 ? (
            <ActivityIndicator size="small" color="#3B4FD7" style={{ marginVertical: 16 }} />
          ) : (
            list.map((row, i) => (
              <TouchableOpacity
                key={`${row.month}-${row.year}`}
                style={styles.tableRow}
                onPress={() => openPayslip(row.month, row.year)}
              >
                <Text style={[styles.tableCell, styles.colSno]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colMonth, styles.link]}>{MONTHS[row.month - 1]} {row.year}</Text>
                <Text style={[styles.tableCell, styles.colDays]}>{row.presentDays ?? 0} Days</Text>
                <Text style={[styles.tableCell, styles.colNet]}>₹ {row.netSalary ?? '0'}</Text>
              </TouchableOpacity>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yearText: { fontSize: 14, color: '#3B4FD7', fontWeight: '600' },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableCell: { fontSize: 13, color: '#374151' },
  colSno: { width: 40 },
  colMonth: { flex: 1 },
  colDays: { width: 70 },
  colNet: { width: 90, fontWeight: '600' },
  link: { color: '#3B4FD7', textDecorationLine: 'underline' },
  error: { fontSize: 14, color: '#DC2626' },
});
