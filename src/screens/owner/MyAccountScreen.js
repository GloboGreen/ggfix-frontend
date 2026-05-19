import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSession } from '../../auth/session';

export default function MyAccountScreen({ onLogout, navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getSession().then(setUser).catch(() => setUser(null));
  }, []);

  const shopName = user?.shopName || 'Green Mobiles';
  const ownerName = user?.name || 'Nandhakumar S';
  const phone = user?.phone || '+91 89396 15914';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: 'https://dummyassets.local/owners/nandha.png' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.ownerName}>{ownerName}</Text>
            <Text style={styles.phone}>{phone}</Text>
            <Text style={styles.shopName}>{shopName}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Profile</Text>
        <MenuItem
          icon={<MaterialCommunityIcons name="pencil-outline" size={22} color="#0F172A" />}
          label="Personal Information"
          onPress={() => navigation?.navigate?.('OwnerPersonalInfo')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="qrcode" size={22} color="#0F172A" />}
          label="My QR Code"
          onPress={() => navigation?.navigate?.('OwnerQrCode')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="storefront-outline" size={22} color="#0F172A" />}
          label="Shop Information"
          onPress={() => navigation?.navigate?.('OwnerShopInfo')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="file-document-outline" size={22} color="#0F172A" />}
          label="KYC Documents"
          onPress={() => navigation?.navigate?.('OwnerKycIntro')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#0F172A" />}
          label="Service Pickup Options"
          onPress={() => navigation?.navigate?.('OwnerPickupOptions')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="account-group-outline" size={22} color="#0F172A" />}
          label="Employee Management"
          onPress={() => navigation?.navigate?.('OwnerEmployeeList')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="calendar-clock-outline" size={22} color="#0F172A" />}
          label="Leave requests"
          onPress={() => navigation?.navigate?.('OwnerLeaveRequests')}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>More</Text>
        <MenuItem
          icon={
            <MaterialCommunityIcons
              name="file-document-multiple-outline"
              size={22}
              color="#0F172A"
            />
          }
          label="Terms & condition"
        />
        <MenuItem
          icon={<Ionicons name="lock-closed-outline" size={22} color="#0F172A" />}
          label="Privacy policy"
        />
        <MenuItem
          icon={<Ionicons name="help-circle-outline" size={22} color="#0F172A" />}
          label="FAQs"
        />
        <MenuItem
          icon={<Ionicons name="call-outline" size={22} color="#0F172A" />}
          label="Help"
        />

        {onLogout ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconWrap}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  avatarWrap: { marginRight: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  headerTextWrap: { flex: 1 },
  ownerName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  phone: { fontSize: 14, color: '#4B5563', marginTop: 2 },
  shopName: { fontSize: 14, color: '#16A34A', marginTop: 2 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  verifiedText: { marginLeft: 4, fontSize: 12, color: '#16A34A', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#111827' },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#fff' },
});

