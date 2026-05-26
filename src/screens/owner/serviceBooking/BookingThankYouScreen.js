import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/rnr';

export default function BookingThankYouScreen({ navigation, route }) {
  const { customer = {}, devices = [], tickets = [] } = route?.params || {};
  const trackingId = tickets[0]?.trackingId || 'CSPEN00000000';
  const total = devices.reduce((sum, d) => sum + (d.services || []).reduce((s, x) => s + (Number(x.price) || 0), 0), 0);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="" onBack={() => navigation.popToTop()} />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-12">
        <View className="bg-text rounded-2xl px-5 py-6">
          <View className="items-center mb-4">
            <View className="bg-card rounded-full p-2">
              <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
            </View>
            <Text className="text-success text-2xl font-bold mt-2">Thank You!</Text>
            <Text className="text-white text-xs mt-1">Your Booking has been placed.</Text>
          </View>

          <Text className="text-white font-bold mb-2">Customer Details</Text>
          <View className="bg-text-muted/20 rounded-md p-3 mb-3">
            <Row label="Shop Name" value={customer.shopName || 'Green Mobiles'} />
            <Row label="Customer Name" value={customer.name} />
            <Row label="Mobile Number" value={customer.phone} />
            <Row label="Address" value={customer.address} />
          </View>

          <Text className="text-white font-bold mb-2">Device & Repair Details</Text>
          <View className="bg-text-muted/20 rounded-md p-3 mb-3">
            <View className="flex-row mb-1">
              <Text className="flex-1 text-text-muted text-xs">Device</Text>
              <Text className="flex-1 text-text-muted text-xs">Repair Services</Text>
            </View>
            {devices.map((d, i) => (
              <View key={i} className="flex-row mb-1">
                <Text className="flex-1 text-white text-xs">{i + 1}. {d.modelName}</Text>
                <Text className="flex-1 text-white text-xs">{(d.services || []).map((s) => s.serviceName).join(', ')}</Text>
              </View>
            ))}
          </View>

          <Text className="text-white font-bold mb-2">Service Information</Text>
          <View className="bg-text-muted/20 rounded-md p-3">
            <Row light label="Tracking ID" value={trackingId} />
            <Row light label="Service Status" value="Order Placed" />
            <Row light label="Estimated Repair Price" value={`₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
          </View>
        </View>

        <View className="flex-row justify-around mt-8">
          <ActionTile
            icon="construct-outline" color="#A855F7" label="Assign To Technician"
            onPress={() => navigation.navigate('AssignTechnician', { tickets, customer, devices })}
          />
          <ActionTile icon="share-social-outline" color="#3B82F6" label="Sharing Receipt" onPress={() => navigation.navigate('BookingSuccessful', { tickets, customer, devices })} />
          <ActionTile icon="qr-code-outline" color="#A855F7" label="Barcode E-Print" onPress={() => navigation.navigate('ScanQrCode')} />
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, light }) {
  return (
    <View className="flex-row mb-1">
      <Text className={`flex-1 text-xs ${light ? 'text-text-muted' : 'text-text-muted'}`}>{label}</Text>
      <Text className={`flex-1 text-xs text-white`}>{value || '-'}</Text>
    </View>
  );
}

function ActionTile({ icon, color, label, onPress }) {
  return (
    <Pressable className="items-center" onPress={onPress}>
      <View style={{ backgroundColor: color }} className="rounded-full w-14 h-14 items-center justify-center">
        <Ionicons name={icon} size={26} color="#fff" />
      </View>
      <Text className="text-text text-xs mt-2 text-center" style={{ maxWidth: 100 }}>{label}</Text>
    </Pressable>
  );
}
