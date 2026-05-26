import React from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  MapPin,
  FileText,
  Info,
  HelpCircle,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Pencil,
  ShieldCheck,
  Wallet,
  Bell,
  Star,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession as clearAuth, selectSession } from '../../../store/authSlice';
import { clearSession } from '../../../auth/session';
import { Avatar, Badge } from '../../../components/rnr';

const ACCOUNT = [
  { label: 'My Orders',         icon: ShoppingBag,  to: 'MyOrders',       color: '#00008B', bg: 'bg-primary/10' },
  { label: 'My Cart',           icon: ShoppingCart, to: 'MyCart',         color: '#2563EB', bg: 'bg-secondary/10' },
  { label: 'Manage My Device',  icon: Smartphone,   to: 'ManageDevice',   color: '#7C3AED', bg: 'bg-primary/10' },
  { label: 'Manage Addresses',  icon: MapPin,       to: 'ManageAddress',  color: '#10B981', bg: 'bg-success/10' },
];

const SUPPORT = [
  { label: 'Customer Support',  icon: LifeBuoy,   to: 'CustomerSupport', color: '#F59E0B', bg: 'bg-warning/10' },
  { label: 'FAQ',               icon: HelpCircle, to: 'Faq',             color: '#2563EB', bg: 'bg-secondary/10' },
  { label: 'About Us',          icon: Info,       to: 'AboutUs',         color: '#7C3AED', bg: 'bg-primary/10' },
  { label: 'Terms & Conditions',icon: FileText,   to: 'Terms',           color: '#64748B', bg: 'bg-background' },
];

function Row({ item, onPress, last, right }) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-3 py-2.5 active:bg-background ${last ? '' : 'border-b border-border'}`}
    >
      <View className={`h-8 w-8 rounded-full items-center justify-center mr-2.5 ${item.bg}`}>
        <Icon size={14} color={item.color} />
      </View>
      <Text className="flex-1 text-[13px] font-semibold text-text" numberOfLines={1}>{item.label}</Text>
      {right}
      <ChevronRight size={14} color="#94A3B8" />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const session = useSelector(selectSession);

  const onLogout = () => {
    const doLogout = async () => {
      await clearSession();
      dispatch(clearAuth());
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        doLogout();
      }
      return;
    }
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogout },
    ]);
  };

  const name = session?.fullName || 'Welcome User';
  const mobile = session?.mobile || session?.email || '';

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 10, paddingBottom: 14 }}
        >
          <View className="px-4 flex-row items-center">
            <Avatar fallback={name} size={48} className="border-2 border-white/30" />
            <View className="flex-1 ml-2.5">
              <Text className="text-white text-[15px] font-extrabold" numberOfLines={1}>{name}</Text>
              {mobile ? <Text className="text-white/80 text-[11px] mt-0.5" numberOfLines={1}>{mobile}</Text> : null}
              <View className="flex-row items-center mt-1">
                <View className="bg-white/15 rounded-full flex-row items-center px-1.5 py-0.5">
                  <ShieldCheck size={9} color="#fff" />
                  <Text className="text-white text-[9px] font-bold ml-1 tracking-wide">VERIFIED</Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              className="h-9 w-9 rounded-full bg-white/15 items-center justify-center active:opacity-80"
            >
              <Pencil size={14} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats strip — sits cleanly below the header, no overflow clipping */}
        <View className="mt-3 mx-4 bg-card border border-border rounded-2xl flex-row p-2.5"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
          <Pressable onPress={() => navigation.navigate('MyOrders')} className="flex-1 flex-row items-center justify-center px-1 py-1 active:opacity-70">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <ShoppingBag size={14} color="#00008B" />
            </View>
            <View>
              <Text className="text-[9px] text-text-muted leading-3">Orders</Text>
              <Text className="text-[13px] font-extrabold text-text leading-4">12</Text>
            </View>
          </Pressable>
          <View className="w-px bg-border my-1" />
          <Pressable className="flex-1 flex-row items-center justify-center px-1 py-1 active:opacity-70">
            <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center mr-2">
              <Wallet size={14} color="#10B981" />
            </View>
            <View>
              <Text className="text-[9px] text-text-muted leading-3">Wallet</Text>
              <Text className="text-[13px] font-extrabold text-text leading-4">₹200</Text>
            </View>
          </Pressable>
          <View className="w-px bg-border my-1" />
          <Pressable className="flex-1 flex-row items-center justify-center px-1 py-1 active:opacity-70">
            <View className="h-8 w-8 rounded-full bg-warning/10 items-center justify-center mr-2">
              <Star size={14} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-[9px] text-text-muted leading-3">Rewards</Text>
              <Text className="text-[13px] font-extrabold text-text leading-4">Gold</Text>
            </View>
          </Pressable>
        </View>

        {/* Account */}
        <Text className="text-[10px] font-extrabold text-text-muted px-5 mt-4 mb-1.5 tracking-widest">ACCOUNT</Text>
        <View className="mx-4 bg-card border border-border rounded-2xl overflow-hidden">
          {ACCOUNT.map((it, idx) => (
            <Row key={it.label} item={it} onPress={() => navigation.navigate(it.to)} last={idx === ACCOUNT.length - 1} />
          ))}
        </View>

        {/* Notifications (separate card) */}
        <View className="mx-4 mt-2.5 bg-card border border-border rounded-2xl overflow-hidden">
          <Row
            item={{ label: 'Notifications', icon: Bell, color: '#EF4444', bg: 'bg-danger/10' }}
            onPress={() => navigation.navigate('Notifications')}
            last
            right={<Badge variant="softDanger" className="mr-1.5">3 NEW</Badge>}
          />
        </View>

        {/* Support */}
        <Text className="text-[10px] font-extrabold text-text-muted px-5 mt-4 mb-1.5 tracking-widest">SUPPORT</Text>
        <View className="mx-4 bg-card border border-border rounded-2xl overflow-hidden">
          {SUPPORT.map((it, idx) => (
            <Row key={it.label} item={it} onPress={() => navigation.navigate(it.to)} last={idx === SUPPORT.length - 1} />
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          className="mx-4 mt-2.5 bg-danger/5 border border-danger/20 rounded-2xl flex-row items-center px-3 py-2.5 active:opacity-80"
        >
          <View className="h-8 w-8 rounded-full bg-danger/10 items-center justify-center mr-2.5">
            <LogOut size={14} color="#EF4444" />
          </View>
          <Text className="flex-1 text-[13px] font-extrabold text-danger">Log out</Text>
        </Pressable>

        <Text className="text-center text-[10px] text-text-muted mt-4">App Version 1.0.1</Text>
        <Text className="text-center text-[10px] text-text-muted">Made with ❤️ in India</Text>
      </ScrollView>
    </View>
  );
}
