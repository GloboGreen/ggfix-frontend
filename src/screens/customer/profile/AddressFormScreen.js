import React, { useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import {
  User,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Tag,
  Crosshair,
  Save,
  Building2,
  Hash,
  Map as MapIcon,
} from 'lucide-react-native';
import { Button, Input, Label, BottomActionBar } from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { createAddress, updateAddress } from '../../../api/customer';

const LABELS = [
  { value: 'Home',   icon: Home,       color: '#00008B', bg: 'bg-primary/10',   text: 'text-primary' },
  { value: 'Office', icon: Briefcase,  color: '#2563EB', bg: 'bg-secondary/10', text: 'text-secondary' },
  { value: 'Other',  icon: Tag,        color: '#F59E0B', bg: 'bg-warning/10',   text: 'text-warning' },
];

const INPUT_CLS = 'py-2 text-[13px]';

function Field({ label, required, children, half = false, className = '' }) {
  return (
    <View className={`${half ? 'flex-1' : ''} mb-2 ${className}`}>
      <Label className="text-[11px] mb-1">
        {label}{required ? <Text className="text-danger"> *</Text> : null}
      </Label>
      {children}
    </View>
  );
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <View className="flex-row items-center bg-card border border-border rounded-xl px-3">
      <Icon size={14} color="#64748B" />
      <Input {...props} className={`flex-1 bg-transparent border-0 ml-2 ${INPUT_CLS}`} />
    </View>
  );
}

