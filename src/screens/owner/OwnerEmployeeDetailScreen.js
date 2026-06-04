import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authApi, ticketApi } from '../../api/client';
import { selectShopId } from '../../store/authSlice';

const ROLES = ['Junior Technician', 'Technician', 'Senior Technician', 'Employee'];
const ID_TYPES = ['Aadhar', 'PAN'];
const SALARY_PERIODS = ['Monthly', 'Weekly'];

export default function OwnerEmployeeDetailScreen({ route, navigation }) {
  const shopId = useSelector(selectShopId);
  const employee = route.params?.employee;
  const mode = route.params?.mode || (employee ? 'view' : 'add');
  const isAdd = mode === 'add';

  const [active, setActive] = useState(employee?.isAvailable !== false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: employee?.name ?? '',
    phone: employee?.phone ?? '',
    email: employee?.email ?? '',
    password: '',
    roleLabel: employee?.roleLabel ?? 'Technician',
    salaryAmount: employee?.salaryAmount ?? '',
    salaryPeriod: employee?.salaryPeriod ?? 'Monthly',
    idVerificationType: employee?.idVerificationType ?? '',
    idNumber: employee?.idNumber ?? '',
    dateOfBirth: employee?.dateOfBirth ?? '',
    dateOfJoin: employee?.dateOfJoin ?? '',
    defaultCheckIn: employee?.defaultCheckIn ?? '09:30',
    defaultCheckOut: employee?.defaultCheckOut ?? '18:30',
    photoUrl: employee?.photoUrl ?? '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSaveNew = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Required', 'Enter employee name');
      return;
    }
    const withLogin = form.email?.trim() && form.password?.trim();
    if (withLogin && form.password.length < 4) {
      Alert.alert('Validation', 'Password must be at least 4 characters');
      return;
    }
    setSaving(true);
    try {
      let userId = null;
      if (withLogin) {
        if (!shopId) {
          Alert.alert('Error', 'Session expired. Please log in again.');
          setSaving(false);
          return;
        }
        try {
          const authRes = await authApi.post(`/auth/shops/${shopId}/technicians`, {
            body: {
              email: form.email.trim(),
              password: form.password,
              name: form.name.trim(),
            },
          });
          userId = authRes?.userId;
        } catch (authErr) {
          const msg = authErr?.message || authErr?.payload?.message || '';
          const isShopNotFound = msg.includes('Shop not found') || (authErr?.status === 400 && String(msg).toLowerCase().includes('shop'));
          if (isShopNotFound) {
            Alert.alert(
              'Shop not found',
              'Your session may be from another server or the shop was reset. You can add this employee without app login now, or log out and log in again to fix the session.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) },
                {
                  text: 'Add without login',
                  onPress: () => {
                    setSaving(true);
                    doCreateEmployee(null);
                  },
                },
              ]
            );
            return;
          }
          throw authErr;
        }
      }
      await doCreateEmployee(userId);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  const doCreateEmployee = async (userId) => {
    try {
      const withLogin = !!userId;
      const body = {
        name: form.name.trim(),
        phone: (form.phone && form.phone.trim()) || null,
        email: (form.email && form.email.trim()) || null,
        roleLabel: (form.roleLabel && form.roleLabel.trim()) || null,
        salaryAmount: (form.salaryAmount && form.salaryAmount.trim()) || null,
        salaryPeriod: (form.salaryPeriod && form.salaryPeriod.trim()) || null,
        idVerificationType: (form.idVerificationType && form.idVerificationType.trim()) || null,
        idNumber: (form.idNumber && form.idNumber.trim()) || null,
        dateOfBirth: (form.dateOfBirth && form.dateOfBirth.trim()) || null,
        dateOfJoin: (form.dateOfJoin && form.dateOfJoin.trim()) || null,
        defaultCheckIn: (form.defaultCheckIn && form.defaultCheckIn.trim()) || null,
        defaultCheckOut: (form.defaultCheckOut && form.defaultCheckOut.trim()) || null,
        photoUrl: (form.photoUrl && form.photoUrl.trim()) || null,
      };
      if (userId) body.userId = userId;
      const created = await ticketApi.post('/technicians', {
        body,
      });
      setSaving(false);
      const message = withLogin
        ? 'Employee added. They can log in with email and password.'
        : 'Employee added.';
      requestAnimationFrame(() => {
        navigation.navigate('OwnerEmployeeCreated', {
          employee: created || { name: form.name.trim(), roleLabel: form.roleLabel },
          message,
        });
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (value) => {
    if (!employee?.id) return;
    setActive(value);
    try {
      await ticketApi.patch(`/technicians/${employee.id}`, {
        body: { isAvailable: value },
      });
    } catch (e) {
      setActive(!value);
      Alert.alert('Error', e.message || 'Failed to update');
    }
  };

  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const loadProfileData = useCallback(async () => {
    if (!employee?.id) return;
    try {
      const now = new Date();
      const [att, adv, leaves] = await Promise.all([
        ticketApi.get(`/technicians/${employee.id}/attendance`, { query: { month: now.getMonth() + 1, year: now.getFullYear() } }).catch(() => null),
        ticketApi.get(`/technicians/${employee.id}/advances`).catch(() => []),
        ticketApi.get(`/technicians/${employee.id}/leaves`, { query: { month: now.getMonth() + 1, year: now.getFullYear() } }).catch(() => []),
      ]);
      setAttendanceSummary(att || null);
      setAdvances(Array.isArray(adv) ? adv : []);
      setRecentLeaves(Array.isArray(leaves) ? leaves : []);
    } catch (_) {}
  }, [employee?.id]);
  useEffect(() => {
    if (employee?.id && !isAdd) loadProfileData();
  }, [employee?.id, isAdd, loadProfileData]);
  useFocusEffect(useCallback(() => {
    if (employee?.id && !isAdd) loadProfileData();
  }, [employee?.id, isAdd, loadProfileData]));

  const formatTime = (t) => (t ? (typeof t === 'string' ? t.slice(0, 5) : t) : '—');
  const empId = employee?.id ? `EM-${String(employee.id).slice(0, 8).toUpperCase()}` : '—';
  const recentAdvance = advances[0];
  const recentLeave = recentLeaves[0];
  const formatAdvanceDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const formatLeaveDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

  if (isAdd) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>New Staff</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={form.name}
                onChangeText={(v) => set('name', v)}
              />
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile"
                value={form.phone}
                onChangeText={(v) => set('phone', v)}
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>Email (for login)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email — leave blank for no login"
                value={form.email}
                onChangeText={(v) => set('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password (for login)</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 4 characters — leave blank for no login"
                value={form.password}
                onChangeText={(v) => set('password', v)}
                secureTextEntry
              />
              <Text style={styles.label}>Employee photo (optional)</Text>
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#9CA3AF" />
                <TouchableOpacity style={styles.takePhotoBtn}><Text style={styles.takePhotoText}>Take Photo</Text></TouchableOpacity>
              </View>
              <Text style={styles.label}>Date of birth</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD e.g. 2000-01-04" value={form.dateOfBirth} onChangeText={(v) => set('dateOfBirth', v)} />
              <Text style={styles.label}>Date of join</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD e.g. 2026-01-04" value={form.dateOfJoin} onChangeText={(v) => set('dateOfJoin', v)} />
              <Text style={styles.label}>Check in (default)</Text>
              <TextInput style={styles.input} placeholder="09:30" value={form.defaultCheckIn} onChangeText={(v) => set('defaultCheckIn', v)} />
              <Text style={styles.label}>Check out (default)</Text>
              <TextInput style={styles.input} placeholder="18:30" value={form.defaultCheckOut} onChangeText={(v) => set('defaultCheckOut', v)} />
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, form.roleLabel === r && styles.roleChipActive]}
                    onPress={() => set('roleLabel', r)}
                  >
                    <Text style={[styles.roleChipText, form.roleLabel === r && styles.roleChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Salary (optional)</Text>
              <View style={styles.roleRow}>
                {SALARY_PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.roleChip, form.salaryPeriod === p && styles.roleChipActive]}
                    onPress={() => set('salaryPeriod', p)}
                  >
                    <Text style={[styles.roleChipText, form.salaryPeriod === p && styles.roleChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="Amount (e.g. 25000)"
                value={form.salaryAmount}
                onChangeText={(v) => set('salaryAmount', v)}
                keyboardType="numeric"
              />
              <Text style={styles.label}>ID verification (optional)</Text>
              <View style={styles.roleRow}>
                {ID_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.roleChip, form.idVerificationType === t && styles.roleChipActive]}
                    onPress={() => set('idVerificationType', t)}
                  >
                    <Text style={[styles.roleChipText, form.idVerificationType === t && styles.roleChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="ID number"
                value={form.idNumber}
                onChangeText={(v) => set('idNumber', v)}
              />
              <Text style={[styles.label, { marginTop: 12 }]}>Set Login mPIN</Text>
              <TextInput style={styles.input} placeholder="Coming soon" editable={false} />
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveNew}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Employee</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.error}>Employee not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge} />
          <Text style={styles.profileName}>{employee.name}</Text>
          <Text style={styles.profileId}>ID: {empId}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, active && styles.statusDotActive]} />
            <Text style={[styles.statusBadgeText, active && styles.statusBadgeTextActive]}>Status: {active ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.meta}>Active (available for assignment)</Text>
            <Switch
              value={active}
              onValueChange={handleToggleActive}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={active ? '#22C55E' : '#9CA3AF'}
            />
          </View>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Check-in / Check-out</Text>
          <View style={styles.checkInOutRow}>
            <View style={styles.checkCard}>
              <Ionicons name="partly-sunny-outline" size={24} color="#22C55E" />
              <Text style={styles.checkLabel}>CHECK IN</Text>
              <Text style={styles.checkTime}>{formatTime(employee.defaultCheckIn)}</Text>
            </View>
            <View style={styles.checkCard}>
              <Ionicons name="moon-outline" size={24} color="#DC2626" />
              <Text style={styles.checkLabel}>CHECK OUT</Text>
              <Text style={[styles.checkTime, { color: '#DC2626' }]}>{formatTime(employee.defaultCheckOut)}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeShiftDetails', { employee })}>
            <Ionicons name="time-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Daily Shift Schedule</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeAttendance', { employee })}>
            <Ionicons name="calendar-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Monthly Summary</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeLeave', { employee })}>
            <Ionicons name="person-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Leave Report</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeSalaryReport', { employee })}>
            <Ionicons name="document-text-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Salary Report</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('OwnerEmployeeWorkingRecord', { employee })}>
            <Ionicons name="briefcase-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Work Record</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>This month</Text>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>{attendanceSummary?.presentDays ?? 0}</Text><Text style={styles.miniStatLabel}>Present</Text></View>
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>{attendanceSummary?.leaveDays ?? 0}</Text><Text style={styles.miniStatLabel}>Leave</Text></View>
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>{attendanceSummary?.permissionCount ?? 0}</Text><Text style={styles.miniStatLabel}>Permission</Text></View>
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>{attendanceSummary?.lateHours ?? '0'}</Text><Text style={styles.miniStatLabel}>Late Hrs</Text></View>
          </View>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent salary advance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OwnerEmployeeAddAdvance', { employee })}>
              <Text style={styles.addLinkText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {recentAdvance ? (
            <View style={styles.recentCard}>
              <Text style={styles.recentMeta}>{formatAdvanceDate(recentAdvance.advanceDate)} • ₹{recentAdvance.amount} Advance</Text>
              <View style={styles.tagRow}>
                <View style={[styles.tag, recentAdvance.status === 'PAID' && styles.tagPaid]}><Text style={styles.tagText}>{recentAdvance.status === 'PAID' ? 'Paid' : 'Not Paid'}</Text></View>
              </View>
              <Text style={styles.recentMeta}>Request: {recentAdvance.requestedAt ? new Date(recentAdvance.requestedAt).toLocaleString('en-IN') : '—'}</Text>
            </View>
          ) : (
            <Text style={styles.meta}>No advances</Text>
          )}
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Recent leave request</Text>
          {recentLeave ? (
            <View style={styles.recentCard}>
              <Text style={styles.recentMeta}>{formatLeaveDate(recentLeave.startDate)} • {recentLeave.reason || 'Leave'}</Text>
              <Text style={styles.recentMeta}>{recentLeave.appliedDaysLabel} • Request: {recentLeave.requestedAt ? new Date(recentLeave.requestedAt).toLocaleString('en-IN') : '—'}</Text>
              <View style={styles.tagRow}>
                <View style={[styles.tag, recentLeave.status === 'APPROVED' && styles.tagPaid, recentLeave.status === 'REJECTED' && styles.tagRejected]}><Text style={styles.tagText}>{recentLeave.status}</Text></View>
              </View>
            </View>
          ) : (
            <Text style={styles.meta}>No leave requests</Text>
          )}
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Contact & role</Text>
          <Text style={styles.meta}>Role: {employee.roleLabel || 'Technician'}</Text>
          <Text style={styles.meta}>Phone: {employee.phone || '—'}</Text>
          <Text style={styles.meta}>Email: {employee.email || '—'}</Text>
          {employee.dateOfBirth ? <Text style={styles.meta}>DOB: {employee.dateOfBirth}</Text> : null}
          {employee.dateOfJoin ? <Text style={styles.meta}>Joined: {employee.dateOfJoin}</Text> : null}
        </View>
        {(employee.idVerificationType || employee.idNumber) ? (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>ID verification</Text>
            <Text style={styles.meta}>Type: {employee.idVerificationType || '—'}</Text>
            <Text style={styles.meta}>Number: {employee.idNumber ? '••••' + String(employee.idNumber).slice(-4) : '—'}</Text>
          </View>
        ) : null}
        {(employee.salaryAmount || employee.salaryPeriod) ? (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Salary</Text>
            <Text style={styles.meta}>
              {employee.salaryAmount ? `₹${employee.salaryAmount}` : '—'} {employee.salaryPeriod ? `(${employee.salaryPeriod})` : ''}
            </Text>
          </View>
        ) : null}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Quick reports</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeAttendance', { employee })}>
            <Ionicons name="calendar-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Attendance</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('OwnerEmployeeLeave', { employee })}>
            <Ionicons name="person-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Leave details</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('OwnerEmployeeSalaryReport', { employee })}>
            <Ionicons name="document-text-outline" size={20} color="#3B4FD7" /><Text style={styles.linkText}>Salary report</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Login</Text>
          <Text style={styles.meta}>
            {employee.userId ? 'Employee has app login (email + password).' : 'No app login — add with email & password when creating staff.'}
          </Text>
          <Text style={[styles.meta, { marginTop: 8, fontStyle: 'italic', color: '#6B7280' }]}>Set mPIN — Coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addLinkText: { fontSize: 14, color: '#3B4FD7', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  roleChipActive: { backgroundColor: '#3B4FD7', borderColor: '#3B4FD7' },
  roleChipText: { fontSize: 12, color: '#6B7280' },
  roleChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#22C55E',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  linkText: { fontSize: 15, color: '#111827', flex: 1 },
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', marginBottom: 8 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  profileId: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  statusDotActive: { backgroundColor: '#22C55E' },
  statusBadgeText: { fontSize: 13, color: '#6B7280' },
  statusBadgeTextActive: { color: '#22C55E', fontWeight: '600' },
  checkInOutRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  checkCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center' },
  checkLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  checkTime: { fontSize: 16, fontWeight: '700', color: '#22C55E' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  miniStat: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10, alignItems: 'center' },
  miniStatValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  miniStatLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  recentCard: { marginTop: 8 },
  recentMeta: { fontSize: 13, color: '#374151', marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#FEE2E2' },
  tagPaid: { backgroundColor: '#DCFCE7' },
  tagRejected: { backgroundColor: '#FEE2E2' },
  tagText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  photoPlaceholder: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 8 },
  takePhotoBtn: { marginTop: 8, backgroundColor: '#22C55E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  takePhotoText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  error: { fontSize: 14, color: '#DC2626' },
});
