import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSession } from '../../auth/session';
import { switchShop, fetchMe } from '../../api/auth';
import { listShopKycDocuments } from '../../api/shops';

const PRIMARY = '#00008B';
const PRIMARY_MID = '#1E1EAC';
const PRIMARY_LIGHT = '#2563EB';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const BG = '#F1F5F9';
const SUCCESS = '#10B981';
const DANGER = '#DC2626';

function initialsOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MyAccountScreen({ onLogout, navigation }) {
  const [user, setUser] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  // null = unknown (haven't checked yet); true/false once we know.
  const [hasKycDocs, setHasKycDocs] = useState(null);

  const reloadSession = async () => {
    // Prefer live /auth/me so the screen reflects DB state (shopName, shops,
    // phone, avatar...) — heals old sessions taken before LoginResponse grew.
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      try { setUser(await getSession()); } catch { setUser(null); }
    }
  };

  useEffect(() => { reloadSession(); }, []);

  // Refresh KYC submission status whenever this screen comes into focus, so the
  // KYC Documents row can route the user to View (already uploaded) vs Intro
  // (first time) without a manual reload.
  useFocusEffect(
    useCallback(() => {
      const sid = user?.shopId;
      if (!sid) return;
      let cancelled = false;
      (async () => {
        try {
          const list = await listShopKycDocuments(sid);
          if (!cancelled) setHasKycDocs(Array.isArray(list) && list.length > 0);
        } catch {
          if (!cancelled) setHasKycDocs(false);
        }
      })();
      return () => { cancelled = true; };
    }, [user?.shopId])
  );

  const ownerName = user?.name || 'Shop Owner';
  const shopName = user?.shopName || (user?.shops?.find?.((s) => s.isActive)?.name) || '';
  const phone = user?.phone || '';
  const shops = user?.shops || [];
  const hasMultipleShops = shops.length > 1;
  const initials = useMemo(() => initialsOf(ownerName), [ownerName]);

  const handleSwitch = async (shopId) => {
    if (!shopId || shopId === user?.shopId) { setShowSwitcher(false); return; }
    setSwitching(true);
    try {
      await switchShop(shopId);
      await reloadSession();
      setShowSwitcher(false);
    } catch (e) {
      setShowSwitcher(false);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Gradient header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: PRIMARY }}>
        <LinearGradient
          colors={[PRIMARY, PRIMARY_MID, PRIMARY_LIGHT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerBlobOne} pointerEvents="none" />
          <View style={styles.headerBlobTwo} pointerEvents="none" />
          <Text style={styles.headerTitle}>My Account</Text>
          <Text style={styles.headerSubtitle}>Manage your profile, shop and team</Text>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{ownerName}</Text>
              <View style={styles.verifiedPill}>
                <Ionicons name="shield-checkmark" size={10} color={SUCCESS} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>
            {phone ? <Text style={styles.phone}>{phone}</Text> : null}
            <Pressable
              style={styles.shopRow}
              onPress={() => hasMultipleShops && setShowSwitcher(true)}
              disabled={!hasMultipleShops}
            >
              <Ionicons name="storefront-outline" size={12} color={MUTED} />
              <Text style={styles.shopName} numberOfLines={1}>{shopName || 'No shop linked'}</Text>
              {hasMultipleShops ? (
                <View style={styles.switchPill}>
                  <Ionicons name="swap-horizontal" size={11} color={PRIMARY} />
                  <Text style={styles.switchPillText}>Switch ({shops.length})</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* Shop switcher modal */}
        <Modal visible={showSwitcher} transparent animationType="fade" onRequestClose={() => setShowSwitcher(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowSwitcher(false)}>
            <Pressable style={styles.switcherSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.switcherHeader}>
                <Text style={styles.switcherTitle}>Switch Shop</Text>
                <Pressable onPress={() => setShowSwitcher(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={TEXT} />
                </Pressable>
              </View>
              <Text style={styles.switcherSubtitle}>Choose which of your shops to manage.</Text>
              {shops.map((s) => {
                const active = s.id === user?.shopId;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => handleSwitch(s.id)}
                    disabled={switching || active}
                    style={[styles.switcherRow, active && styles.switcherRowActive]}
                  >
                    <View style={styles.switcherIcon}>
                      <Ionicons name="storefront" size={16} color={active ? '#fff' : PRIMARY} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.switcherName, active && { color: PRIMARY }]} numberOfLines={1}>{s.name}</Text>
                      <Text style={styles.switcherSlug} numberOfLines={1}>{s.slug}</Text>
                    </View>
                    {active ? (
                      <View style={styles.activeTick}>
                        <Ionicons name="checkmark" size={14} color={SUCCESS} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
              {switching ? (
                <View style={styles.switcherLoading}>
                  <ActivityIndicator color={PRIMARY} />
                  <Text style={styles.switcherLoadingText}>Switching…</Text>
                </View>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>

        {/* My Profile group */}
        <SectionLabel>My Profile</SectionLabel>
        <View style={styles.card}>
          <MenuRow
            icon="person-circle-outline"
            label="Personal Information"
            onPress={() => navigation?.navigate?.('OwnerPersonalInfo')}
          />
          <MenuRow
            mci="qrcode"
            label="My QR Code"
            onPress={() => navigation?.navigate?.('OwnerQrCode')}
          />
          <MenuRow
            mci="storefront-outline"
            label="Shop Information"
            onPress={() => navigation?.navigate?.('OwnerShopInfo')}
          />
          <MenuRow
            mci="file-document-outline"
            label="KYC Documents"
            onPress={() => navigation?.navigate?.(hasKycDocs ? 'OwnerKycView' : 'OwnerKycIntro')}
          />
          <MenuRow
            mci="truck-delivery-outline"
            label="Service Pickup Options"
            onPress={() => navigation?.navigate?.('OwnerPickupSlots')}
          />
          <MenuRow
            mci="package-variant-closed"
            label="My Orders"
            onPress={() => navigation?.navigate?.('MarketplaceOrders')}
          />
          <MenuRow
            mci="account-group-outline"
            label="Employee Management"
            onPress={() => navigation?.navigate?.('OwnerEmployeeList')}
          />
          <MenuRow
            mci="calendar-clock-outline"
            label="Leave Requests"
            onPress={() => navigation?.navigate?.('OwnerLeaveRequests')}
            last
          />
        </View>

        {/* More group */}
        <SectionLabel>More</SectionLabel>
        <View style={styles.card}>
          <MenuRow mci="file-document-multiple-outline" label="Terms & Conditions" />
          <MenuRow icon="lock-closed-outline" label="Privacy Policy" />
          <MenuRow icon="help-circle-outline" label="FAQs" />
          <MenuRow icon="call-outline" label="Help & Support" last />
        </View>

        {onLogout ? (
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="log-out-outline" size={18} color={DANGER} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
}

function MenuRow({ icon, mci, label, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: '#F8FAFC' },
      ]}
    >
      <View style={styles.menuIcon}>
        {mci ? (
          <MaterialCommunityIcons name={mci} size={16} color={PRIMARY} />
        ) : (
          <Ionicons name={icon} size={16} color={PRIMARY} />
        )}
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={MUTED} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 26,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  headerBlobOne: {
    position: 'absolute',
    right: -30,
    top: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  headerBlobTwo: {
    position: 'absolute',
    left: -40,
    bottom: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    marginTop: -16,
  },

  // Identity card
  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  identityText: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '800', color: TEXT, marginRight: 6 },
  phone: { fontSize: 12, color: MUTED, marginTop: 2, fontWeight: '600' },
  shopRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  shopName: { fontSize: 12, color: MUTED, marginLeft: 4, fontWeight: '600' },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  switchPillText: { fontSize: 10, color: PRIMARY, fontWeight: '700', marginLeft: 3 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  switcherSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  switcherHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switcherTitle: { fontSize: 16, fontWeight: '800', color: TEXT },
  switcherSubtitle: { fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 10 },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  switcherRowActive: { borderColor: PRIMARY, backgroundColor: '#EEF2FF' },
  switcherIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  switcherName: { fontSize: 14, fontWeight: '700', color: TEXT },
  switcherSlug: { fontSize: 11, color: MUTED, marginTop: 1 },
  activeTick: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#D1FAE5',
    alignItems: 'center', justifyContent: 'center',
  },
  switcherLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  switcherLoadingText: { fontSize: 12, color: MUTED, marginLeft: 6 },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 8.5,
    color: '#047857',
    fontWeight: '800',
    marginLeft: 2,
    letterSpacing: 0.4,
  },

  // Section labels
  sectionLabelRow: { marginBottom: 6, marginLeft: 4, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Card groups
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    overflow: 'hidden',
  },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuLabel: { flex: 1, fontSize: 13.5, color: TEXT, fontWeight: '600' },

  // Logout
  logoutBtn: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: DANGER },
});
