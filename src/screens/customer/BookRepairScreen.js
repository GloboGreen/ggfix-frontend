import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ApiPicker } from '../../components/ApiPicker';
import { useBrands, useModels, useRamOptions, useStorageOptions, useRepairServices } from '../../api/hooks/useMasterData';
import { ticketApi } from '../../api/client';

export default function BookRepairScreen({ navigation }) {
  const [brandId, setBrandId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [ramOptionId, setRamOptionId] = useState(null);
  const [storageOptionId, setStorageOptionId] = useState(null);
  const [repairServiceId, setRepairServiceId] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const { models, loading: modelsLoading, error: modelsError } = useModels(brandId);
  const { ramOptions, loading: ramLoading, error: ramError } = useRamOptions();
  const { storageOptions, loading: storageLoading, error: storageError } = useStorageOptions();
  const { repairServices, loading: servicesLoading, error: servicesError } = useRepairServices();

  const handleBook = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customerId: null,
        brandId: brandId || undefined,
        modelId: modelId || undefined,
        ramOptionId: ramOptionId || undefined,
        storageOptionId: storageOptionId || undefined,
        issueDescription: issueDescription.trim() || undefined,
      };
      const created = await ticketApi.post('/tickets', { body: payload });
      Alert.alert('Booked', `Repair ticket: ${created?.trackingId || created?.id}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to book repair');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Book Repair</Text>
      <Text style={styles.hint}>All dropdowns load from API: GET /master/brands, /master/models, /master/ram-options, /master/storage-options, /master/repair-services</Text>

      <ApiPicker label="Brand" items={brands} loading={brandsLoading} error={brandsError} value={brandId} onSelect={setBrandId} placeholder="Select brand" />
      <ApiPicker label="Model" items={models} loading={modelsLoading} error={modelsError} value={modelId} onSelect={setModelId} placeholder="Select model" />
      <ApiPicker label="RAM" items={ramOptions} loading={ramLoading} error={ramError} value={ramOptionId} onSelect={setRamOptionId} placeholder="Select RAM" labelExtractor={(i) => i?.label ?? i?.valueGb + ' GB'} />
      <ApiPicker label="Storage" items={storageOptions} loading={storageLoading} error={storageError} value={storageOptionId} onSelect={setStorageOptionId} placeholder="Select storage" labelExtractor={(i) => i?.label ?? i?.valueGb + ' GB'} />
      <ApiPicker label="Repair service" items={repairServices} loading={servicesLoading} error={servicesError} value={repairServiceId} onSelect={setRepairServiceId} placeholder="Select service" labelExtractor={(i) => i?.name ?? i?.code} />

      <Text style={styles.label}>Issue description</Text>
      <TextInput style={styles.input} placeholder="Describe the issue" placeholderTextColor="#80868B" value={issueDescription} onChangeText={setIssueDescription} multiline numberOfLines={3} />

      <TouchableOpacity style={styles.button} onPress={handleBook} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Book Repair</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#202124' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  hint: { fontSize: 12, color: '#9AA0A6', marginBottom: 16 },
  label: { fontSize: 14, color: '#9AA0A6', marginBottom: 4 },
  input: { backgroundColor: '#282A2D', borderWidth: 1, borderColor: '#3C4043', borderRadius: 8, padding: 12, fontSize: 16, color: '#F8FAFC', marginBottom: 12, minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#22C55E', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
