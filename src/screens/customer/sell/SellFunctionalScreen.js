import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, Loader } from '../../../components/ui';
import { getFunctionalIssues } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: '30%', margin: '1.5%', padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff', minHeight: 90 },
  tileActive: { borderColor: '#16A34A', borderWidth: 2 },
  label: { fontSize: 11, color: colors.text, marginTop: 4, textAlign: 'center', fontWeight: '600' },
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
        const list = await getFunctionalIssues();
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
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Functionality issues</Text>
          <View style={styles.row}>
            {issues.map((it) => {
              const active = selected.includes(it.id);
              return (
                <TouchableOpacity key={it.id} style={[styles.tile, active && styles.tileActive]} onPress={() => toggle(it.id)}>
                  <Ionicons name={active ? 'checkmark-circle' : 'warning-outline'} size={22} color={active ? '#16A34A' : '#F59E0B'} />
                  <Text style={styles.label}>{it.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Continue →" onPress={() => navigation.navigate('SellAccessories', { ...params, issues: selected.map((id) => ({ issueId: id })) })} />
      </View>
    </View>
  );
}
