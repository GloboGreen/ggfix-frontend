import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, LabeledInput } from '../../../components/ui';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: { width: '46%', margin: '2%', height: 110, borderColor: '#5EE5C5', borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  slotLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 6 },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

const SLOTS = ['Front Side', 'Backside', 'side and Center', 'Camera', 'side and Center'];

export default function SellImagesScreen({ navigation, route }) {
  const params = route.params || {};
  const [condition, setCondition] = useState('Good');
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4, textAlign: 'center' }}>Upload for Device Images</Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>Maximum file size: 5 MB.</Text>
          <View style={styles.row}>
            {SLOTS.map((l) => (
              <TouchableOpacity key={l} style={styles.slot}>
                <Text style={styles.slotLabel}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <LabeledInput label="Device Condition" value={condition} onChangeText={setCondition} />
        </Card>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton title="Continue →" onPress={() => navigation.navigate('SellAddress', { ...params, deviceCondition: condition })} />
      </View>
    </View>
  );
}
