import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Checkbox, ScreenHeader } from '../../../components/rnr';

const PARTS = [
  { id: 'DISPLAY', name: 'Display', icon: 'phone-portrait-outline' },
  { id: 'BACK_DOOR', name: 'Back Door', icon: 'phone-portrait-outline' },
  { id: 'BACK_DOOR_2', name: 'Back Door', icon: 'phone-portrait-outline' },
  { id: 'SIM_TRAY', name: 'SIM Card Tray', icon: 'card-outline' },
  { id: 'BUTTONS', name: "Button's", icon: 'apps-outline' },
];

export default function DeviceMissingPartsScreen({ navigation, route }) {
  const params = route?.params || {};
  // { [id]: { missing: bool, damage: bool, detail: '' } }
  const [state, setState] = useState({});

  const setField = (id, key, value) => setState((p) => ({ ...p, [id]: { ...p[id], [key]: value } }));

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Device Missing Parts" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-32">
        <Text className="font-bold text-text mb-3 pb-2 border-b border-primary">Device Missing / Damage Parts</Text>

        {PARTS.map((p, i) => {
          const row = state[p.id] || {};
          return (
            <View key={p.id} className={`pb-3 mb-3 ${i < PARTS.length - 1 ? 'border-b border-border' : ''}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-card border border-border rounded items-center justify-center mr-2">
                  <Ionicons name={p.icon} size={20} color="#0F172A" />
                </View>
                <Text className="flex-1 font-semibold text-text">{p.name}</Text>
                <View className="flex-row items-center mr-3">
                  <Checkbox checked={!!row.missing} onChange={(v) => setField(p.id, 'missing', v)} label="Missing" />
                </View>
                <Checkbox checked={!!row.damage} onChange={(v) => setField(p.id, 'damage', v)} label="Damage" />
              </View>
              <TextInput
                placeholder="Enter Details"
                placeholderTextColor="#94A3B8"
                value={row.detail || ''}
                onChangeText={(v) => setField(p.id, 'detail', v)}
                className="mt-2 ml-12 text-text-muted"
              />
            </View>
          );
        })}
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border">
        <Button
          rightIcon={<Ionicons name="chevron-forward" size={20} color="#fff" />}
          onPress={() => navigation.navigate('ServiceBookingDevicesList', { ...params, missingParts: state })}
        >
          Continue
        </Button>
      </View>
    </View>
  );
}
