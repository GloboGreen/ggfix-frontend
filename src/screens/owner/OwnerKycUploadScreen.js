import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DOCS = [
  'Aadhar Card Front',
  'Aadhar Card Back',
  'PAN Card',
  'GST Certificate',
  'Udayam Certificate',
];

export default function OwnerKycUploadScreen({ navigation }) {
  const [uploaded, setUploaded] = useState(
    Object.fromEntries(DOCS.map((d) => [d, false])),
  );

  const toggle = (name) =>
    setUploaded((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {DOCS.map((name) => {
          const isUploaded = uploaded[name];
          return (
            <TouchableOpacity
              key={name}
              style={[styles.card, isUploaded && styles.cardUploaded]}
              onPress={() => toggle(name)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={isUploaded ? 'cloud-done-outline' : 'cloud-upload-outline'}
                  size={24}
                  color={isUploaded ? '#16A34A' : '#4B5563'}
                />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.title}>{name}</Text>
                  <Text style={styles.desc}>
                    Upload your {name} image. Maximum file size: 5 MB.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OwnerKycReview')}
        >
          <Text style={styles.buttonText}>PROCEED</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardUploaded: {
    borderColor: '#16A34A',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 11, color: '#4B5563', marginTop: 2 },
  button: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

