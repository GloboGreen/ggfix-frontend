import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Package, ShieldCheck, Check, Award } from 'lucide-react-native';
import { Loader, BottomActionBar, Badge } from '../../../components/rnr';
import { getAccessoryOptions, getWarrantyOptions } from '../../../api/masterData';

const FALLBACK_ACC = ['Original Charger', 'Battery Replaced (local)', 'Flash Not Working', 'Box (same IMEI)', 'Bill (same IMEI)'];
const FALLBACK_WARR = ['Less than 3 months', '3 – 6 months', '6 – 11 months', 'More than 11 months'];

export default function SellAccessoriesScreen({ navigation, route }) {
  const params = route.params || {};
  const [accs, setAccs] = useState([]);
  const [warrs, setWarrs] = useState([]);
  const [selectedAccs, setSelectedAccs] = useState([]);
  const [warrantyCode, setWarrantyCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, w] = await Promise.all([getAccessoryOptions().catch(() => []), getWarrantyOptions().catch(() => [])]);
        setAccs(a.length ? a : FALLBACK_ACC.map((n, i) => ({ id: `a${i}`, code: `A${i}`, name: n })));
        setWarrs(w.length ? w : FALLBACK_WARR.map((n, i) => ({ id: `w${i}`, code: `W${i}`, label: n })));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const toggle = (id) => setSelectedAccs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  if (loading) return <Loader label="Loading options..." />;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 120 }}>
        {/* Accessories */}
        <View className="bg-card border border-border rounded-xl p-2.5 mb-2.5">
          <View className="flex-row items-center mb-2">
            <View className="h-7 w-7 rounded-full bg-primary/10 items-center justify-center mr-2">
              <Package size={12} color="#00008B" />
            </View>
            <Text className="text-[12px] font-extrabold text-text flex-1">Accessories you have</Text>
            {selectedAccs.length > 0 ? <Badge variant="softPrimary">{selectedAccs.length}</Badge> : null}
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {accs.map((a) => {
              const active = selectedAccs.includes(a.id);
              return (
                <View key={a.id} className="px-1" style={{ width: '33.333%' }}>
                  <Pressable
                    onPress={() => toggle(a.id)}
                    className={`mb-2 rounded-lg border p-2 items-center ${active ? 'bg-primary/5 border-primary' : 'bg-card border-border'}`}
                  >
                    <View className={`h-8 w-8 rounded-full items-center justify-center mb-1 ${active ? 'bg-primary' : 'bg-background'}`}>
                      {active ? <Check size={14} color="#fff" /> : <Package size={14} color="#64748B" />}
                    </View>
                    <Text className={`text-[10px] font-bold text-center ${active ? 'text-primary' : 'text-text'}`} numberOfLines={2}>
                      {a.name}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Warranty */}
        <View className="bg-card border border-border rounded-xl p-2.5">
          <View className="flex-row items-center mb-2">
            <View className="h-7 w-7 rounded-full bg-success/10 items-center justify-center mr-2">
              <ShieldCheck size={12} color="#10B981" />
            </View>
            <Text className="text-[12px] font-extrabold text-text flex-1">Remaining warranty</Text>
            {warrantyCode ? <Badge variant="softSuccess">CHOSEN</Badge> : null}
          </View>
          <View className="flex-row flex-wrap -mx-1">
            {warrs.map((w) => {
              const active = warrantyCode === w.code;
              return (
                <View key={w.id} className="px-1" style={{ width: '50%' }}>
                  <Pressable
                    onPress={() => setWarrantyCode(w.code)}
                    className={`mb-2 rounded-lg border px-2.5 py-2 flex-row items-center ${active ? 'bg-success/5 border-success' : 'bg-card border-border'}`}
                  >
                    <View className={`h-4 w-4 rounded-full border-2 mr-2 items-center justify-center ${active ? 'border-success' : 'border-border'}`}>
                      {active ? <View className="h-2 w-2 rounded-full bg-success" /> : null}
                    </View>
                    <Text className={`text-[11px] font-bold flex-1 ${active ? 'text-success' : 'text-text'}`} numberOfLines={1}>{w.label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View className="bg-warning/5 border border-warning/20 rounded-xl p-2.5 mt-2.5 flex-row items-center">
          <Award size={14} color="#F59E0B" />
          <Text className="text-[11px] text-text ml-2 flex-1">
            Original box · charger · valid warranty unlock higher quotes.
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar
        title="Continue"
        onPress={() => navigation.navigate('SellImages', {
          ...params,
          accessories: selectedAccs.map((id) => ({ accessoryId: id })),
          warrantyCode,
        })}
      />
    </View>
  );
}
