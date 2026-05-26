import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ScreenHeader } from '../../../components/rnr';

export default function DeviceInformationScreen({ navigation, route }) {
  const params = route?.params || {};
  const services = params.services || [];
  const total = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Device Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-32">
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

        <Card className="mb-4">
          <Text className="font-bold text-text mb-1">Complaint Issue :</Text>
          <Text className="text-text">{params.complaint || '-'}</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-text mb-1"><Text className="font-bold">Estimated Approximate Time :</Text> {params.estimatedAt}</Text>
          <Text className="text-text mb-1"><Text className="font-bold">Estimated Delivery Date :</Text> {params.estimatedDelivery}</Text>
          <Text className="text-text"><Text className="font-bold">Customer Repair Approval :</Text> <Text className="text-success font-bold">Done</Text></Text>
        </Card>

        <Card>
          <Text className="font-bold text-text mb-2">Device Photo's</Text>
          <View className="flex-row">
            {['Front Side', 'Back Side', 'Full Coverage Video'].map((l) => (
              <View key={l} className="flex-1 mx-1 items-center">
                <Pressable className="w-full border border-dashed border-primary rounded-xl items-center justify-center bg-background" style={{ height: 96 }}>
                  <Ionicons name="image-outline" size={28} color="#94A3B8" />
                </Pressable>
                <Text className="text-xs text-text-muted mt-1">{l}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 p-4 bg-card border-t border-border">
        <Button
          rightIcon={<Ionicons name="chevron-forward" size={20} color="#fff" />}
          onPress={() => navigation.navigate('DeviceSecurity', params)}
        >
          Continue
        </Button>
      </View>
    </View>
  );
}
