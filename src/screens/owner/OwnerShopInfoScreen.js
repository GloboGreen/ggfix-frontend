import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { fetchMe, updateOwnerShop } from '../../api/auth';
import { getSession } from '../../auth/session';
import { uploadMedia } from '../../api/masterData';

const ANDROID_SERVICES = [
  'Screen Repair',
  'Display Replacement',
  'Battery Replacement',
  'Charging Port Repair',
  'Camera Repair',
  'Water Damage Repair',
  'Audio Repair',
  'Button Repair',
  'Software Issues',
  'Data Recovery',
  'Phone Unlocking',
];

const APPLE_SERVICES = ANDROID_SERVICES;

export default function OwnerShopInfoScreen() {
  const [ownerId, setOwnerId] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [shopName, setShopName] = useState('');
  const [shopSince, setShopSince] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from /auth/me. fetchMe() merges the response into the session
    // and parks the active shop's FULL data on session.activeShop. After
    // hydration we pick view-mode if the shop already has saved details,
    // edit-mode otherwise.
    (async () => {
      const session = (await fetchMe().catch(() => null)) || (await getSession());
      const fullShop = session?.activeShop || null;
      setOwnerId(session?.userId || null);
      setShopId(fullShop?.id || null);
      if (fullShop) {
        setShopName(fullShop.name || '');
        setShopSince(fullShop.createdAt ? new Date(fullShop.createdAt).getFullYear().toString() : '');
        setAddressLine([fullShop.street, fullShop.address].filter(Boolean).join(', '));
        setCity(fullShop.area || fullShop.taluk || '');
        setDistrict(fullShop.district || '');
        setState(fullShop.state || '');
        setPincode(fullShop.pincode || '');
        setFrontImageUrl(fullShop.frontImageUrl || '');
        setBannerImageUrl(fullShop.bannerImageUrl || '');
        const looksComplete = !!(fullShop.name && (fullShop.address || fullShop.street) && fullShop.frontImageUrl);
        setEditing(!looksComplete);
      } else {
        setEditing(true);
      }
      setHydrated(true);
    })();
  }, []);

  const pickAndUpload = async (slot) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload shop images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: slot === 'banner' ? [16, 9] : [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const setBusy = slot === 'banner' ? setUploadingBanner : setUploadingFront;
    const setUrl = slot === 'banner' ? setBannerImageUrl : setFrontImageUrl;
    setBusy(true);
    try {
      const url = await uploadMedia(result.assets[0], `shops/${slot}`);
      if (!url) throw new Error('Upload returned no URL');
      setUrl(url);
    } catch (e) {
      Alert.alert('Upload failed', e?.message || 'Could not upload image. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!ownerId || !shopId) {
      Alert.alert('Not ready', 'Could not resolve your shop. Pull to refresh and try again.');
      return;
    }
    if (!frontImageUrl || !bannerImageUrl) {
      Alert.alert('Photos required', 'Please upload both shop front view and shop banner / visiting card.');
      return;
    }
    setSaving(true);
    try {
      await updateOwnerShop(ownerId, shopId, {
        name: shopName,
        address: addressLine,
        area: city,
        district,
        state,
        pincode,
        frontImageUrl,
        bannerImageUrl,
      });
      await fetchMe().catch(() => null);
      setEditing(false);
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const [androidSelected, setAndroidSelected] = useState(
    Object.fromEntries(ANDROID_SERVICES.map((s) => [s, true])),
  );
  const [appleSelected, setAppleSelected] = useState(
    Object.fromEntries(APPLE_SERVICES.map((s) => [s, true])),
  );

  const toggleAndroid = (key) =>
    setAndroidSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleApple = (key) =>
    setAppleSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const fullAddress = useMemo(() => {
    const parts = [addressLine, city, district, state, pincode].filter(Boolean);
    return parts.join(', ');
  }, [addressLine, city, district, state, pincode]);

  const activeAndroid = ANDROID_SERVICES.filter((s) => androidSelected[s]);
  const activeApple = APPLE_SERVICES.filter((s) => appleSelected[s]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#1D4ED8" />
        </View>
      </SafeAreaView>
    );
  }

  if (!editing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.viewHeaderCard}>
            <Ionicons name="storefront-outline" size={22} color="#111827" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.viewHeaderTitle}>Shop name &amp; Since</Text>
              <Text style={styles.viewHeaderValue}>
                {shopName || '—'}{shopSince ? `   ${shopSince}` : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={14} color="#FFFFFF" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewCard}>
            <View style={styles.viewCardTitleRow}>
              <Ionicons name="construct-outline" size={16} color="#1D4ED8" />
              <Text style={styles.viewCardTitle}>Repair Service Categories</Text>
            </View>
            <View style={styles.categoryRow}>
              <View style={styles.categoryCol}>
                <Text style={styles.categoryHeader}>Android Repair</Text>
                <Text style={styles.categorySub}>Mobile / Tablet</Text>
                {activeAndroid.map((s) => (
                  <Text key={s} style={styles.viewListItem}>{s}</Text>
                ))}
              </View>
              <View style={styles.categoryCol}>
                <Text style={[styles.categoryHeader, { backgroundColor: '#16A34A' }]}>Apple Repair</Text>
                <Text style={styles.categorySub}>iphone / Tablet</Text>
                {activeApple.map((s) => (
                  <Text key={s} style={styles.viewListItem}>{s}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.viewCard}>
            <View style={styles.viewCardTitleRow}>
              <Ionicons name="location-outline" size={16} color="#111827" />
              <Text style={styles.viewCardTitle}>Shop Address</Text>
            </View>
            <Text style={styles.viewAddressText}>{fullAddress || '—'}</Text>
          </View>

          <View style={styles.viewCard}>
            <View style={styles.viewCardTitleRow}>
              <Ionicons name="camera-outline" size={16} color="#111827" />
              <Text style={styles.viewCardTitle}>
                Shop Photos <Text style={{ color: '#DC2626' }}>*</Text>
              </Text>
              {(!frontImageUrl || !bannerImageUrl) ? (
                <Text style={styles.photoWarn}>Both photos required</Text>
              ) : null}
            </View>
            <View style={styles.photosRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.viewPhotoLabel}>Shop Front View</Text>
                {frontImageUrl ? (
                  <Image source={{ uri: frontImageUrl }} style={styles.viewPhotoImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.viewPhotoImg, styles.viewPhotoEmpty]}>
                    <Ionicons name="image-outline" size={22} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.viewPhotoLabel}>Shop Banner or Visiting Card</Text>
                {bannerImageUrl ? (
                  <Image source={{ uri: bannerImageUrl }} style={styles.viewPhotoImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.viewPhotoImg, styles.viewPhotoEmpty]}>
                    <Ionicons name="image-outline" size={22} color="#9CA3AF" />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Shop Info</Text>
          <Field label="Shop name" value={shopName} onChangeText={setShopName} />
          <Field label="Shop Since" value={shopSince} onChangeText={setShopSince} keyboardType="number-pad" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Repair Service Categories</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryCol}>
              <Text style={styles.categoryHeader}>Android Repair</Text>
              {ANDROID_SERVICES.map((name) => (
                <ServiceRow
                  key={name}
                  label={name}
                  active={androidSelected[name]}
                  onPress={() => toggleAndroid(name)}
                />
              ))}
            </View>
            <View style={styles.categoryCol}>
              <Text style={[styles.categoryHeader, { backgroundColor: '#16A34A' }]}>
                Apple Repair
              </Text>
              {APPLE_SERVICES.map((name) => (
                <ServiceRow
                  key={name}
                  label={name}
                  active={appleSelected[name]}
                  onPress={() => toggleApple(name)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop Address</Text>
          <Field label="Address" value={addressLine} onChangeText={setAddressLine} />
          <View style={styles.row2}>
            <Field small label="City" value={city} onChangeText={setCity} />
            <Field small label="District" value={district} onChangeText={setDistrict} />
          </View>
          <View style={styles.row2}>
            <Field small label="State" value={state} onChangeText={setState} />
            <Field small label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Shop Photos</Text>
          <View style={styles.photosRow}>
            <PhotoBox
              label="Shop Front View"
              url={frontImageUrl}
              busy={uploadingFront}
              onPress={() => pickAndUpload('front')}
            />
            <PhotoBox
              label="Shop Banner or Visiting Card"
              url={bannerImageUrl}
              busy={uploadingBanner}
              onPress={() => pickAndUpload('banner')}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.6 }]}
          disabled={saving}
          onPress={handleSave}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Shop details Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, small, ...inputProps }) {
  return (
    <View style={[{ marginBottom: 8 }, small && { flex: 1, marginRight: 8 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
    </View>
  );
}

function ServiceRow({ label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.serviceRow} onPress={onPress}>
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function PhotoBox({ label, url, busy, onPress }) {
  return (
    <TouchableOpacity style={styles.photoBox} onPress={onPress} disabled={busy} activeOpacity={0.7}>
      {url ? (
        <Image source={{ uri: url }} style={styles.photoImg} resizeMode="cover" />
      ) : (
        <Ionicons name="camera-outline" size={24} color="#4B5563" />
      )}
      <Text style={styles.photoLabel} numberOfLines={1}>{label}</Text>
      {busy ? (
        <View style={styles.photoOverlay}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : (
        <Text style={styles.photoHint}>{url ? 'Tap to change' : 'Not uploaded yet'}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  row2: { flexDirection: 'row' },
  categoryRow: { flexDirection: 'row', marginTop: 8 },
  categoryCol: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryHeader: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  categorySub: { fontSize: 10, color: '#FFFFFF', textAlign: 'center', backgroundColor: '#16A34A', paddingBottom: 4 },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioOuterActive: { borderColor: '#16A34A' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  serviceLabel: { fontSize: 12, color: '#111827' },
  photosRow: { flexDirection: 'row', marginTop: 6, gap: 8 },
  photoBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  photoLabel: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 4 },
  photoHint: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  photoImg: { width: '100%', height: 110, borderRadius: 8, marginBottom: 4, backgroundColor: '#F3F4F6' },
  photoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  // View (read-only) mode
  viewHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewHeaderTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  viewHeaderValue: { fontSize: 12, color: '#374151', marginTop: 2 },
  editBtn: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  viewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  viewCardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  viewCardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', flex: 1 },
  viewListItem: { fontSize: 12, color: '#111827', paddingHorizontal: 8, paddingVertical: 3 },
  viewAddressText: { fontSize: 12, color: '#111827', lineHeight: 18 },
  viewPhotoLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  viewPhotoImg: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#F3F4F6' },
  viewPhotoEmpty: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' },
  photoWarn: { fontSize: 11, color: '#DC2626', fontWeight: '700' },
});
