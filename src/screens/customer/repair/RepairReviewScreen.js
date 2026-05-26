import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Smartphone,
  Camera,
  ImageIcon,
  Video,
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Wrench,
  RefreshCw,
} from 'lucide-react-native';
import {
  BottomActionBar,
  Card,
  CardTitle,
  Badge,
} from '../../../components/rnr';
import { notify } from '../../../components/confirm';

const SLOTS = [
  { key: 'front', label: 'Front Side',  hint: 'Show the screen',     accent: 'primary',   icon: Smartphone },
  { key: 'back',  label: 'Back Side',   hint: 'Show the rear panel', accent: 'secondary', icon: Camera },
  { key: 'video', label: 'Full Coverage', hint: '15-sec walkaround', accent: 'success',   icon: Video, isVideo: true },
];

const accentMap = {
  primary:   { tint: '#00008B', bg: 'bg-primary/10',   border: 'border-primary/40',   text: 'text-primary' },
  secondary: { tint: '#2563EB', bg: 'bg-secondary/10', border: 'border-secondary/40', text: 'text-secondary' },
  success:   { tint: '#10B981', bg: 'bg-success/10',   border: 'border-success/40',   text: 'text-success' },
};

export default function RepairReviewScreen({ navigation, route }) {
  const { device = {}, services = [] } = route.params || {};
  const [media, setMedia] = useState({ front: null, back: null, video: null });

  const askPermissions = async (isVideo) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      notify('Permission needed', 'Allow media library access to attach photos.');
      return false;
    }
    return true;
  };

  const pick = async (slot) => {
    const isVideo = slot.isVideo;
    const ok = await askPermissions(isVideo);
    if (!ok) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: isVideo ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !isVideo,
        aspect: !isVideo ? [3, 4] : undefined,
        quality: 0.7,
        videoMaxDuration: 30,
      });
      if (!result.canceled && result.assets?.[0]) {
        setMedia((m) => ({ ...m, [slot.key]: result.assets[0] }));
      }
    } catch (e) {
      notify('Couldn\'t pick media', e?.message || 'Try again');
    }
  };

  const remove = (key) => setMedia((m) => ({ ...m, [key]: null }));

  const onContinue = () => {
    navigation.navigate('RepairServiceOptions', { device, services, media });
  };

  const filled = Object.values(media).filter(Boolean).length;
  const ready = !!media.front && !!media.back; // video optional

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>

        {/* Device summary */}
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center">
            <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mr-3">
              <Smartphone size={26} color="#00008B" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-text-muted uppercase tracking-widest">Your Device</Text>
              <Text className="text-[15px] font-extrabold text-text mt-0.5" numberOfLines={1}>{device.modelName || 'Device'}</Text>
              <View className="flex-row items-center mt-0.5 flex-wrap">
                {device.color ? <Text className="text-[11px] text-text-muted mr-2">{device.color}</Text> : null}
                {device.ramLabel ? <Text className="text-[11px] text-text-muted mr-2">· {device.ramLabel}</Text> : null}
                {device.storageLabel ? <Text className="text-[11px] text-text-muted">· {device.storageLabel}</Text> : null}
              </View>
            </View>
          </View>
        </Card>

        {/* Selected services */}
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center mb-2">
            <Wrench size={16} color="#00008B" />
            <CardTitle className="ml-2 flex-1">Repair Services</CardTitle>
            <Badge variant="softPrimary">{services.length}</Badge>
          </View>
          {services.length === 0 ? (
            <Text className="text-[12px] text-text-muted">No services selected</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {services.map((s) => (
                <View key={s.id} className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-[12px] font-bold text-primary">{s.name}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Device photos */}
        <Card className="rounded-2xl mb-3">
          <View className="flex-row items-center mb-1">
            <Camera size={16} color="#F59E0B" />
            <CardTitle className="ml-2 flex-1">Device Photos</CardTitle>
            <Badge variant={ready ? 'softSuccess' : 'softWarning'}>
              {filled}/3
            </Badge>
          </View>
          <Text className="text-[11px] text-text-muted mb-3">
            Front & Back are required. The walkaround video is optional but speeds up the diagnosis.
          </Text>

          <View className="flex-row -mx-1.5">
            {SLOTS.map((slot) => {
              const asset = media[slot.key];
              const accent = accentMap[slot.accent];
              const Icon = slot.icon;
              return (
                <View key={slot.key} style={{ width: '33.333%' }} className="px-1.5">
                  <Pressable
                    onPress={() => pick(slot)}
                    className={`rounded-2xl overflow-hidden border-2 border-dashed ${accent.border}`}
                    style={{ aspectRatio: 3 / 4, backgroundColor: '#F8FAFC' }}
                  >
                    {asset ? (
                      <View className="flex-1">
                        {slot.isVideo ? (
                          <View className="flex-1 bg-text/90 items-center justify-center">
                            <Video size={28} color="#fff" />
                            <Text className="text-white text-[10px] font-bold mt-1">VIDEO</Text>
                            <Text className="text-white/80 text-[9px] mt-0.5">
                              {asset.duration ? `${Math.round(asset.duration / 1000)}s` : 'Selected'}
                            </Text>
                          </View>
                        ) : (
                          <Image source={{ uri: asset.uri }} style={{ flex: 1 }} resizeMode="cover" />
                        )}
                        <Pressable
                          onPress={() => remove(slot.key)}
                          className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 items-center justify-center"
                        >
                          <X size={12} color="#fff" />
                        </Pressable>
                        <Pressable
                          onPress={() => pick(slot)}
                          className="absolute left-1 top-1 h-6 w-6 rounded-full bg-black/60 items-center justify-center"
                        >
                          <RefreshCw size={11} color="#fff" />
                        </Pressable>
                      </View>
                    ) : (
                      <View className="flex-1 items-center justify-center px-2">
                        <View className={`h-10 w-10 rounded-full ${accent.bg} items-center justify-center mb-2`}>
                          <Icon size={18} color={accent.tint} />
                        </View>
                        <View className="h-5 w-5 rounded-full bg-card border border-border items-center justify-center mb-1">
                          <Plus size={10} color="#0F172A" />
                        </View>
                      </View>
                    )}
                  </Pressable>
                  <Text className={`text-[11px] font-extrabold mt-1.5 text-center ${asset ? accent.text : 'text-text'}`}>
                    {slot.label}
                  </Text>
                  <Text className="text-[10px] text-text-muted text-center" numberOfLines={1}>{slot.hint}</Text>
                </View>
              );
            })}
          </View>

          <View className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 mt-3 flex-row items-start">
            <Sparkles size={12} color="#00008B" />
            <Text className="text-[11px] text-text-muted ml-2 flex-1 leading-4">
              Good lighting & a clean background help our techs give a quicker, more accurate quote.
            </Text>
          </View>
        </Card>

        <View className="bg-success/5 border border-success/20 rounded-2xl p-3 flex-row items-center">
          <ShieldCheck size={16} color="#10B981" />
          <Text className="text-[11px] text-text ml-2 flex-1">
            Photos are encrypted in transit and only visible to the shop you book.
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar
        priceCaption="Photos"
        priceValue={`${filled}/3`}
        priceLabel={ready ? 'ready' : 'add front & back'}
        title="Choose a Shop"
        onPress={onContinue}
        disabled={!ready}
      />
    </View>
  );
}
