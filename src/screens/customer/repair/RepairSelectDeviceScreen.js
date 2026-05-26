import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../theme/colors';
import { PrimaryButton, OutlineButton, DangerButton, Loader } from '../../../components/ui';
import { confirm, notify } from '../../../components/confirm';
import { listSavedDevices, deleteSavedDevice } from '../../../api/customer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 16 },
  header: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: '#1F2937', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, fontWeight: '600' },
  selectIcon: { },
  body: { flexDirection: 'row', marginTop: 8 },
  thumb: { width: 70, height: 80, borderRadius: 8, backgroundColor: '#E5E7EB', marginLeft: 8 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  spec: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  note: { fontSize: 12, color: '#DC2626', marginTop: 8 },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { paddingHorizontal: 10, color: colors.textSecondary },
});

export default function RepairSelectDeviceScreen({ navigation, route }) {
  const categoryId = route?.params?.categoryId;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await listSavedDevices();
      setItems(list);
      const def = list.find((x) => x.isDefault) || list[0];
      if (def) setSelectedId(def.id);
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const proceed = (d) => navigation.navigate('RepairSelectService', { device: d });

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.header}>Select Your Device</Text>
      {items.map((d) => (
        <View key={d.id} style={styles.card}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => setSelectedId(d.id)}>
              <Ionicons name={selectedId === d.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selectedId === d.id ? '#16A34A' : colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.badge}>Device {items.indexOf(d) + 1}</Text>
          </View>
          <View style={styles.body}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{d.modelName || 'Device'}</Text>
              {d.color ? <Text style={styles.spec}>Color: {d.color}</Text> : null}
            </View>
            <View style={styles.thumb} />
          </View>
          <Text style={styles.note}>Notes: Modify only the color storage configuration*</Text>
          <View style={styles.actionsRow}>
            <OutlineButton title="Edit" style={{ flex: 1, marginRight: 6, paddingVertical: 8 }} onPress={() => navigation.navigate('SelectVariant', { flow: 'PROFILE', deviceId: d.id, brandId: d.brandId, modelId: d.modelId, modelName: d.modelName, ramOptionId: d.ramOptionId, storageOptionId: d.storageOptionId, color: d.color })} />
            <DangerButton title="Delete" style={{ flex: 1, marginLeft: 6, paddingVertical: 8 }} onPress={async () => {
              const ok = await confirm({ title: 'Delete', message: 'Are you sure?', confirmText: 'Yes', cancelText: 'No', destructive: true });
              if (!ok) return;
              try { await deleteSavedDevice(d.id); load(); } catch (e) { notify('Error', e.message); }
            }} />
          </View>
          {selectedId === d.id && (
            <View style={{ marginTop: 10 }}>
              <PrimaryButton title="Continue with this device" onPress={() => proceed(d)} />
            </View>
          )}
        </View>
      ))}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>( or )</Text>
        <View style={styles.dividerLine} />
      </View>

      <PrimaryButton title="Select Other Device" onPress={() => navigation.navigate('SelectCategory', { flow: 'REPAIR' })} />
    </ScrollView>
  );
}
