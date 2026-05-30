import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ScreenHeader } from '../../../components/rnr';
import { ticketApi } from '../../../api/client';
import { notify } from '../../../components/confirm';

export default function ServiceBookingDevicesListScreen({ navigation, route }) {
  const params = route?.params || {};
  // Build a device record from the just-finished flow (if any modelId came through).
  const newDevice = params.modelId ? {
    modelName: params.modelName,
    modelId: params.modelId,
    imageUrl: params.imageUrl,
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
    devicePhotos: params.devicePhotos,
    estimatedAt: params.estimatedAt,
    estimatedDelivery: params.estimatedDelivery,
    estimatedReadyIso: params.estimatedReadyIso,
    estimatedDeliveryIso: params.estimatedDeliveryIso,
    customerApproved: params.customerApproved,
  } : null;

  const existing = Array.isArray(params.existingDevices) ? params.existingDevices : [];
  // Priority: pre-built devices list > existing + new > existing > new alone.
  let initial;
  if (Array.isArray(params.devices) && params.devices.length > 0) {
    initial = params.devices;
  } else if (existing.length > 0 && newDevice) {
    initial = [...existing, newDevice];
  } else if (existing.length > 0) {
    initial = existing;
  } else if (newDevice) {
    initial = [newDevice];
  } else {
    initial = [];
  }

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
            customerName: params.customer?.name || params.customer?.fullName || null,
            customerPhone: params.customer?.phone || params.customer?.mobile || null,
            brandId: d.brandId,
            modelId: d.modelId,
            ramOptionId: d.ramOptionId,
            storageOptionId: d.storageOptionId,
            color: d.color,
            imei: d.imei,
            issueDescription: d.complaint,
            estimatedPrice: totalFor(d),
            deviceDisplayName: d.modelName ? `${d.modelName}${d.ramLabel || d.storageLabel ? ` (${[d.ramLabel, d.storageLabel].filter(Boolean).join(' / ')})` : ''}` : null,
            deviceImageUrl: d.imageUrl || null,
            deviceSecurityType: d.lock?.type || 'NONE',
            deviceSecurityValue: d.lock?.value || null,
            missingPartsJson: (d.missingParts && d.missingParts.length) ? JSON.stringify(d.missingParts) : null,
            devicePhotosJson: d.devicePhotos ? JSON.stringify(d.devicePhotos) : null,
            estimatedReadyAt: d.estimatedReadyIso || null,
            estimatedDeliveryAt: d.estimatedDeliveryIso || null,
            customerApproval: d.customerApproved ?? null,
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
      <ScrollView contentContainerClassName="px-4 pt-3 pb-32">
        {devices.map((d, idx) => (
          <Card key={idx} className="mb-2.5 p-0 overflow-hidden">
            <View className="flex-row items-center px-2.5 py-2">
              <View className="w-11 h-12 bg-border rounded-md overflow-hidden items-center justify-center">
                {d.imageUrl ? (
                  <Image source={{ uri: d.imageUrl }} style={{ width: 44, height: 48 }} resizeMode="cover" />
                ) : (
                  <Ionicons name="phone-portrait-outline" size={20} color="#64748B" />
                )}
              </View>
              <View className="ml-2.5 flex-1">
                <Text className="text-text-muted text-[10px]">Device: <Text className="font-bold text-text text-[12px]">{d.modelName} ({d.ramLabel || ''} {d.storageLabel || ''})</Text></Text>
                <Text className="text-text-muted text-[10px] mt-0.5">Color : <Text className="font-bold text-text text-[12px]">{d.color}</Text></Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
            </View>
            <View className="px-2.5 pb-2">
              <Text className="text-text-muted text-[10px] mb-0.5">Repair Services</Text>
              {(d.services || []).map((s, i) => (
                <View key={i} className="flex-row items-center my-0.5">
                  <View className="w-5 h-5 bg-background rounded items-center justify-center mr-2">
                    <Text className="text-text text-[10px] font-bold">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 text-text text-[12px]" numberOfLines={1}>{s.serviceName}</Text>
                  <Text className="font-bold text-text text-[12px]">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
              <View className="border-t border-border mt-1.5 pt-1.5 flex-row items-center">
                <Text className="flex-1 font-bold text-text text-[12px]">Estimated Repair Amount</Text>
                <Text className="font-bold text-text text-[12px]">₹{totalFor(d).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text className="text-error text-[11px] text-center mt-1.5 px-2">
          This customer has multiple devices. Click "Add More Device" to book another repair. *
        </Text>

        <View className="items-center mt-2">
          <Button onPress={addMore}>Add More Device</Button>
        </View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border">
        <Button className="bg-success" loading={submitting} onPress={submit}>Submit</Button>
      </View>
    </View>
  );
}
