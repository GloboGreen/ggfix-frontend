import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBrands } from '../../api/hooks/useMasterData';
import { getMasterImageSource } from '../../api/masterDataImages';

export default function SelectDeviceBrandScreen({ route, navigation }) {
  const { customer, deviceType } = route.params || {};
  const { brands, loading } = useBrands();
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return brands;
    return brands.filter((b) => (b.name || '').toLowerCase().includes(query));
  }, [brands, q]);

  const onSelect = (brand) => {
    navigation.navigate('SelectDeviceModel', { customer, deviceType, brand });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Device Brand</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search mobile device by brand, model, or series"
          placeholderTextColor="#9CA3AF"
          value={q}
          onChangeText={setQ}
        />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelect(item)} activeOpacity={0.85}>
            <Image source={getMasterImageSource(item)} style={styles.brandImg} />
            <Text style={styles.brandName}>{item.name || 'Brand'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No brands</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 16, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#111827' },
  grid: { padding: 16, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center' },
  brandImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 8 },
  brandName: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 24 },
});
