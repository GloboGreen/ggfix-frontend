import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useModels } from '../../api/hooks/useMasterData';
import { getMasterImageSource } from '../../api/masterDataImages';

export default function SelectDeviceModelScreen({ route, navigation }) {
  const { customer, deviceType, brand } = route.params || {};
  const { models, loading } = useModels(brand?.id);

  const onSelect = (model) => {
    navigation.navigate('DeviceColorStorage', { customer, deviceType, brand, model });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Device Model</Text>
        <View style={{ width: 36 }} />
      </View>
      {brand?.name ? (
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{brand.name} Series</Text>
            <Ionicons name="close" size={14} color="#4B5563" />
          </View>
        </View>
      ) : null}
      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelect(item)} activeOpacity={0.85}>
            <Image source={getMasterImageSource(item)} style={styles.modelImg} />
            <Text style={styles.modelName} numberOfLines={2}>{item.name || 'Model'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No models</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  chipRow: { paddingHorizontal: 16, marginBottom: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#3B82F6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  chipText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  grid: { padding: 16, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center' },
  modelImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 8 },
  modelName: { fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 24 },
});
