import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SchedulePickupScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Schedule Pickup</Text>
      <Text style={styles.hint}>POST /pickups with ticketId, customerId, type (PICKUP|DELIVERY), scheduledSlot. Data from API.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#202124', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#9AA0A6' },
});
