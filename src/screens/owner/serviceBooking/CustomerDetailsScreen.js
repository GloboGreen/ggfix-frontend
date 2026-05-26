import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { UserPlus, ChevronDown, Upload, Save, MapPin } from 'lucide-react-native';
import { Button, Input, Label, ScreenHeader, Select } from '../../../components/rnr';
import { ticketApi } from '../../../api/client';
import { notify } from '../../../components/confirm';

const STATES = [
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
];

const DISTRICTS_TN = [
  'Chennai', 'Cuddalore', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur',
].map((d) => ({ value: d, label: d }));

const TALUKS = ['Cuddalore', 'Chidambaram', 'Bhuvanagiri', 'Panruti', 'Virudhachalam', 'Kattumannar Koil']
  .map((t) => ({ value: t, label: t }));

const INPUT_CLS = 'py-2 text-[13px]';

function Field({ label, required, children, half = false, className }) {
  return (
    <View className={`${half ? 'flex-1' : ''} mb-2 ${className || ''}`}>
      <Label className="text-[11px] mb-1">
        {label}{required ? <Text className="text-danger"> *</Text> : null}
      </Label>
      {children}
    </View>
  );
}

export default function CustomerDetailsScreen({ navigation, route }) {
  const initial = route?.params?.initial || {};
  const [data, setData] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    state: initial.state || 'Tamil Nadu',
    district: initial.district || '',
    taluk: initial.taluk || '',
    area: initial.area || '',
    addressLine: initial.addressLine || '',
    pincode: initial.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!data.name.trim() || !data.phone.trim()) {
      notify('Required', 'Customer name and mobile number are required');
      return;
    }
    setSaving(true);
    try {
      const created = await ticketApi.post('/customers', {
        body: {
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim() || null,
          address: [data.addressLine, data.area, data.taluk, data.district, data.state, data.pincode].filter(Boolean).join(', '),
        },
      });
      navigation.replace('ChooseDevice', { customerId: created.id, customer: created });
    } catch (e) {
      notify('Error', e?.message || 'Failed to save customer');
    } finally { setSaving(false); }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Customer Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 96 }} keyboardShouldPersistTaps="handled">

        {/* Personal info */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center mr-2">
              <UserPlus size={14} color="#10B981" />
            </View>
            <Text className="text-[13px] font-extrabold text-text">Personal Info</Text>
          </View>

          <Field label="Customer Name" required>
            <Input placeholder="Enter customer name" value={data.name} onChangeText={(v) => setData({ ...data, name: v })} className={INPUT_CLS} />
          </Field>

          <Field label="Mobile Number" required>
            <View className="flex-row">
              <Pressable className="bg-card border border-border rounded-xl px-2.5 py-2 mr-2 flex-row items-center">
                <Text className="text-[13px] text-text font-semibold">+91</Text>
                <ChevronDown size={12} color="#64748B" />
              </Pressable>
              <Input
                className={`flex-1 ${INPUT_CLS}`}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                value={data.phone}
                onChangeText={(v) => setData({ ...data, phone: v })}
              />
            </View>
          </Field>

          <Field label="Email Address" className="mb-0">
            <Input placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" value={data.email} onChangeText={(v) => setData({ ...data, email: v })} className={INPUT_CLS} />
          </Field>
        </View>

        {/* Address */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <MapPin size={14} color="#00008B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text">Address</Text>
          </View>

          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Field label="State" half>
                <Select value={data.state} options={STATES} onChange={(v) => setData({ ...data, state: v })} />
              </Field>
            </View>
            <View className="px-1 flex-1">
              <Field label="District" half>
                <Select value={data.district} options={DISTRICTS_TN} placeholder="Select district" onChange={(v) => setData({ ...data, district: v })} />
              </Field>
            </View>
          </View>

          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Field label="Taluk" half>
                <Select value={data.taluk} options={TALUKS} placeholder="Select Taluk" onChange={(v) => setData({ ...data, taluk: v })} />
              </Field>
            </View>
            <View className="px-1 flex-1">
              <Field label="Area" half>
                <Input placeholder="Area" value={data.area} onChangeText={(v) => setData({ ...data, area: v })} className={INPUT_CLS} />
              </Field>
            </View>
          </View>

          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Field label="Door no. / Street" half className="mb-0">
                <Input placeholder="Door No. / Street" value={data.addressLine} onChangeText={(v) => setData({ ...data, addressLine: v })} className={INPUT_CLS} />
              </Field>
            </View>
            <View className="px-1 flex-1">
              <Field label="Pin Code" half className="mb-0">
                <Input placeholder="Pincode" keyboardType="number-pad" value={data.pincode} onChangeText={(v) => setData({ ...data, pincode: v })} className={INPUT_CLS} />
              </Field>
            </View>
          </View>
        </View>

        {/* Upload */}
        <Pressable className="border border-dashed border-primary/40 bg-primary/5 rounded-2xl py-4 items-center active:opacity-80 mb-3">
          <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
            <Upload size={18} color="#00008B" />
          </View>
          <Text className="text-primary font-extrabold text-[13px] mt-1.5">Upload ID Proof</Text>
          <Text className="text-[10px] text-text-muted mt-0.5">Optional · Max 1MB</Text>
        </Pressable>

        <Button onPress={save} loading={saving} fullWidth leftIcon={<Save size={16} color="#fff" />}>
          Save & Continue
        </Button>
      </ScrollView>
    </View>
  );
}
