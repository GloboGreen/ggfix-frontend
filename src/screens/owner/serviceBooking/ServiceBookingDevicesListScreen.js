import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ScreenHeader } from '../../../components/rnr';
import { ticketApi } from '../../../api/client';
import { notify } from '../../../components/confirm';

export default function ServiceBookingDevicesListScreen({ navigation, route }) {
  const params = route?.params || {};
  // Hold list of fully-prepared devices in route. First device comes from this run.
  const initial = (params.devices && Array.isArray(params.devices) && params.devices.length > 0)
    ? params.devices
    : [{
        modelName: params.modelName,
        modelId: params.modelId,
        brandId: params.brandId,
        brandName: params.brandName,
        color: params.color,
        ramLabel: params.ramLabel,
        storageLabel: params.storageLabel,
        ramOptionId: params.ramOptionId,
        storageOptionId: params.storageOptionId,
        imei: params.imei,
        complaint: params.complaint,
        services: params.services || [],
        lock: params.lock,
        missingParts: params.missingParts,
      }];

  const [devices] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const totalFor = (d) => (d.services || []).reduce((s, x) => s + (Number(x.price) || 0), 0);

  const addMore = () => {
    navigation.navigate('ChooseDevice', {
      customerId: params.customerId,
      customer: params.customer,
      // Carry forward the devices list so the next pass appends to it on the way back
      existingDevices: devices,
    });
  };

  const submit = async () => {
    if (!params.customerId) { notify('Missing', 'Customer is required'); return; }
    setSubmitting(true);
    try {
      const created = [];
      for (const d of devices) {
        const res = await ticketApi.post('/tickets', {
          body: {
            customerId: params.customerId,
            brandId: d.brandId,
            modelId: d.modelId,
            ramOptionId: d.ramOptionId,
            storageOptionId: d.storageOptionId,
            color: d.color,
            imei: d.imei,
            issueDescription: d.complaint,
            estimatedPrice: totalFor(d),
          },
        });
        created.push(res);
      }
      navigation.replace('BookingThankYou', {
        customer: params.customer,
        devices,
        tickets: created,
      });
    } catch (e) {
      notify('Error', e?.message || 'Failed to submit booking');
    } finally { setSubmitting(false); }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Service Booking Devices List" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-32">
        {devices.map((d, idx) => (
          <Card key={idx} className="mb-4 p-0 overflow-hidden">
            <View className="flex-row items-center p-3">
              <View className="w-14 h-16 bg-border rounded-md" />
              <View className="ml-3 flex-1">
                <Text className="text-text-muted text-xs">Device: <Text className="font-bold text-text">{d.modelName} ({d.ramLabel || ''} {d.storageLabel || ''})</Text></Text>
                <Text className="text-text-muted text-xs mt-1">Color : <Text className="font-bold text-text">{d.color}</Text></Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </View>
            <View className="px-3 pb-3">
              <Text className="text-text-muted text-xs mb-1">Repair Services</Text>
              {(d.services || []).map((s, i) => (
                <View key={i} className="flex-row items-center my-1">
                  <View className="w-6 h-6 bg-background rounded items-center justify-center mr-2">
                    <Text className="text-text text-xs font-bold">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 text-text">{s.serviceName}</Text>
                  <Text className="font-bold text-text">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
              <View className="border-t border-border mt-2 pt-2 flex-row items-center">
                <Text className="flex-1 font-bold text-text">Estimated Repair Amount</Text>
                <Text className="font-bold text-text">₹{totalFor(d).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text className="text-error text-xs text-center mt-2">
          This customer has multiple devices. Click "Add More Device" to book another repair. *
        </Text>

        <View className="items-center mt-2">
          <Button onPress={addMore}>Add More Device</Button>
        </View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border">
        <Button className="bg-success" loading={submitting} onPress={submit}>Sumbit</Button>
      </View>
    </View>
  );
}
