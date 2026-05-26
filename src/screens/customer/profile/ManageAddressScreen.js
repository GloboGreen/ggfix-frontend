import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../theme/colors';
import { PrimaryButton, OutlineButton, DangerButton, Empty, Loader } from '../../../components/ui';
import { confirm, notify } from '../../../components/confirm';
import { listAddresses, deleteAddress, setDefaultAddress } from '../../../api/customer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: '#1F2937', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, fontWeight: '600' },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginLeft: 8 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 },
  addr: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
});

export default function ManageAddressScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await listAddresses();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onDelete = async (id) => {
    const ok = await confirm({ title: 'Delete', message: 'Are you sure you want to delete the address?', confirmText: 'Yes', cancelText: 'No', destructive: true });
    if (!ok) return;
    try { await deleteAddress(id); load(); } catch (e) { notify('Error', e.message); }
  };

  const onDefault = async (id) => {
    try { await setDefaultAddress(id); load(); } catch (e) { notify('Error', e.message); }
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <PrimaryButton title="+ ADD ADDRESS" onPress={() => navigation.navigate('AddressForm', {})} />
      </View>
      <ScrollView contentContainerStyle={styles.inner}>
        {items.length === 0 ? (
          <Empty text="No addresses yet. Add one to get started." />
        ) : items.map((a, idx) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.labelRow}>
                <TouchableOpacity onPress={() => onDefault(a.id)}>
                  <Ionicons name={a.isDefault ? 'radio-button-on' : 'radio-button-off'} size={22} color={a.isDefault ? '#16A34A' : colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.label}>{a.label || 'Home'}</Text>
              </View>
              <Text style={styles.badge}>Address {idx + 1}</Text>
            </View>
            <Text style={styles.name}>{a.fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} style={{ marginTop: 2, marginRight: 4 }} />
              <Text style={[styles.addr, { flex: 1 }]}>{[a.addressLine, a.locality, a.city, a.state, a.pincode].filter(Boolean).join(', ')}</Text>
            </View>
            {a.mobile ? (
              <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.addr, { marginLeft: 4 }]}>{a.mobile}</Text>
              </View>
            ) : null}
            <View style={styles.actionsRow}>
              <OutlineButton title="Edit" style={{ flex: 1, marginRight: 6, paddingVertical: 8 }} onPress={() => navigation.navigate('AddressForm', { address: a })} />
              <DangerButton title="Delete" style={{ flex: 1, marginLeft: 6, paddingVertical: 8 }} onPress={() => onDelete(a.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
