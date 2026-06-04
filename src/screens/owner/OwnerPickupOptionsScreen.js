import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../api/client';
import { fetchMe } from '../../api/auth';
import { getSession } from '../../auth/session';

export default function OwnerPickupOptionsScreen({ navigation }) {
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const session = (await fetchMe().catch(() => null)) || (await getSession());
        const shop = session?.activeShop;
        if (shop) {
          setShopId(shop.id);
          setShopName(shop.name || '');
          setFromTime(shop.pickupFromTime || '01:00 PM');
          setToTime(shop.pickupToTime || '07:00 PM');
          setDistanceKm(shop.pickupDistanceKm != null ? String(shop.pickupDistanceKm) : '20');
          setPickupEnabled(shop.pickupEnabled !== false);
        }
        setOwnerId(session?.userId);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!ownerId || !shopId) {
      Alert.alert('Cannot save', 'Active shop not loaded yet. Please try again.');
      return;
    }
    const km = parseInt(String(distanceKm).replace(/[^0-9]/g, ''), 10);
    if (!fromTime.trim() || !toTime.trim() || !Number.isFinite(km) || km <= 0) {
      Alert.alert('Missing details', 'Please fill From Time, To Time and a valid Pickup Distance in km.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.patch(`/auth/shop-owners/${ownerId}/locations/${shopId}`, {
        body: {
          pickupFromTime: fromTime.trim(),
          pickupToTime: toTime.trim(),
          pickupDistanceKm: km,
          pickupEnabled,
        },
      });
      Alert.alert('Saved', 'Pickup schedule updated for this shop.', [
        { text: 'OK', onPress: () => navigation?.goBack?.() },
      ]);
    } catch (e) {
      Alert.alert('Save failed', e?.body?.message || e?.message || 'Could not save pickup options.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} color="#16A34A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        {shopName ? <Text style={styles.shopLabel}>Editing schedule for {shopName}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.title}>Basic Pickup Schedule Time’s</Text>

          <Field label="From Time" value={fromTime} onChangeText={setFromTime} placeholder="01:00 PM" />
          <Field label="To Time" value={toTime} onChangeText={setToTime} placeholder="07:00 PM" />
          <Field
            label="Pickup Distance (KM)"
            value={distanceKm}
            onChangeText={setDistanceKm}
            keyboardType="number-pad"
            placeholder="20"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Accept pickup requests</Text>
            <Switch value={pickupEnabled} onValueChange={setPickupEnabled} trackColor={{ false: '#D1D5DB', true: '#16A34A' }} />
          </View>
          <Text style={styles.hint}>
            When ON, customers within {distanceKm || '?'} km can request pickup between {fromTime || '?'} and {toTime || '?'}.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { flex: 1, padding: 16, paddingBottom: 32 },
  shopLabel: { fontSize: 12, color: '#1E3A8A', fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  hint: { fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 15 },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
