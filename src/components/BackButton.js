import React from 'react';
import { Pressable, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import colors from '../theme/colors';

export default function BackButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={({ pressed }) => ({ marginLeft: 6, padding: 2, opacity: pressed ? 0.6 : 1 })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#F1F5F9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={18} color={colors.text} />
      </View>
    </Pressable>
  );
}
