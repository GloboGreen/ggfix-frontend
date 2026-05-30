import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, Loader } from '../../../components/ui';
import { getConfigFields } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  fieldHeader: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dropdownActive: { borderColor: '#00008B' },
  dropdownText: { flex: 1, fontSize: 13, color: colors.text },
  dropdownPlaceholder: { color: colors.textSecondary },
  optionList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: { flex: 1, fontSize: 13, color: colors.text },
  optionTextActive: { color: '#00008B', fontWeight: '700' },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

export default function SellDeviceConfigScreen({ navigation, route }) {
  const params = route.params || {};
  const [fields, setFields] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [selected, setSelected] = useState({}); // { [fieldId]: { id, value } }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getConfigFields(params.device?.categoryId);
        if (cancelled) return;
        const active = (list || []).filter((f) => f.isActive !== false);
        if (active.length === 0) {
          navigation.replace('SellAccessoriesWarranty', params);
          return;
        }
        setFields(active);
      } catch (_) {
        navigation.replace('SellAccessoriesWarranty', params);
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const choose = (fieldId, opt) => {
    setSelected((p) => ({ ...p, [fieldId]: { id: opt.id, value: opt.value } }));
    setOpenId(null);
  };

  const onContinue = () => {
    const deviceConfig = fields.map((f) => ({
      fieldId: f.id,
      fieldCode: f.code,
      fieldName: f.name,
      optionId: selected[f.id]?.id || null,
      value: selected[f.id]?.value || null,
    }));
    navigation.navigate('SellAccessoriesWarranty', { ...params, deviceConfig });
  };

  if (loading) return <Loader />;

  const allChosen = fields.every((f) => selected[f.id]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {fields.map((f) => {
          const sel = selected[f.id];
          const opts = f.options || [];
          const open = openId === f.id;
          return (
            <Card key={f.id} style={{ padding: 10, marginVertical: 4 }}>
              <Text style={styles.fieldHeader}>{f.name}</Text>
              <TouchableOpacity
                style={[styles.dropdown, open && styles.dropdownActive]}
                onPress={() => setOpenId(open ? null : f.id)}
              >
                <Text style={[styles.dropdownText, !sel && styles.dropdownPlaceholder]} numberOfLines={1}>
                  {sel ? sel.value : `Select ${f.name}`}
                </Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
              </TouchableOpacity>
              {open ? (
                <View style={styles.optionList}>
                  {opts.map((o, idx) => {
                    const active = sel?.id === o.id;
                    return (
                      <TouchableOpacity
                        key={o.id}
                        style={[styles.optionItem, idx === opts.length - 1 && { borderBottomWidth: 0 }]}
                        onPress={() => choose(f.id, o)}
                      >
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.value}</Text>
                        {active ? <Ionicons name="checkmark" size={16} color="#00008B" /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Continue →" disabled={!allChosen} onPress={onContinue} />
      </View>
    </View>
  );
}
