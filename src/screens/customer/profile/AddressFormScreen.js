import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import {
  User,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Tag,
  Crosshair,
  Building2,
  Hash,
  Map as MapIcon,
  Navigation,
} from 'lucide-react-native';
import { Input, BottomActionBar } from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { createAddress, updateAddress } from '../../../api/customer';
import { selectSession } from '../../../store/authSlice';

const LABEL_OPTIONS = [
  { value: 'Home',   icon: Home,       color: '#00008B', tint: '#EEF2FF' },
  { value: 'Office', icon: Briefcase,  color: '#2563EB', tint: '#DBEAFE' },
  { value: 'Other',  icon: Tag,        color: '#F59E0B', tint: '#FEF3C7' },
];

function SectionCard({ icon: Icon, iconColor, iconBg, title, subtitle, right, children }) {
  return (
    <View
      className="bg-card border border-border rounded-2xl p-4 mb-3"
      style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
    >
      <View className="flex-row items-center mb-3">
        <View className="h-9 w-9 rounded-full items-center justify-center mr-2.5" style={{ backgroundColor: iconBg }}>
          <Icon size={16} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-extrabold text-text">{title}</Text>
          {subtitle ? <Text className="text-[11px] text-text-muted mt-0.5">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <View className="mb-3">
      <Text className="text-[12px] font-semibold text-text-muted mb-1.5">
        {label}{required ? <Text className="text-danger"> *</Text> : null}
      </Text>
      {children}
      {hint ? <Text className="text-[10px] text-text-muted mt-1">{hint}</Text> : null}
    </View>
  );
}

function IconInput({ icon: Icon, error, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? 'border-danger' : focused ? 'border-primary' : 'border-border';
  return (
    <View
      className={`flex-row items-center bg-card border ${borderColor} rounded-xl px-3.5`}
      style={focused ? { shadowColor: '#00008B', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 } : null}
    >
      <Icon size={15} color={focused ? '#00008B' : '#64748B'} />
      <Input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className="flex-1 bg-transparent border-0 ml-2.5 py-2.5 text-[14px]"
      />
    </View>
  );
}

export default function AddressFormScreen({ navigation, route }) {
  const existing = route?.params?.address;
  const session = useSelector(selectSession);
  const { width } = useWindowDimensions();
  // For a new address, seed contact from the logged-in customer's profile so
  // they don't retype name/mobile every time. For an edit, the existing
  // address's values win.
  const [data, setData] = useState({
    label: existing?.label || 'Home',
    fullName: existing?.fullName || session?.fullName || '',
    mobile: existing?.mobile || session?.mobile || '',
    pincode: existing?.pincode || '',
    locality: existing?.locality || '',
    addressLine: existing?.addressLine || '',
    city: existing?.city || '',
    state: existing?.state || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Stack two-up fields vertically below ~360 dp; gives long city/state names
  // room to breathe on Android phones with narrow screens.
  const wideEnough = width >= 360;

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit Address' : 'Add Address' });
  }, [navigation, existing]);

  const setField = (k, v) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async () => {
    const next = {};
    if (!data.fullName.trim()) next.fullName = 'Required';
    if (!data.mobile.trim()) next.mobile = 'Required';
    else if (!/^[6-9]\d{9}$/.test(data.mobile.trim())) next.mobile = 'Enter a 10-digit Indian mobile';
    if (!data.pincode.trim()) next.pincode = 'Required';
    if (!data.addressLine.trim()) next.addressLine = 'Required';
    setErrors(next);
    if (Object.keys(next).length) {
      notify('Check the form', 'Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      if (existing?.id) await updateAddress(existing.id, data);
      else await createAddress(data);
      navigation.goBack();
    } catch (e) {
      const msg = e?.message || 'Could not save the address.';
      notify('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  // Fill in pincode/locality/city/state from a (lat, lng). Uses expo-location's
  // native reverse geocoder first (works offline, no rate limits), then falls
  // back to Nominatim if the native one can't resolve a pincode.
  const fillFromCoords = async (latitude, longitude) => {
    let filled = false;
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const a = (places && places[0]) || null;
      if (a) {
        setData((d) => ({
          ...d,
          pincode: a.postalCode || d.pincode,
          locality: a.district || a.subregion || a.name || d.locality,
          addressLine: [a.name, a.street, a.district].filter(Boolean).join(', ') || d.addressLine,
          city: a.city || a.subregion || d.city,
          state: a.region || d.state,
        }));
        filled = !!(a.postalCode || a.city || a.region);
      }
    } catch (_) { /* fall through to Nominatim */ }
    if (!filled) {
      try {
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
          filled = true;
        }
      } catch (_) { /* swallow */ }
    }
    if (!filled) {
      notify('Location captured', `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}. Couldn't look up the address — fill the rest manually.`);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== 'granted') {
        notify('Location blocked', 'Please allow location access from your device settings to autofill your address.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude, accuracy } = pos.coords;

      const ACCURACY_MAX_METERS = 5000;
      if (accuracy && accuracy > ACCURACY_MAX_METERS) {
        notify(
          'Location too imprecise',
          `Got a fix accurate only to ~${Math.round(accuracy / 1000)} km. Fill the address manually so shop distances stay accurate.`,
        );
        return;
      }

      await fillFromCoords(latitude, longitude);
    } catch (e) {
      notify('Could not get your location', e?.message || 'Please fill the address manually.');
    } finally {
      setLocating(false);
    }
  };

  const TwoCol = ({ children }) => (
    <View className={wideEnough ? 'flex-row -mx-1.5' : ''}>
      {React.Children.map(children, (child, idx) => (
        <View className={wideEnough ? 'px-1.5 flex-1' : ''} key={idx}>{child}</View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 130 }}
      >
        {/* Intro */}
        <View className="mb-3 px-1">
          <Text className="text-[18px] font-extrabold text-text">
            {existing ? 'Update your address' : 'Where should we deliver?'}
          </Text>
          <Text className="text-[12px] text-text-muted mt-0.5">
            We use this for pickup, delivery and nearby shop distances.
          </Text>
        </View>

        {/* Contact */}
        <SectionCard
          icon={User}
          iconColor="#00008B"
          iconBg="#EEF2FF"
          title="Contact"
          subtitle="Who should the delivery agent call?"
        >
          <Field label="Full Name" required>
            <IconInput
              icon={User}
              placeholder="Recipient full name"
              value={data.fullName}
              onChangeText={(v) => setField('fullName', v)}
              error={errors.fullName}
            />
            {errors.fullName ? <Text className="text-[10px] text-danger mt-1">{errors.fullName}</Text> : null}
          </Field>
          <Field label="Mobile Number" required>
            <IconInput
              icon={Phone}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={data.mobile}
              onChangeText={(v) => setField('mobile', v.replace(/\D/g, ''))}
              error={errors.mobile}
            />
            {errors.mobile ? <Text className="text-[10px] text-danger mt-1">{errors.mobile}</Text> : null}
          </Field>
        </SectionCard>

        {/* Address */}
        <SectionCard
          icon={MapPin}
          iconColor="#10B981"
          iconBg="#D1FAE5"
          title="Address"
          subtitle="House, street, area & PIN code"
        >
          {/* Full-width prominent "Use my location" CTA */}
          <Pressable
            onPress={useMyLocation}
            disabled={locating}
            className={`flex-row items-center justify-center rounded-xl mb-3 py-3 active:opacity-80 ${locating ? 'bg-background border border-border' : 'bg-success/10 border border-success/30'}`}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Navigation size={15} color="#10B981" />
            )}
            <Text className={`ml-2 text-[13px] font-extrabold ${locating ? 'text-text-muted' : 'text-success'}`}>
              {locating ? 'Detecting your location…' : 'Use my current location'}
            </Text>
            {!locating ? <Crosshair size={13} color="#10B981" style={{ marginLeft: 6 }} /> : null}
          </Pressable>

          <TwoCol>
            <Field label="Pincode" required>
              <IconInput
                icon={Hash}
                placeholder="6-digit PIN"
                keyboardType="number-pad"
                maxLength={6}
                value={data.pincode}
                onChangeText={(v) => setField('pincode', v.replace(/\D/g, ''))}
                error={errors.pincode}
              />
              {errors.pincode ? <Text className="text-[10px] text-danger mt-1">{errors.pincode}</Text> : null}
            </Field>
            <Field label="Locality / Area">
              <IconInput
                icon={Building2}
                placeholder="e.g. Anna Nagar"
                value={data.locality}
                onChangeText={(v) => setField('locality', v)}
              />
            </Field>
          </TwoCol>

          <Field label="House / Street / Landmark" required>
            <View
              className={`bg-card border rounded-xl px-3.5 py-2.5 ${errors.addressLine ? 'border-danger' : 'border-border'}`}
            >
              <Input
                placeholder="House no, building, street, landmark"
                value={data.addressLine}
                onChangeText={(v) => setField('addressLine', v)}
                multiline
                numberOfLines={3}
                className="bg-transparent border-0 py-0 text-[14px] min-h-[60px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            {errors.addressLine ? <Text className="text-[10px] text-danger mt-1">{errors.addressLine}</Text> : null}
          </Field>

          <TwoCol>
            <Field label="City / Town">
              <IconInput
                icon={MapIcon}
                placeholder="City"
                value={data.city}
                onChangeText={(v) => setField('city', v)}
              />
            </Field>
            <Field label="State">
              <IconInput
                icon={MapPin}
                placeholder="State"
                value={data.state}
                onChangeText={(v) => setField('state', v)}
              />
            </Field>
          </TwoCol>
        </SectionCard>

        {/* Save as */}
        <SectionCard
          icon={Tag}
          iconColor="#F59E0B"
          iconBg="#FEF3C7"
          title="Save as"
          subtitle="Pick a label so you can find it later"
        >
          <View className="flex-row -mx-1">
            {LABEL_OPTIONS.map((l) => {
              const Icon = l.icon;
              const active = data.label === l.value;
              return (
                <View key={l.value} className="px-1 flex-1">
                  <Pressable
                    onPress={() => setField('label', l.value)}
                    className={`rounded-xl border py-3 px-2 items-center flex-row justify-center ${active ? '' : 'bg-card border-border'}`}
                    style={active ? { backgroundColor: l.tint, borderColor: l.color } : null}
                  >
                    <Icon size={15} color={active ? l.color : '#64748B'} />
                    <Text
                      className={`text-[13px] font-extrabold ml-1.5 ${active ? '' : 'text-text'}`}
                      style={active ? { color: l.color } : null}
                    >
                      {l.value}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </SectionCard>
      </ScrollView>

      <BottomActionBar
        title={existing ? 'Update Address' : 'Save Address'}
        onPress={save}
        loading={saving}
      />
    </KeyboardAvoidingView>
  );
}
