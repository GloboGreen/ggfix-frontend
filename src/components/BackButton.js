import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function BackButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touch}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={styles.circle}>
        <Ionicons name="chevron-back" size={22} color={colors.backButtonIcon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    marginLeft: Platform.OS === 'ios' ? 8 : 4,
    padding: 4,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
