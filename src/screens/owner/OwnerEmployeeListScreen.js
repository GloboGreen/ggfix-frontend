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

const PLACEHOLDER_AVATAR = 'https://dummyassets.local/avatars/customer-1.png';

export default function OwnerEmployeeListScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(null);

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

  if (loading && list.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator size="large" color="#3B4FD7" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="people" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>All Employees</Text>
        </View>
        <TouchableOpacity style={styles.addStaffBtn} onPress={goAddStaff}>
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
          <Text style={styles.addStaffText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        {list.map((e) => (
          <View key={e.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardMain}
              onPress={() => navigation.navigate('OwnerEmployeeDetail', { employee: e })}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrap}>
                <View style={styles.avatar} />
              </View>
              <View style={styles.meta}>
                <Text style={styles.name}>{e.name || '—'}</Text>
                <Text style={styles.phone}>{e.phone || e.email || '—'}</Text>
                <Text style={styles.role}>{e.roleLabel || 'Technician'}</Text>
              </View>
              <View style={styles.rightRow}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, e.isAvailable !== false && styles.statusDotActive]} />
                  <Text style={[styles.statusText, e.isAvailable !== false && styles.statusTextActive]}>
                    {e.isAvailable !== false ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                {toggling === e.id ? (
                  <ActivityIndicator size="small" color="#22C55E" />
                ) : (
                  <Switch
                    value={e.isAvailable !== false}
                    onValueChange={(v) => onToggleActive(e, v)}
                    trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                    thumbColor={e.isAvailable !== false ? '#22C55E' : '#9CA3AF'}
                  />
                )}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('OwnerEmployeeDetail', { employee: e })}
                >
                  <Ionicons name="open-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        ))}
        {list.length === 0 && (
          <Text style={styles.empty}>No employees. Tap Add Staff to add.</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addStaffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B4FD7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  addStaffText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarWrap: { marginRight: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  phone: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  role: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  statusDotActive: { backgroundColor: '#22C55E' },
  statusText: { fontSize: 12, color: '#9CA3AF' },
  statusTextActive: { color: '#22C55E' },
  editBtn: { padding: 4 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 24 },
});
