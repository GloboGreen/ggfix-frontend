import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerEmployeeAddScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OwnerEmployeeDetail', { mode: 'add' })}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="people" size={40} color="#3B4FD7" />
          </View>
          <Text style={styles.cardTitle}>New Staff</Text>
          <Text style={styles.cardSubtitle}>Add a new employee to your shop</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.card, styles.cardDisabled]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="search" size={40} color="#9CA3AF" />
          </View>
          <Text style={[styles.cardTitle, styles.textMuted]}>Find existing employee</Text>
          <Text style={[styles.cardSubtitle, styles.textMuted]}>Coming soon</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  cardDisabled: { opacity: 0.7 },
  iconWrap: { marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  textMuted: { color: '#9CA3AF' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#9CA3AF' },
});
