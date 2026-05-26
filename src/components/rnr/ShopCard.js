import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Star, MapPin, Phone, Navigation, Clock } from 'lucide-react-native';
import { cn } from './cn';
import { Badge } from './Badge';

const cardShadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export function ShopCard({
  name,
  address,
  rating,
  reviews,
  distance,
  eta,
  open = true,
  onPress,
  onCall,
  onDirections,
  className,
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('bg-card rounded-2xl border border-border p-4', className)}
      style={cardShadow}
    >
      <View className="flex-row items-start">
        <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <Text className="text-base font-extrabold text-primary">{(name || '?').slice(0, 1).toUpperCase()}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-[15px] font-extrabold text-text flex-1" numberOfLines={1}>{name}</Text>
            <Badge variant={open ? 'softSuccess' : 'softDanger'}>
              {open ? 'OPEN' : 'CLOSED'}
            </Badge>
          </View>
          {address ? (
            <View className="flex-row items-center mt-0.5">
              <MapPin size={12} color="#64748B" />
              <Text className="text-[12px] text-text-muted ml-1 flex-1" numberOfLines={1}>{address}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center mt-2">
            {rating ? (
              <View className="flex-row items-center bg-success/10 rounded-full px-2 py-0.5 mr-2">
                <Star size={11} color="#10B981" fill="#10B981" />
                <Text className="text-[11px] font-bold text-success ml-1">
                  {Number(rating).toFixed(1)}
                </Text>
                {reviews ? <Text className="text-[11px] text-success/80 ml-1">({reviews})</Text> : null}
              </View>
            ) : null}
            {distance ? (
              <Text className="text-[11px] text-text-muted mr-2">{distance} km</Text>
            ) : null}
            {eta ? (
              <View className="flex-row items-center">
                <Clock size={11} color="#64748B" />
                <Text className="text-[11px] text-text-muted ml-1">{eta} min</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      {(onCall || onDirections) ? (
        <View className="flex-row mt-3 border-t border-border pt-2 -mx-1">
          {onCall ? (
            <Pressable onPress={onCall} className="flex-1 flex-row items-center justify-center py-2 active:opacity-70">
              <Phone size={15} color="#10B981" />
              <Text className="ml-2 text-[13px] font-bold text-success">Call</Text>
            </Pressable>
          ) : null}
          {onDirections ? (
            <Pressable onPress={onDirections} className="flex-1 flex-row items-center justify-center py-2 active:opacity-70 border-l border-border">
              <Navigation size={15} color="#2563EB" />
              <Text className="ml-2 text-[13px] font-bold text-secondary">Directions</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
