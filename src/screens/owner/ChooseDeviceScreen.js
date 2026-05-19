import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEVICES = [
  { key: 'SMART_PHONE', label: 'Smart Phone', image: 'https://dummyassets.local/devices/smartphone.png' },
  { key: 'TAB', label: 'Tab', image: 'https://dummyassets.local/devices/tablet.png' },
  { key: 'LAPTOP', label: 'Laptop', image: 'https://dummyassets.local/devices/laptop.png' },
  { key: 'SMART_WATCH', label: 'Smart Watch', image: 'https://dummyassets.local/devices/watch.png' },
  { key: 'AIRPODS', label: 'Airpods', image: 'https://dummyassets.local/devices/airpods.png' },
  { key: 'SPEAKERS', label: 'speakers', image: 'https://dummyassets.local/devices/speakers.png' },
];

export default function ChooseDeviceScreen({ route, navigation }) {
  const { customer } = route.params || {};

  const go = (deviceType) => {
    navigation.navigate('SelectDeviceBrand', { customer, deviceType });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose a Device</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.grid}>
        {DEVICES.map((d) => (
          <TouchableOpacity key={d.key} style={styles.tile} onPress={() => go(d.key)} activeOpacity={0.85}>
            <Image source={{ uri: d.image }} style={styles.tileImg} />
            <Text style={styles.tileText}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  tileImg: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 8 },
  tileText: { fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center' },
});
