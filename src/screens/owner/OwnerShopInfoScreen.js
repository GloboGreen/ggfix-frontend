import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ANDROID_SERVICES = [
  'Screen Repair',
  'Display Replacement',
  'Battery Replacement',
  'Charging Port Repair',
  'Camera Repair',
  'Water Damage Repair',
  'Audio Repair',
  'Button Repair',
  'Software Issues',
  'Data Recovery',
  'Phone Unlocking',
];

const APPLE_SERVICES = ANDROID_SERVICES;

export default function OwnerShopInfoScreen() {
  const [shopName, setShopName] = useState('Green Mobiles');
  const [shopSince, setShopSince] = useState('2015');
  const [addressLine, setAddressLine] = useState('1ST FLOOR, Imperial Road');
  const [city, setCity] = useState('Cuddalore');
  const [district, setDistrict] = useState('Cuddalore');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('607001');

  const [androidSelected, setAndroidSelected] = useState(
    Object.fromEntries(ANDROID_SERVICES.map((s) => [s, true])),
  );
  const [appleSelected, setAppleSelected] = useState(
    Object.fromEntries(APPLE_SERVICES.map((s) => [s, true])),
  );

  const toggleAndroid = (key) =>
    setAndroidSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleApple = (key) =>
    setAppleSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Shop Info</Text>
          <Field label="Shop name" value={shopName} onChangeText={setShopName} />
          <Field label="Shop Since" value={shopSince} onChangeText={setShopSince} keyboardType="number-pad" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Repair Service Categories</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryCol}>
              <Text style={styles.categoryHeader}>Android Repair</Text>
              {ANDROID_SERVICES.map((name) => (
                <ServiceRow
                  key={name}
                  label={name}
                  active={androidSelected[name]}
                  onPress={() => toggleAndroid(name)}
                />
              ))}
            </View>
            <View style={styles.categoryCol}>
              <Text style={[styles.categoryHeader, { backgroundColor: '#16A34A' }]}>
                Apple Repair
              </Text>
              {APPLE_SERVICES.map((name) => (
                <ServiceRow
                  key={name}
                  label={name}
                  active={appleSelected[name]}
                  onPress={() => toggleApple(name)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop Address</Text>
          <Field label="Address" value={addressLine} onChangeText={setAddressLine} />
          <View style={styles.row2}>
            <Field small label="City" value={city} onChangeText={setCity} />
            <Field small label="District" value={district} onChangeText={setDistrict} />
          </View>
          <View style={styles.row2}>
            <Field small label="State" value={state} onChangeText={setState} />
            <Field small label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Shop Photos</Text>
          <View style={styles.photosRow}>
            <PhotoBox label="Shop Front View" />
            <PhotoBox label="Shop Banner or Visiting Card" />
          </View>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Shop details Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, small, ...inputProps }) {
  return (
    <View style={[{ marginBottom: 8 }, small && { flex: 1, marginRight: 8 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
    </View>
  );
}

function ServiceRow({ label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.serviceRow} onPress={onPress}>
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function PhotoBox({ label }) {
  return (
    <TouchableOpacity style={styles.photoBox}>
      <Ionicons name="camera-outline" size={24} color="#4B5563" />
      <Text style={styles.photoLabel}>{label}</Text>
      <Text style={styles.photoHint}>Take a photo of the device front side</Text>
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
  row2: { flexDirection: 'row' },
  categoryRow: { flexDirection: 'row', marginTop: 8 },
  categoryCol: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryHeader: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioOuterActive: { borderColor: '#16A34A' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  serviceLabel: { fontSize: 12, color: '#111827' },
  photosRow: { flexDirection: 'row', marginTop: 6, gap: 8 },
  photoBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  photoLabel: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 4 },
  photoHint: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

