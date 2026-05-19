import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
  {
    status: 'Service Accepted',
    time: 'Sat, 31st Jan ’26 - 6:30pm',
    description: 'Your Booking has been placed',
    color: '#22C55E',
  },
  {
    status: 'In Service Process',
    time: 'Sat, 31st Jan ’26 - 7:00pm',
    description: 'Technician Work Started',
    color: '#0EA5E9',
  },
  {
    status: 'Re-Estimated Confirmed',
    time: 'Mon, 2nd Feb ’26 - 10:00am',
    description: 'Re-Booking has been placed',
    color: '#6366F1',
  },
  {
    status: 'Pending',
    time: 'Mon, 2nd Feb ’26 - 11:00am',
    description: 'Waiting for spare part - not available.',
    color: '#F97316',
  },
  {
    status: 'In Service Process',
    time: 'Tues, 3rd Feb ’26 - 10:00am',
    description: 'Technician work completed',
    color: '#0EA5E9',
  },
  {
    status: 'Out For Delivery',
    time: 'Tues, 3rd Feb ’26 - 12:00pm',
    description: 'Your device is out for delivery.',
    color: '#22C55E',
  },
  {
    status: 'Delivered',
    time: 'Tues, 3rd Feb ’26 - 4:00pm',
    description: 'Your device has been delivered.',
    color: '#22C55E',
  },
];

export default function BookingTimelineScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.header}>Tracking ID : TXN-789123456</Text>
        <View style={styles.timeline}>
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <View key={step.status + index} style={styles.stepRow}>
                <View style={styles.markerCol}>
                  <View style={[styles.dot, { borderColor: step.color, backgroundColor: '#FFFFFF' }]}>
                    <View style={[styles.dotInner, { backgroundColor: step.color }]} />
                  </View>
                  {!isLast && <View style={[styles.connector, { borderColor: '#E5E7EB' }]} />}
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.status, { color: step.color }]}>{step.status}</Text>
                  <Text style={styles.time}>{step.time}</Text>
                  <Text style={styles.desc}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 },
  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  markerCol: {
    width: 32,
    alignItems: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connector: {
    flex: 1,
    borderLeftWidth: 1,
    marginTop: 2,
    marginBottom: -2,
  },
  textCol: { flex: 1, paddingRight: 8 },
  status: { fontSize: 13, fontWeight: '700' },
  time: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  desc: { fontSize: 12, color: '#111827', marginTop: 2 },
});

