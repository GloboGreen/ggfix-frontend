import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ticketApi } from '../../api/client';

export default function OwnerEmployeeApplyLeaveScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!startDate?.trim() || !endDate?.trim()) {
      Alert.alert('Required', 'Enter start and end date (YYYY-MM-DD)');
      return;
    }
    if (!employee?.id) return;
    setSaving(true);
    try {
      await ticketApi.post(`/technicians/${employee.id}/leaves`, {
        body: { startDate: startDate.trim(), endDate: endDate.trim(), reason: reason.trim() || undefined },
      });
      Alert.alert('Done', 'Leave request submitted', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit leave');
    } finally {
      setSaving(false);
    }
  };

  if (!employee) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><Text style={styles.error}>Employee not found</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.label}>Start date (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} placeholder="e.g. 2026-02-01" value={startDate} onChangeText={setStartDate} />
        <Text style={styles.label}>End date (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} placeholder="e.g. 2026-02-01" value={endDate} onChangeText={setEndDate} />
        <Text style={styles.label}>Reason</Text>
        <TextInput style={[styles.input, styles.notesInput]} placeholder="e.g. Personal work" value={reason} onChangeText={setReason} />
        <TouchableOpacity style={[styles.btn, saving && styles.btnDisabled]} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Submit leave request</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#FFF' },
  notesInput: { minHeight: 60 },
  btn: { marginTop: 20, backgroundColor: '#3B4FD7', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  error: { fontSize: 14, color: '#DC2626' },
});
