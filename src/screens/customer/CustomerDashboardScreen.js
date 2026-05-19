import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerDashboardScreen({ navigation, route }) {
  const onLogout = route.params?.onLogout;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Customer Dashboard</Text>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookRepair')}>
          <Text style={styles.cardTitle}>Book Repair</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChooseNearbyShop')}>
          <Text style={styles.cardTitle}>Choose Nearby Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SchedulePickup')}>
          <Text style={styles.cardTitle}>Schedule Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Track')}>
          <Text style={styles.cardTitle}>Track Repair Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Buy')}>
          <Text style={styles.cardTitle}>Buy Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('History')}>
          <Text style={styles.cardTitle}>Purchase History</Text>
        </TouchableOpacity>
        {onLogout ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#202124' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
  card: { backgroundColor: '#282A2D', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3C4043' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  logoutBtn: { marginTop: 24, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#6B7280', borderRadius: 12 },
  logoutText: { fontSize: 16, color: '#9AA0A6' },
});
