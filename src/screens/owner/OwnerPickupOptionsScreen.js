import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OwnerPickupOptionsScreen() {
  const [fromTime, setFromTime] = useState('01:00 PM');
  const [toTime, setToTime] = useState('07:00 PM');
  const [distanceKm, setDistanceKm] = useState('05 KM');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Basic Pickup Schedule Time’s</Text>

          <Field label="From Time" value={fromTime} onChangeText={setFromTime} />
          <Field label="To Time" value={toTime} onChangeText={setToTime} />
          <Field
            label="Pickup Distance (KM)"
            value={distanceKm}
            onChangeText={setDistanceKm}
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
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
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

