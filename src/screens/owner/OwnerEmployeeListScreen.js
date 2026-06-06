import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ticketApi } from '../../api/client';
import { assignPickupPerson } from '../../api/orders';

const PLACEHOLDER_AVATAR = 'https://dummyassets.local/avatars/customer-1.png';
const PICKUP_ROLE = 'Pickup Person';

export default function OwnerEmployeeListScreen({ navigation, route }) {
  const assignFor = route?.params?.assignFor || null;
  const bookingId = route?.params?.bookingId || null;
  const isPickupPicker = assignFor === 'pickup' && !!bookingId;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [assigning, setAssigning] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await ticketApi.get('/technicians');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const onToggleActive = async (tech, value) => {
    setToggling(tech.id);
    try {
      await ticketApi.patch(`/technicians/${tech.id}`, {
        body: { isAvailable: value },
      });
      setList((prev) =>
        prev.map((t) => (t.id === tech.id ? { ...t, isAvailable: value } : t))
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update');
    } finally {
      setToggling(null);
    }
  };

  const goAddStaff = () => {
    navigation.navigate('OwnerEmployeeAdd');
  };

  const handlePickPickupPerson = async (tech) => {
    if (!isPickupPicker || assigning) return;
    setAssigning(tech.id);
    try {
      await assignPickupPerson(bookingId, {
        pickupPersonId: tech.id,
        pickupPersonName: tech.name || null,
        pickupPersonPhone: tech.phone || null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not assign', e?.body?.message || e?.message || 'Please try again.');
    } finally {
      setAssigning(null);
    }
  };

  // When opened as a pickup-person picker, hide everyone except staff with the
  // Pickup Person role so the owner can't mis-assign a technician.
  const visibleList = isPickupPicker
    ? list.filter((e) => (e.roleLabel || '').toLowerCase() === PICKUP_ROLE.toLowerCase())
    : list;

  if (loading && list.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator size="large" color="#3B4FD7" style={styles.loader} />
      </SafeAreaView>
    );
  }

  const activeCount = visibleList.filter((e) => e.isAvailable !== false).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="people" size={18} color="#111827" />
          <Text style={styles.sectionTitle}>
            {isPickupPicker ? 'Select Pickup Person' : 'All Employees'}
          </Text>
          {!isPickupPicker && visibleList.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {activeCount}/{visibleList.length}
              </Text>
            </View>
          )}
        </View>
        {isPickupPicker ? null : (
          <TouchableOpacity style={styles.addStaffBtn} onPress={goAddStaff} activeOpacity={0.85}>
            <Ionicons name="person-add" size={14} color="#FFFFFF" />
            <Text style={styles.addStaffText}>Add Staff</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        {visibleList.map((e) => {
          const isActive = e.isAvailable !== false;
          const initial = (e.name || '?').trim().charAt(0).toUpperCase();
          const role = e.roleLabel || 'Technician';
          const isPickup = role.toLowerCase() === PICKUP_ROLE.toLowerCase();
          return (
            <TouchableOpacity
              key={e.id}
              style={[styles.card, !isActive && styles.cardInactive]}
              onPress={() =>
                isPickupPicker
                  ? handlePickPickupPerson(e)
                  : navigation.navigate('OwnerEmployeeDetail', { employee: e })
              }
              activeOpacity={0.75}
              disabled={isPickupPicker && (assigning !== null || !isActive)}
            >
              <View style={[styles.avatar, isActive ? styles.avatarActive : styles.avatarInactive]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
                <View style={[styles.avatarDot, isActive && styles.avatarDotActive]} />
              </View>

              <View style={styles.meta}>
                <Text style={styles.name} numberOfLines={1}>
                  {e.name || '—'}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {e.phone || e.email || '—'}
                </Text>
                <View style={[styles.roleChip, isPickup && styles.roleChipPickup]}>
                  <Text style={[styles.roleChipText, isPickup && styles.roleChipTextPickup]}>
                    {role}
                  </Text>
                </View>
              </View>

              {isPickupPicker ? (
                <View style={styles.rightRow}>
                  {assigning === e.id ? (
                    <ActivityIndicator size="small" color="#3B4FD7" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#3B4FD7" />
                  )}
                </View>
              ) : (
                <View style={styles.rightRow}>
                  {toggling === e.id ? (
                    <ActivityIndicator size="small" color="#22C55E" style={styles.toggle} />
                  ) : (
                    <Switch
                      style={styles.toggle}
                      value={isActive}
                      onValueChange={(v) => onToggleActive(e, v)}
                      trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                      thumbColor={isActive ? '#22C55E' : '#9CA3AF'}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('OwnerEmployeeDetail', { employee: e })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        {visibleList.length === 0 && (
          <Text style={styles.empty}>
            {isPickupPicker
              ? 'No pickup persons yet. Add staff with the "Pickup Person" role first.'
              : 'No employees. Tap Add Staff to add.'}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  loader: { flex: 1, justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  countPill: {
    marginLeft: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  countPillText: { fontSize: 11, fontWeight: '600', color: '#3B4FD7' },
  addStaffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B4FD7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  addStaffText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardInactive: { opacity: 0.72 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarActive: { backgroundColor: '#EEF2FF' },
  avatarInactive: { backgroundColor: '#F3F4F6' },
  avatarInitial: { fontSize: 14, fontWeight: '700', color: '#3B4FD7' },
  avatarDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9CA3AF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarDotActive: { backgroundColor: '#22C55E' },
  meta: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  roleChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  roleChipPickup: { backgroundColor: '#FEF3C7' },
  roleChipText: { fontSize: 10, fontWeight: '600', color: '#4B5563' },
  roleChipTextPickup: { color: '#92400E' },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  toggle: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  editBtn: { padding: 4 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 24, fontSize: 13 },
});