export default function AddressFormScreen({ navigation, route }) {
  const existing = route?.params?.address;
  const [data, setData] = useState({
    label: existing?.label || 'Home',
    fullName: existing?.fullName || '',
    mobile: existing?.mobile || '',
    pincode: existing?.pincode || '',
    locality: existing?.locality || '',
    addressLine: existing?.addressLine || '',
    city: existing?.city || '',
    state: existing?.state || '',
  });
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit Address' : 'Add Address' });
  }, [navigation, existing]);

  const save = async () => {
    if (!data.fullName.trim() || !data.mobile.trim() || !data.addressLine.trim()) {
      notify('Required', 'Name, mobile and address are required.');
      return;
    }
    setSaving(true);
    try {
      if (existing?.id) await updateAddress(existing.id, data);
      else await createAddress(data);
      navigation.goBack();
    } catch (e) {
      // Make sure the user actually sees the failure instead of "nothing happened"
      const msg = e?.message || 'Could not save the address.';
      notify('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const [locating, setLocating] = useState(false);
  const useMyLocation = async () => {
    // Web: navigator.geolocation. Native: expo-location isn't installed yet, so we fail gracefully.
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude, accuracy } = pos.coords;

            // Guard: desktop Chrome without GPS / Wi-Fi positioning falls back
            // to IP geolocation and returns the ISP's city centre with
            // accuracy in the tens of kilometres. Saving that would silently
            // mis-locate the customer forever (and make /shops/nearby return
            // wrong distances). 5 km is generous — real GPS is <100 m, real
            // Wi-Fi positioning is <500 m. Anything looser is unusable.
            const ACCURACY_MAX_METERS = 5000;
            if (accuracy && accuracy > ACCURACY_MAX_METERS) {
              setLocating(false);
              notify(
                'Location too imprecise',
                `Your browser only knows you're within ~${Math.round(accuracy / 1000)} km (likely from your IP, not GPS).\n\n` +
                'Fill the address fields manually so customers get accurate shop distances.\n\n' +
                'On a phone, the GPS chip gives proper accuracy.',
              );
              return;
            }

            // Try Nominatim reverse geocoding (free, no key needed). If blocked, just notify.
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept': 'application/json' } },
            );
            if (res.ok) {
              const j = await res.json();
              const a = j.address || {};
              setData((d) => ({
                ...d,
                pincode: a.postcode || d.pincode,
                locality: a.suburb || a.neighbourhood || a.village || d.locality,
                addressLine: j.display_name?.split(',').slice(0, 3).join(', ') || d.addressLine,
                city: a.city || a.town || a.county || d.city,
                state: a.state || d.state,
              }));
            } else {
              notify('Location captured', `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}. Couldn't reverse-geocode — fill the rest manually.`);
            }
          } catch (e) {
            notify('Couldn\'t resolve address', 'Got your coordinates, but couldn\'t look up the address. Please fill in manually.');
          } finally {
            setLocating(false);
          }
        },
        (err) => {
          setLocating(false);
          notify('Location blocked', err.message || 'Browser denied location access.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
      return;
    }
    notify('Not available', 'Live location is not available in this build. Please fill in the address manually.');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
      >
        {/* Contact */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <User size={14} color="#00008B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text">Contact</Text>
          </View>

          <Field label="Full Name" required>
            <IconInput
              icon={User}
              placeholder="Recipient full name"
              value={data.fullName}
              onChangeText={(v) => setData({ ...data, fullName: v })}
            />
          </Field>
          <Field label="Mobile Number" required className="mb-0">
            <IconInput
              icon={Phone}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              value={data.mobile}
              onChangeText={(v) => setData({ ...data, mobile: v })}
            />
          </Field>
        </View>

        {/* Address */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center mr-2">
              <MapPin size={14} color="#10B981" />
            </View>
            <Text className="text-[13px] font-extrabold text-text flex-1">Address</Text>
            <Pressable
              onPress={useMyLocation}
              disabled={locating}
              className={`flex-row items-center rounded-full px-2.5 py-1 active:opacity-80 ${locating ? 'bg-border' : 'bg-success/10'}`}
            >
              <Crosshair size={11} color={locating ? '#94A3B8' : '#10B981'} />
              <Text className={`text-[11px] font-bold ml-1 ${locating ? 'text-text-muted' : 'text-success'}`}>
                {locating ? 'Locating...' : 'Use my location'}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Field label="Pincode" required half>
                <IconInput
                  icon={Hash}
                  placeholder="Pincode"
                  keyboardType="number-pad"
                  value={data.pincode}
                  onChangeText={(v) => setData({ ...data, pincode: v })}
                />
              </Field>
            </View>
            <View className="px-1 flex-1">
              <Field label="Locality" half>
                <IconInput
                  icon={Building2}
                  placeholder="Area / Locality"
                  value={data.locality}
                  onChangeText={(v) => setData({ ...data, locality: v })}
                />
              </Field>
            </View>
          </View>

          <Field label="House / Street / Landmark" required>
            <Input
              placeholder="House no, building, street, landmark"
              value={data.addressLine}
              onChangeText={(v) => setData({ ...data, addressLine: v })}
              multiline
              numberOfLines={2}
              className={`${INPUT_CLS} min-h-[56px]`}
              style={{ textAlignVertical: 'top' }}
            />
          </Field>

          <View className="flex-row -mx-1">
            <View className="px-1 flex-1">
              <Field label="City / Town" half className="mb-0">
                <IconInput
                  icon={MapIcon}
                  placeholder="City"
                  value={data.city}
                  onChangeText={(v) => setData({ ...data, city: v })}
                />
              </Field>
            </View>
            <View className="px-1 flex-1">
              <Field label="State" half className="mb-0">
                <IconInput
                  icon={MapPin}
                  placeholder="State"
                  value={data.state}
                  onChangeText={(v) => setData({ ...data, state: v })}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Save as */}
        <View className="bg-card border border-border rounded-2xl p-3 mb-3">
          <View className="flex-row items-center mb-2.5">
            <View className="h-8 w-8 rounded-full bg-warning/10 items-center justify-center mr-2">
              <Tag size={14} color="#F59E0B" />
            </View>
            <Text className="text-[13px] font-extrabold text-text">Save as</Text>
          </View>
          <View className="flex-row -mx-1">
            {LABELS.map((l) => {
              const Icon = l.icon;
              const active = data.label === l.value;
              return (
                <View key={l.value} className="px-1 flex-1">
                  <Pressable
                    onPress={() => setData({ ...data, label: l.value })}
                    className={`rounded-xl border py-2.5 items-center flex-row justify-center ${active ? `${l.bg} border-primary` : 'bg-card border-border'}`}
                  >
                    <Icon size={14} color={active ? l.color : '#64748B'} />
                    <Text className={`text-[12px] font-bold ml-1.5 ${active ? l.text : 'text-text'}`}>{l.value}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomActionBar
        title={existing ? 'Update Address' : 'Save Address'}
        onPress={save}
        loading={saving}
      />
    </KeyboardAvoidingView>
  );
}
