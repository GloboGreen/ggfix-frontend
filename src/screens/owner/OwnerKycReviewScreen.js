import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerKycReviewScreen({ navigation }) {
  const docs = [
    { name: 'Aadhar Card Front', done: true },
    { name: 'Aadhar Card Back', done: true },
    { name: 'PAN Card', done: true },
    { name: 'GST Certificate.pdf', done: true },
    { name: 'Udayam Certificate', done: false },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View className="flex-row mb-2" style={styles.statusRow}>
          {docs.map(
            (d, i) =>
              d.done && (
                <Ionicons
                  key={d.name}
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                  style={{ marginRight: 4 }}
                />
              ),
          )}
        </View>

        {docs.map((d) => (
          <View key={d.name} style={[styles.card, d.done && styles.cardDone]}>
            <View style={styles.row}>
              <Ionicons
                name={d.done ? 'document-attach-outline' : 'cloud-upload-outline'}
                size={24}
                color={d.done ? '#16A34A' : '#4B5563'}
              />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.title}>{d.name}</Text>
                <Text style={styles.desc}>{d.done ? 'Uploaded' : 'Upload pending'}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OwnerKycPending')}
        >
          <Text style={styles.buttonText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E5ECFF' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statusRow: { flexDirection: 'row', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardDone: { borderColor: '#16A34A' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 11, color: '#4B5563', marginTop: 2 },
  button: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

