import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRamOptions, useStorageOptions } from '../../api/hooks/useMasterData';
import { ApiPicker } from '../../components/ApiPicker';

export default function DeviceColorStorageScreen({ route, navigation }) {
  const { customer, deviceType, brand, model } = route.params || {};
  const [color, setColor] = useState('Silver Shadow');
  const [ramOptionId, setRamOptionId] = useState(null);
  const [storageOptionId, setStorageOptionId] = useState(null);

  const { ramOptions } = useRamOptions();
  const { storageOptions } = useStorageOptions();

  const handleContinue = () => {
    const ram = ramOptions.find((r) => r.id === ramOptionId);
    const storage = storageOptions.find((s) => s.id === storageOptionId);
    navigation.navigate('DeviceServices', {
      customer,
      deviceType,
      brand,
      model,
      color,
      ramOptionId,
      storageOptionId,
      ramLabel: ram?.valueGb != null ? `${ram.valueGb}GB` : ram?.label,
      storageLabel: storage?.valueGb != null ? `${storage.valueGb}GB` : storage?.label,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Device Color and Storage</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Device Model</Text>
        <View style={styles.modelRow}>
          <Text style={styles.modelText}>{model?.name || 'Galaxy Z Fold7'}</Text>
          <View style={styles.modelPlaceholder} />
        </View>

        <Text style={styles.label}>Model Color</Text>
        <TextInput
          style={styles.input}
          placeholder="Color"
          placeholderTextColor="#9CA3AF"
          value={color}
          onChangeText={setColor}
        />

        <Text style={styles.label}>Storage Details</Text>
        <View style={styles.storageRow}>
          <Ionicons name="hardware-chip-outline" size={18} color="#4B5563" style={styles.storageIcon} />
          <Text style={styles.storageLabel}>RAM</Text>
          <View style={styles.pickerWrap}>
            <ApiPicker
              items={ramOptions}
              value={ramOptionId}
              onSelect={setRamOptionId}
              placeholder="Select"
              labelExtractor={(i) => (i?.valueGb != null ? `${i.valueGb}GB` : i?.label || i?.id)}
            />
          </View>
        </View>
        <View style={styles.storageRow}>
          <Ionicons name="server-outline" size={18} color="#4B5563" style={styles.storageIcon} />
          <Text style={styles.storageLabel}>Storage</Text>
          <View style={styles.pickerWrap}>
            <ApiPicker
              items={storageOptions}
              value={storageOptionId}
              onSelect={setStorageOptionId}
              placeholder="Select"
              labelExtractor={(i) => (i?.valueGb != null ? `${i.valueGb}GB` : i?.label || i?.id)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  label: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6, marginTop: 10 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  modelText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  modelPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E5E7EB' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111827',
  },
  storageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  storageIcon: { marginRight: 8 },
  storageLabel: { flex: 0.3, fontSize: 13, color: '#111827' },
  pickerWrap: { flex: 1 },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1B5A',
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
  },
  continueText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
