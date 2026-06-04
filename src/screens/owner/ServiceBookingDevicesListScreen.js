import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

export default function ServiceBookingDevicesListScreen({ route, navigation }) {
  const { customer, devices: initialDevices } = route.params || {};
  const [devices, setDevices] = useState(initialDevices || []);
  const [submitting, setSubmitting] = useState(false);

  const addMoreDevice = () => {
    navigation.navigate('ChooseDevice', { customer });
  };

  const totalAmount = devices.reduce((sum, d) => sum + (d.total || 0), 0);
  const deviceSummary = devices.map((d) => d.deviceDisplayName || d.model?.name).join(', ');
  const servicesSummary = devices.map((d) => d.repairServicesSummary).filter(Boolean).join('; ');

  const handleSubmit = async () => {
    if (!customer?.id) {
      Alert.alert('Error', 'Customer is required');
      return;
    }
    setSubmitting(true);
    try {
      const first = devices[0];
      const payload = {
        customerId: customer.id,
        brandId: first?.brand?.id,
        modelId: first?.model?.id,
        ramOptionId: first?.ramOptionId,
        storageOptionId: first?.storageOptionId,
        color: first?.color || 'Silver Shadow',
        imei: first?.imei || undefined,
        issueDescription: first?.issueDescription || 'Repair booking from new flow',
        estimatedPrice: totalAmount,
        deviceDisplayName: first?.deviceDisplayName,
        deviceImageUrl: first?.deviceImageUrl,
        repairServicesSummary: servicesSummary || first?.repairServicesSummary,
        priceItemsJson: JSON.stringify(first?.priceItems || []),
        customerApproval: false,
        estimatedReadyAt: first?.estimatedReadyAt || undefined,
        estimatedDeliveryAt: first?.estimatedDeliveryAt || undefined,
      };
      const res = await ticketApi.post('/tickets', { body: payload });
      const ticketId = res?.id;
      navigation.navigate('BookingSummary', {
        ticketId,
        customer,
        devices,
        trackingId: res?.trackingId,
        estimatedPrice: totalAmount,
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Service Booking Devices List</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {devices.map((d, idx) => (
          <View key={idx} style={styles.deviceCard}>
            <Image source={{ uri: d.deviceImageUrl }} style={styles.thumb} />
            <View style={styles.deviceMeta}>
              <Text style={styles.deviceName}>{d.deviceDisplayName || d.model?.name}</Text>
              <Text style={styles.servicesText}>{d.repairServicesSummary}</Text>
              <Text style={styles.priceText}>₹{(d.total || 0).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreBtn} onPress={addMoreDevice}>
          <Ionicons name="add-circle-outline" size={22} color="#3B4FD7" />
          <Text style={styles.addMoreText}>Add More Device</Text>
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitText}>Submit</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 28 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  thumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E5E7EB' },
  deviceMeta: { marginLeft: 12, flex: 1 },
  deviceName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  servicesText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  priceText: { fontSize: 13, fontWeight: '700', color: '#16A34A', marginTop: 4 },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  addMoreText: { fontSize: 14, fontWeight: '700', color: '#3B4FD7' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 16, fontWeight: '700', color: '#16A34A' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
