import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ticketApi } from '../../api/client';

export default function EditBookingScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [approxDate, setApproxDate] = useState('Sat, Dec 27 2025');
  const [approxTime, setApproxTime] = useState('6.30 PM');
  const [approxDuration, setApproxDuration] = useState('2 Hr');
  const [deliveryDate, setDeliveryDate] = useState('Sat, Dec 27 2025 8.30 PM');
  const [approved, setApproved] = useState(true);

  const load = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.get(`/tickets/${ticketId}`);
      setTicket(data);
      if (data?.imei) setImei(String(data.imei));
      if (data?.issueDescription) setNotes(data.issueDescription);
    } catch (e) {
      setError(e.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && !ticket) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  const lineItems =
    ticket?.priceItems || [
      { id: '1', label: 'Display Screen Combo', amount: 5000 },
      { id: '2', label: 'Motherboard', amount: 5000 },
      { id: '3', label: 'Battery', amount: 2500 },
    ];
  const estimatedTotal =
    ticket?.estimatedPrice != null
      ? ticket.estimatedPrice
      : lineItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  const handleContinue = () => {
    navigation.navigate('DeviceInformation', {
      ticketId,
    });
  };

  const handleGoMissingParts = () => {
    navigation.navigate('DeviceMissingParts', { ticketId });
  };

  const handleGoSecurity = () => {
    navigation.navigate('DeviceSecurity', { ticketId });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          {lineItems.map((item, index) => (
            <View key={item.id || index} style={styles.priceRow}>
              <View style={styles.priceIndexWrap}>
                <Text style={styles.priceIndex}>{index + 1}</Text>
              </View>
              <Text style={styles.priceLabel}>{item.label}</Text>
              <Text style={styles.priceAmount}>₹{item.amount?.toLocaleString?.('en-IN') ?? item.amount}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Repair Amount</Text>
            <Text style={styles.totalAmount}>₹{estimatedTotal?.toLocaleString?.('en-IN') ?? estimatedTotal}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>IMEI Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter IMEI number or scan"
            placeholderTextColor="#9CA3AF"
            value={imei}
            onChangeText={setImei}
            keyboardType="number-pad"
          />

          <Text style={styles.sectionTitle}>Complaint Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your issue"
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Text style={styles.sectionTitle}>Estimated Approximate Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Date"
            placeholderTextColor="#9CA3AF"
            value={approxDate}
            onChangeText={setApproxDate}
          />
          <View style={styles.row2}>
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Time"
              placeholderTextColor="#9CA3AF"
              value={approxTime}
              onChangeText={setApproxTime}
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Duration"
              placeholderTextColor="#9CA3AF"
              value={approxDuration}
              onChangeText={setApproxDuration}
            />
          </View>

          <Text style={styles.sectionTitle}>Estimated Delivery Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Delivery date/time"
            placeholderTextColor="#9CA3AF"
            value={deliveryDate}
            onChangeText={setDeliveryDate}
          />

          <TouchableOpacity
            style={[styles.approvalRow, approved && styles.approvalRowActive]}
            onPress={() => setApproved((v) => !v)}
          >
            <View style={[styles.checkbox, approved && styles.checkboxActive]} />
            <Text style={styles.approvalLabel}>Customer Repair Approval</Text>
          </TouchableOpacity>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={handleGoMissingParts}>
              <Text style={styles.linkText}>Device Missing / Damage Parts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoSecurity}>
              <Text style={styles.linkText}>Device Security</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceIndexWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  priceIndex: { fontSize: 11, color: '#4B5563' },
  priceLabel: { flex: 1, fontSize: 12, color: '#111827' },
  priceAmount: { fontSize: 12, color: '#111827', fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  totalLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
  totalAmount: { fontSize: 12, fontWeight: '700', color: '#111827' },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row2: { flexDirection: 'row', gap: 8 },
  rowInput: { flex: 1 },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
  },
  approvalRowActive: {
    opacity: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  approvalLabel: { fontSize: 12, color: '#111827' },
  linksRow: {
    marginTop: 8,
    gap: 4,
  },
  linkText: { fontSize: 12, color: '#2563EB' },
  button: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  error: { fontSize: 13, color: '#DC2626', marginBottom: 8 },
});

