import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { Card, PrimaryButton, Loader } from '../../../components/ui';
import { getScreeningQuestions } from '../../../api/masterData';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  qTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  qHelp: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  ansRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 8 },
  ansRowActive: { borderColor: '#16A34A' },
  ansLabel: { marginLeft: 10, fontSize: 14, color: colors.text },
  bottom: { padding: 12, backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 1 },
});

export default function SellScreeningScreen({ navigation, route }) {
  const { device, workingCondition } = route.params || {};
  const flow = workingCondition === 'DEAD' ? 'DEAD' : 'WORKING';
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getScreeningQuestions(flow);
        const fallback = flow === 'DEAD' ? [
          { id: 'd1', question: 'What is the current condition of your phone?', helperText: '', options: ['Phone Dead (Not powering on)', 'Unknown Condition (Not sure / partially working)'] },
          { id: 'd2', question: "Is your phone's display original?", helperText: 'Choose Yes if never changed.', options: ['Yes', 'No'] },
        ] : [
          { id: 'w1', question: 'Is your phone working properly?', helperText: 'Check your phone powers on.', options: ['Yes', 'No'] },
          { id: 'w2', question: 'Is your touchscreen working properly?', helperText: 'Check touch functionality.', options: ['Yes', 'No'] },
          { id: 'w3', question: "Is your phone's display original?", helperText: 'Choose Yes if never changed.', options: ['Yes', 'No'] },
          { id: 'w4', question: 'Is your phone have a valid warranty?', helperText: '', options: ['Yes', 'No'] },
        ];
        setQuestions(list.length ? list : fallback);
      } catch (_) {}
      setLoading(false);
    })();
  }, [flow]);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {questions.map((q, i) => (
          <Card key={q.id}>
            <Text style={styles.qTitle}>{i + 1}. {q.question}</Text>
            {q.helperText ? <Text style={styles.qHelp}>{q.helperText}</Text> : null}
            {(q.options || ['Yes', 'No']).map((opt) => {
              const active = answers[q.id] === opt;
              return (
                <TouchableOpacity key={opt} style={[styles.ansRow, active && styles.ansRowActive]} onPress={() => setAnswers({ ...answers, [q.id]: opt })}>
                  <Ionicons name={active ? 'checkmark-circle' : 'radio-button-off'} size={20} color={active ? '#16A34A' : colors.textSecondary} />
                  <Text style={styles.ansLabel}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        ))}
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton
          title="Continue →"
          onPress={() => navigation.navigate('SellScreenCondition', { device, workingCondition, screeningAnswers: Object.entries(answers).map(([qid, a]) => ({ questionId: qid, answer: a })) })}
        />
      </View>
    </View>
  );
}
