import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Checkbox, FormField, ScreenHeader, Select } from '../../../components/rnr';

const DURATIONS = [1, 2, 3, 4, 5, 6, 8, 12, 24, 48].map((h) => ({ value: h, label: `${h} - Hr` }));

export default function ServicePriceEstimateScreen({ navigation, route }) {
  const params = route?.params || {};
  const services = params.services || [];
  const total = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  const today = new Date();
  const todayLabel = today.toDateString().slice(0, 15);
  const [imei, setImei] = useState('');
  const [complaint, setComplaint] = useState('');
  const [date, setDate] = useState(todayLabel);
  const [time, setTime] = useState('6.30 PM');
  const [duration, setDuration] = useState(2);
  const [approval, setApproval] = useState(true);
  const deliveryLabel = `${date} - 8.30 PM`;

  const onContinue = () => {
    if (!complaint.trim()) return;
    navigation.navigate('DeviceInformation', {
      ...params,
      imei: imei.trim(),
      complaint: complaint.trim(),
      estimatedAt: `${date} ${time}, ${duration}Hr`,
      estimatedDelivery: deliveryLabel,
      customerApproved: approval,
    });
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Service Price, Issue & Estimated Time" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-32" keyboardShouldPersistTaps="handled">
        <Card className="flex-row items-center mb-4">
          <View className="w-14 h-16 bg-border rounded-md" />
          <View className="ml-3 flex-1">
            <Text className="text-text-muted text-xs">Device: <Text className="font-bold text-text">{params.modelName || ''} ({params.ramLabel || ''} {params.storageLabel || ''})</Text></Text>
            <Text className="text-text-muted text-xs mt-1">Color : <Text className="font-bold text-text">{params.color}</Text></Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="font-bold text-text mb-3 pb-2 border-b border-border">Price Summary</Text>
          {services.map((s, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-background rounded items-center justify-center mr-2">
                <Text className="text-text text-xs font-bold">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-text">{s.serviceName}</Text>
              <Text className="font-bold text-text">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}
          <View className="border-t border-border mt-2 pt-2 flex-row items-center">
            <Text className="flex-1 font-bold text-text">Estimated Repair Amount</Text>
            <Text className="font-bold text-text">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
        </Card>

        <FormField label="IMEI Number">
          <View className="flex-row items-center bg-card border border-border rounded-xl px-3">
            <TextInput
              className="flex-1 py-3 text-text"
              placeholder="Enter IMEI Number or Scan"
              placeholderTextColor="#94A3B8"
              value={imei}
              onChangeText={setImei}
            />
            <Pressable className="p-2"><Ionicons name="barcode-outline" size={22} color="#0F172A" /></Pressable>
          </View>
        </FormField>

        <Text className="text-text font-bold mb-2">Complaint Notes</Text>
        <TextInput
          className="bg-card border border-primary rounded-xl px-4 py-3 text-text mb-4"
          placeholder="Enter you issue"
          placeholderTextColor="#94A3B8"
          value={complaint}
          onChangeText={setComplaint}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />

        <Card>
          <Text className="font-bold text-text mb-2">Estimated Approximate Time</Text>
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Text className="text-xs text-text-muted mb-1">Date</Text>
              <View className="bg-card border border-border rounded-xl px-3 py-2 flex-row items-center justify-between">
                <Text className="text-text text-xs flex-1">{date}</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </View>
            </View>
            <View className="flex-1 mr-2">
              <Text className="text-xs text-text-muted mb-1">Time</Text>
              <View className="bg-card border border-border rounded-xl px-3 py-2 flex-row items-center justify-between">
                <Text className="text-text text-xs flex-1">{time}</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </View>
            </View>
            <View className="w-24">
              <Text className="text-xs text-text-muted mb-1">Duration</Text>
              <Select value={duration} options={DURATIONS} onChange={(v) => setDuration(v)} className="py-2" />
            </View>
          </View>
          <Text className="font-bold text-text mt-3 mb-1">Estimated Delivery Time</Text>
          <View className="bg-card border border-border rounded-xl px-3 py-2">
            <Text className="text-text text-xs">{deliveryLabel}</Text>
          </View>
          <View className="flex-row items-center mt-3">
            <Text className="flex-1 font-semibold text-text">Customer Repair Approval</Text>
            <Checkbox checked={approval} onChange={setApproval} />
          </View>
        </Card>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border">
        <Button rightIcon={<Ionicons name="chevron-forward" size={20} color="#fff" />} onPress={onContinue}>
          Continue
        </Button>
      </View>
    </View>
  );
}
