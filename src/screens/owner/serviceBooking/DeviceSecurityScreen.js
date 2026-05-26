import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Dialog, DialogHeader, ScreenHeader } from '../../../components/rnr';

const PATTERN_POINTS = Array.from({ length: 9 }, (_, i) => i + 1);

export default function DeviceSecurityScreen({ navigation, route }) {
  const params = route?.params || {};
  const [open, setOpen] = useState(null); // 'pattern' | 'pin' | 'password' | null
  const [pattern, setPattern] = useState('1,2,3,5,7,8,9');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [lock, setLock] = useState({ type: 'NONE', value: '' });

  const onSelect = (type) => {
    if (type === 'NONE') { setLock({ type: 'NONE', value: '' }); next({ type: 'NONE' }); return; }
    setOpen(type.toLowerCase());
  };

  const saveAndNext = (type, value) => {
    setLock({ type, value });
    setOpen(null);
    next({ type, value });
  };

  const next = (l) => navigation.navigate('DeviceMissingParts', { ...params, lock: l });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Device  Secrity" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-12">
        <Text className="font-bold text-text mb-3">Device Security</Text>
        <Card className="p-0 overflow-hidden">
          <View className="px-4 py-2 bg-background border-b border-border">
            <Text className="text-xs text-text-muted">Screen lock</Text>
          </View>
          {[
            { key: 'NONE', label: 'None' },
            { key: 'PATTERN', label: 'Pattern' },
            { key: 'PIN', label: 'PIN' },
            { key: 'PASSWORD', label: 'Password' },
          ].map((opt, i, arr) => (
            <Pressable key={opt.key} onPress={() => onSelect(opt.key)} className={`flex-row items-center px-4 py-4 ${i < arr.length - 1 ? 'border-b border-border' : ''} active:bg-background`}>
              <Text className="flex-1 text-text font-semibold">{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </Pressable>
          ))}
        </Card>
      </ScrollView>

      <Dialog open={open === 'pattern'} onClose={() => setOpen(null)}>
        <DialogHeader onClose={() => setOpen(null)} />
        <View className="items-center">
          <View className="bg-text rounded-md p-3 mb-3"><Ionicons name="lock-closed" size={24} color="#fff" /></View>
          <Text className="text-lg font-bold text-text mb-4">Enter for Device Pattern</Text>
          <View className="flex-row flex-wrap justify-center" style={{ width: 180 }}>
            {PATTERN_POINTS.map((p) => (
              <View key={p} className="w-1/3 items-center py-3">
                <View className="w-3 h-3 rounded-full bg-text-muted" />
              </View>
            ))}
          </View>
          <Text className="text-xs text-text-muted mt-3 self-start">Pattern Number</Text>
          <TextInput
            className="bg-background border border-border rounded-xl px-4 py-3 mt-1 w-full text-text"
            value={pattern}
            onChangeText={setPattern}
          />
        </View>
        <Button className="bg-success mt-4" rightIcon={<Ionicons name="save-outline" size={20} color="#fff" />} onPress={() => saveAndNext('PATTERN', pattern)}>Savee</Button>
      </Dialog>

      <Dialog open={open === 'pin'} onClose={() => setOpen(null)}>
        <DialogHeader onClose={() => setOpen(null)} />
        <View className="items-center">
          <View className="bg-text rounded-md p-3 mb-3"><Ionicons name="lock-closed" size={24} color="#fff" /></View>
          <Text className="text-lg font-bold text-text mb-2">Enter for Device PIN</Text>
          <View className="flex-row mb-4">
            {[0, 1, 2, 3].map((i) => (
              <View key={i} className={`w-2 h-2 rounded-full mx-1 ${pin.length > i ? 'bg-text' : 'bg-text-muted'}`} />
            ))}
          </View>
          <View className="flex-row flex-wrap justify-center" style={{ width: 180 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <Pressable key={n} className="w-1/3 items-center py-2" onPress={() => setPin((p) => (p + String(n)).slice(0, 4))}>
                <View className="bg-border w-10 h-10 rounded-full items-center justify-center"><Text className="font-bold text-text">{n}</Text></View>
              </Pressable>
            ))}
            <View className="w-1/3" />
            <Pressable className="w-1/3 items-center py-2" onPress={() => setPin((p) => (p + '0').slice(0, 4))}>
              <View className="bg-border w-10 h-10 rounded-full items-center justify-center"><Text className="font-bold text-text">0</Text></View>
            </Pressable>
            <Pressable className="w-1/3 items-center py-2" onPress={() => setPin((p) => p.slice(0, -1))}>
              <View className="w-10 h-10 items-center justify-center"><Ionicons name="backspace-outline" size={20} color="#0F172A" /></View>
            </Pressable>
          </View>
          <Text className="text-xs text-text-muted mt-3 self-start">PIN Number</Text>
          <TextInput value={pin} editable={false} className="bg-background border border-border rounded-xl px-4 py-3 mt-1 w-full text-text" />
        </View>
        <Button className="bg-success mt-4" rightIcon={<Ionicons name="save-outline" size={20} color="#fff" />} onPress={() => saveAndNext('PIN', pin)}>Savee</Button>
      </Dialog>

      <Dialog open={open === 'password'} onClose={() => setOpen(null)}>
        <DialogHeader onClose={() => setOpen(null)} />
        <View className="items-center">
          <View className="bg-text rounded-md p-3 mb-3"><Ionicons name="lock-closed" size={24} color="#fff" /></View>
          <Text className="text-lg font-bold text-text mb-4">Enter for Device Password</Text>
          <Text className="text-xs text-text-muted self-start">Password</Text>
          <TextInput
            className="bg-background border border-border rounded-xl px-4 py-3 mt-1 w-full text-text"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Dhar@"
            placeholderTextColor="#94A3B8"
          />
        </View>
        <Button className="bg-success mt-4" rightIcon={<Ionicons name="save-outline" size={20} color="#fff" />} onPress={() => saveAndNext('PASSWORD', password)}>Savee</Button>
      </Dialog>
    </View>
  );
}
