import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ticketApi } from '../../api/client';

export default function DeviceInformationScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const complaint = ticket?.issueDescription || 'Phone Display is full Damage, Battery is full low Charging and fast down change';

  const handleSubmit = () => {
    navigation.navigate('BookingSummary', { ticketId });
  };

  const handlePhotoPress = () => {
    Alert.alert('Info', 'Photo capture will be implemented later.');
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
          <Text style={styles.sectionTitle}>Complaint Issue</Text>
          <Text style={styles.bodyText}>{complaint}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Estimated Approximate Time</Text>
          <Text style={styles.bodyText}>Sat, Dec 27-2025 6.30PM, 2Hr</Text>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Estimated Delivery Date</Text>
          <Text style={styles.bodyText}>Sat, Dec 27 2025 8.30 PM</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Photos</Text>
          <View style={styles.photosRow}>
            <PhotoBox label="Front Side" onPress={handlePhotoPress} />
            <PhotoBox label="Back Side" onPress={handlePhotoPress} />
            <PhotoBox label="Full Coverage Video" onPress={handlePhotoPress} />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function PhotoBox({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.photoBox} onPress={onPress}>
      <Image
        source={{ uri: 'https://dummyassets.local/device-photos/placeholder.png' }}
        style={styles.photoImage}
      />
      <Text style={styles.photoLabel}>{label}</Text>
      <Text style={styles.photoHint}>Take a photo of the device</Text>
    </TouchableOpacity>
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
  bodyText: { fontSize: 12, color: '#4B5563' },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  photoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  photoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#E5E7EB',
  },
  photoLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
  photoHint: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  button: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  error: { fontSize: 13, color: '#DC2626', marginBottom: 8 },
});

