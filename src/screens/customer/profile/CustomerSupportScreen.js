import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, Loader } from '../../../components/ui';
import { getSupportContacts } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#16A34A', marginBottom: 16 },
  brand: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  sub: { fontSize: 11, color: colors.textSecondary, marginBottom: 24 },
  heading: { fontSize: 15, fontWeight: '700', color: '#16A34A', marginVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowLabel: { fontSize: 12, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '700', marginTop: 2 },
});

export default function CustomerSupportScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setContacts(await getSupportContacts()); } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader />;

  const fallback = [
    { label: 'Email Us', email: 'Support@globogreen.com' },
    { label: 'Call Us', phone: '+91 85476 54646' },
  ];
  const data = contacts.length ? contacts : fallback;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CUSTOMER SUPPORT</Text>
      <Text style={styles.brand}>Globo green</Text>
      <Text style={styles.sub}>MOBILE ACCESSORIES, SPARES & SERVICES</Text>

      <Text style={styles.heading}>NEED HELP? WE'RE HERE FOR YOU</Text>

      {data.map((c, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => c.email ? Linking.openURL(`mailto:${c.email}`) : c.phone ? Linking.openURL(`tel:${c.phone}`) : null}
        >
          <Card>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name={c.email ? 'mail-outline' : 'call-outline'} color="#16A34A" size={20} />
              </View>
              <View>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowValue}>{c.email || c.phone}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
