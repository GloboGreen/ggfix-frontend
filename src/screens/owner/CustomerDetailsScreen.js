import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';

export default function CustomerDetailsScreen({ route, navigation }) {
  const { mode = 'new', customer } = route.params || {};

  const initial = useMemo(() => {
    if (mode === 'existing' && customer) {
      const phone = (customer.phone || '').replace(/\D/g, '').replace(/^91/, '').trim();
      return {
        name: customer.name || '',
        phone,
        email: customer.email || '',
        state: 'Tamil Nadu',
        district: '',
        taluk: '',
        area: '',
        doorStreet: '',
        pincode: '',
      };
    }
    return {
      name: '',
      phone: '',
      email: '',
      state: 'Tamil Nadu',
      district: '',
      taluk: '',
      area: '',
      doorStreet: '',
      pincode: '',
    };
  }, [customer, mode]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const buildAddress = () => {
    const parts = [form.state, form.district, form.taluk, form.area, form.doorStreet, form.pincode].filter(Boolean);
    return parts.join(', ');
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Required', 'Customer name is required');
      return;
    }
    if (!form.phone?.trim()) {
      Alert.alert('Required', 'Mobile number is required');
      return;
    }
    const phone = form.phone.replace(/\D/g, '').trim();
    const displayPhone = phone.startsWith('91') ? `+${phone}` : `+91 ${phone}`;

    if (mode === 'new') {
      setSaving(true);
      try {
        const created = await ticketApi.post('/customers', {
          body: {
            name: form.name.trim(),
            phone: displayPhone,
            email: form.email?.trim() || undefined,
            address: buildAddress() || undefined,
          },
        });
        navigation.navigate('ChooseDevice', {
          customer: {
            id: created.id,
            name: created.name,
            phone: created.phone,
            email: created.email,
            address: created.address,
          },
        });
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to save customer');
      } finally {
        setSaving(false);
      }
    } else {
      navigation.navigate('ChooseDevice', {
        customer: {
          id: customer.id,
          name: form.name.trim(),
          phone: displayPhone,
          email: form.email?.trim(),
          address: buildAddress(),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="person" size={16} color="#16A34A" />
          <Text style={styles.sectionTitle}>Customer Details</Text>
        </View>

        <Label label="Customer Name *" />
        <TextInput
          style={styles.input}
          placeholder="Enter Customer Name"
          placeholderTextColor="#9CA3AF"
          value={form.name}
          onChangeText={(v) => set('name', v)}
        />

        <Label label="Your Mobile Number *" />
        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryText}>+91</Text>
            <Ionicons name="chevron-down" size={14} color="#6B7280" />
          </View>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Enter your mobile number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => set('phone', v)}
          />
        </View>

        <Label label="Address" />
        <View style={styles.grid2}>
          <View style={{ flex: 1 }}>
            <Label2 label="State" />
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#9CA3AF"
              value={form.state}
              onChangeText={(v) => set('state', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label2 label="District" />
            <TextInput
              style={styles.input}
              placeholder="Select district"
              placeholderTextColor="#9CA3AF"
              value={form.district}
              onChangeText={(v) => set('district', v)}
            />
          </View>
        </View>

        <View style={styles.grid2}>
          <View style={{ flex: 1 }}>
            <Label2 label="Taluk" />
            <TextInput
              style={styles.input}
              placeholder="Select Taluk"
              placeholderTextColor="#9CA3AF"
              value={form.taluk}
              onChangeText={(v) => set('taluk', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label2 label="Area" />
            <TextInput
              style={styles.input}
              placeholder="Area"
              placeholderTextColor="#9CA3AF"
              value={form.area}
              onChangeText={(v) => set('area', v)}
            />
          </View>
        </View>

        <View style={styles.grid2}>
          <View style={{ flex: 1 }}>
            <Label2 label="Door no. / Street" />
            <TextInput
              style={styles.input}
              placeholder="Door no. / Street"
              placeholderTextColor="#9CA3AF"
              value={form.doorStreet}
              onChangeText={(v) => set('doorStreet', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label2 label="Pin Code" />
            <TextInput
              style={styles.input}
              placeholder="pincode"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={form.pincode}
              onChangeText={(v) => set('pincode', v)}
            />
          </View>
        </View>

        <Label label="Your Email Address" />
        <TextInput
          style={styles.input}
          placeholder="email address"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => set('email', v)}
        />

        <Label label="ID Proof (Optional)" />
        <View style={styles.uploadBox}>
          <Ionicons name="cloud-upload-outline" size={20} color="#2563EB" />
          <Text style={styles.uploadText}>upload</Text>
          <Text style={styles.uploadHint}>Max size: 1MB</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save Details</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ label }) {
  return <Text style={styles.label}>{label}</Text>;
}

function Label2({ label }) {
  return <Text style={styles.label2}>{label}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { marginLeft: 6, fontSize: 14, fontWeight: '700', color: '#111827' },
  label: { fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 6, marginTop: 10 },
  label2: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 10,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  countryText: { fontSize: 13, color: '#111827', marginRight: 6 },
  grid2: { flexDirection: 'row', gap: 10 },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadText: { marginTop: 4, fontSize: 13, color: '#2563EB', fontWeight: '700' },
  uploadHint: { marginTop: 4, fontSize: 11, color: '#6B7280' },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

