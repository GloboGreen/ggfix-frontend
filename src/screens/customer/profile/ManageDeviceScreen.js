import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../theme/colors';
import { PrimaryButton, OutlineButton, DangerButton, Empty, Loader } from '../../../components/ui';
import { confirm, notify } from '../../../components/confirm';
import { listSavedDevices, deleteSavedDevice, setDefaultSavedDevice } from '../../../api/customer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: '#1F2937', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, fontWeight: '600' },
  body: { flexDirection: 'row', marginTop: 8 },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: '#E5E7EB' },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  spec: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  note: { fontSize: 12, color: '#DC2626', marginTop: 8 },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
});

export default function ManageDeviceScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await listSavedDevices();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onDelete = async (id) => {
    const ok = await confirm({ title: 'Delete', message: 'Are you sure you want to delete the Device?', confirmText: 'Yes', cancelText: 'No', destructive: true });
    if (!ok) return;
    try { await deleteSavedDevice(id); load(); } catch (e) { notify('Error', e.message); }
  };

  const onDefault = async (id) => {
    try { await setDefaultSavedDevice(id); load(); } catch (e) { notify('Error', e.message); }
  };

  const onAdd = () => navigation.navigate('SelectCategory', { flow: 'PROFILE' });
  const onEdit = (d) => navigation.navigate('SelectVariant', {
    flow: 'PROFILE',
    deviceId: d.id,
    brandId: d.brandId,
    modelId: d.modelId,
    ramOptionId: d.ramOptionId,
    storageOptionId: d.storageOptionId,
    color: d.color,
    imei: d.imei,
    note: d.note,
    modelName: d.modelName,
  });

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <PrimaryButton title="+ ADD DEVICE" onPress={onAdd} />
      </View>
      <ScrollView contentContainerStyle={styles.inner}>
        {items.length === 0 ? (
          <Empty text="No saved devices yet" />
        ) : items.map((d, idx) => (
          <View key={d.id} style={styles.card}>
            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => onDefault(d.id)}>
                <Ionicons name={d.isDefault ? 'radio-button-on' : 'radio-button-off'} size={22} color={d.isDefault ? '#16A34A' : colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.badge}>Device {idx + 1}</Text>
            </View>
            <View style={styles.body}>
              <View style={styles.info}>
                <Text style={styles.name}>{d.modelName || 'Device'}</Text>
                {d.color ? <Text style={styles.spec}>Color: {d.color}</Text> : null}
                {(d.ramLabel || d.storageLabel) ? <Text style={styles.spec}>Storage: {d.ramLabel || ''} {d.storageLabel ? `/ ${d.storageLabel}` : ''}</Text> : null}
              </View>
              <View style={styles.thumb} />
            </View>
            <Text style={styles.note}>Notes: Modify only the color storage configuration*</Text>
            <View style={styles.actionsRow}>
              <OutlineButton title="Edit" style={{ flex: 1, marginRight: 6, paddingVertical: 8 }} onPress={() => onEdit(d)} />
              <DangerButton title="Delete" style={{ flex: 1, marginLeft: 6, paddingVertical: 8 }} onPress={() => onDelete(d.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
