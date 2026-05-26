import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/rnr';

export default function BookingSuccessfulScreen({ route }) {
  const { tickets = [], devices = [] } = route?.params || {};
  const trackingId = tickets[0]?.trackingId || 'CSPEN00000000';
  const d = devices[0] || {};
  const total = (d.services || []).reduce((s, x) => s + (Number(x.price) || 0), 0);
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View className="flex-1 bg-background">
      <View className="bg-card px-4 py-4 flex-row items-center border-b border-border">
        <View className="w-9 h-9 rounded-full bg-success/10 items-center justify-center mr-3">
          <Ionicons name="leaf" size={20} color="#22C55E" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-text">Booking Successful</Text>
          <Text className="text-xs text-text-muted">{time} on {date}</Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-4 pt-4 pb-12">
        <Card>
          <Text className="font-bold text-text mb-2">Device Details</Text>
          <View className="flex-row items-center pb-3 border-b border-border mb-3">
            <View className="w-12 h-14 bg-border rounded-md" />
            <View className="ml-3 flex-1">
              <Text className="text-text-muted text-xs">Tracking ID : <Text className="font-bold text-text">#{trackingId}</Text></Text>
              <Text className="text-text-muted text-xs">Device: <Text className="font-bold text-text">{d.modelName}, ({d.ramLabel || ''} {d.storageLabel || ''})</Text></Text>
              <Text className="text-text-muted text-xs">Color : <Text className="font-bold text-text">{d.color}</Text></Text>
            </View>
          </View>

          <Text className="font-bold text-text mb-2">Price Summary</Text>
          {(d.services || []).map((s, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-background rounded items-center justify-center mr-2">
                <Text className="text-text text-xs font-bold">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-text">{s.serviceName}</Text>
              <Text className="font-bold text-text">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}
          <View className="border-t border-border mt-2 pt-2 flex-row items-center mb-3">
            <Text className="flex-1 font-bold text-text">Estimated Repair Amount</Text>
            <Text className="font-bold text-text">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View className="border-t border-border pt-3">
            <Text className="font-bold text-text">Complaint Issue :</Text>
            <Text className="text-text mb-2">{d.complaint || '-'}</Text>
            <Text className="text-text"><Text className="font-bold">Estimated Approximate Time :</Text> {d.estimatedAt || '-'}</Text>
            <Text className="text-text"><Text className="font-bold">Estimated Delivery Date :</Text> {d.estimatedDelivery || '-'}</Text>
            <Text className="text-text"><Text className="font-bold">Customer Repair Approval :</Text> <Text className="text-success font-bold">Done</Text></Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
