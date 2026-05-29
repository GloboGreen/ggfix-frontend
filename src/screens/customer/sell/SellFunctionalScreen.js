import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, Loader } from '../../../components/ui';
import { getFunctionalIssues } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  tile: { width: '31.33%', marginHorizontal: '1%', marginBottom: 6, paddingVertical: 8, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', minHeight: 62 },
  tileActive: { borderColor: '#16A34A', borderWidth: 2 },
  label: { fontSize: 10, lineHeight: 13, color: colors.text, marginTop: 3, textAlign: 'center', fontWeight: '600' },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

const FALLBACK = ['Battery issue','Battery Replaced Local Market','Flash Light Not Working','Front Camera not working','Back Camera not working','Camera Glass Broken','Sim Slot Broken','Network issues','Speaker not working','Mic not working','Touch Id or Face Id not working','Volume Button not working','WiFi or Bluetooth not working','Charging Port not working','Proximity Sensor not working','Power button not working','Ear Speaker not working or low','Vibrator not working'];

export default function SellFunctionalScreen({ navigation, route }) {
  const params = route.params || {};
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getFunctionalIssues(params.device?.categoryId);
        setIssues(list.length ? list : FALLBACK.map((n, i) => ({ id: `f${i}`, name: n })));
      } catch (_) { setIssues(FALLBACK.map((n, i) => ({ id: `f${i}`, name: n }))); }
      setLoading(false);
    })();
  }, []);

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  if (loading) return <Loader />;
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card style={{ padding: 10, marginVertical: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>Functionality issues</Text>
          <View style={styles.row}>
            {issues.map((it) => {
              const active = selected.includes(it.id);
              return (
                <TouchableOpacity key={it.id} style={[styles.tile, active && styles.tileActive]} onPress={() => toggle(it.id)}>
                  <Ionicons name={active ? 'checkmark-circle' : 'warning-outline'} size={18} color={active ? '#16A34A' : '#F59E0B'} />
                  <Text style={styles.label}>{it.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Continue →" onPress={() => navigation.navigate('SellAccessoriesWarranty', { ...params, issues: selected.map((id) => ({ issueId: id })) })} />
      </View>
    </View>
  );
}
