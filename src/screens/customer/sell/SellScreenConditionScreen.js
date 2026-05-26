import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, Loader } from '../../../components/ui';
import { getConditionGroups, getConditionOptions } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  groupTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  optTile: { width: '30%', margin: '1.5%', padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  optTileActive: { borderColor: '#16A34A', borderWidth: 2 },
  optLabel: { fontSize: 11, color: colors.text, marginTop: 4, textAlign: 'center', fontWeight: '600' },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

const FALLBACK_GROUPS = [
  { id: 'SCREEN_VISIBLE', code: 'SCREEN_VISIBLE', name: 'Screen Condition on your Device', options: ['No Damage', 'Minor Spot or patches', 'Major Spot or patches', 'Major Spot or patches', 'Discoloration'] },
  { id: 'TOUCH_GLASS', code: 'TOUCH_GLASS', name: 'Touch Glass Condition on your device', options: ['No Damage', '1 or 2 Minor Scratches', 'Heavy Scratches', 'TouchGlass Broken'] },
  { id: 'BACK_PANEL', code: 'BACK_PANEL', name: 'Back Panel Condition on your Device', options: ['No Damage', '1 or 2 Minor Scratches', 'Heavy Scratches or deep scratches', 'Light Cover Marks on Body', 'Heavy Cover Marks on Body', 'Back Panel Broken'] },
  { id: 'SIDE_PANEL', code: 'SIDE_PANEL', name: 'side and Center Panel Condition on your device', options: ['No defects', 'Minor dent or scratches', 'Major dent or heavy scratches', 'Center panel broken or cracked or bend'] },
];

export default function SellScreenConditionScreen({ navigation, route }) {
  const params = route.params || {};
  const [groups, setGroups] = useState([]);
  const [optsByGroup, setOptsByGroup] = useState({});
  const [selected, setSelected] = useState({}); // groupId -> {id, label}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getConditionGroups();
        if (list.length === 0) {
          setGroups(FALLBACK_GROUPS);
        } else {
          setGroups(list);
          const map = {};
          for (const g of list) {
            map[g.id] = await getConditionOptions(g.id).catch(() => []);
          }
          setOptsByGroup(map);
        }
      } catch (_) { setGroups(FALLBACK_GROUPS); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {groups.map((g) => {
          const opts = (optsByGroup[g.id]?.length ? optsByGroup[g.id] : (g.options || []).map((o, i) => ({ id: `${g.id}-${i}`, label: o })));
          return (
            <Card key={g.id}>
              <Text style={styles.groupTitle}>{g.name}</Text>
              <View style={styles.row}>
                {opts.map((o) => {
                  const active = selected[g.id]?.id === o.id;
                  return (
                    <TouchableOpacity key={o.id} style={[styles.optTile, active && styles.optTileActive]} onPress={() => setSelected({ ...selected, [g.id]: { id: o.id, label: o.label, groupCode: g.code } })}>
                      <Text style={styles.optLabel}>{o.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Continue →" onPress={() => navigation.navigate('SellFunctional', { ...params, conditions: Object.values(selected).map((s) => ({ groupCode: s.groupCode, optionId: s.id, optionLabel: s.label })) })} />
      </View>
    </View>
  );
}
