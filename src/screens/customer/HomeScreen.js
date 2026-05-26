import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  Bell,
  Wrench,
  Tag,
  Store,
  Smartphone,
  Watch,
  Headphones,
  Laptop,
  Tablet,
  Sparkles,
  ChevronRight,
  Zap,
  PercentSquare,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SearchBar,
  OfferBanner,
  ServiceCategoryCard,
  ShopCard,
  SectionHeader,
  Avatar,
  EmptyState,
  Loader,
  Badge,
} from '../../components/rnr';
import { getBanners } from '../../api/masterData';
import { listNearbyShops } from '../../api/shops';
import { listAddresses } from '../../api/customer';
import { selectSession } from '../../store/authSlice';

const QUICK_SERVICES = [
  { key: 'phone',  label: 'Mobile\nRepair',  palette: 'blue',   icon: <Smartphone size={20} color="#00008B" />, target: 'Repair' },
  { key: 'laptop', label: 'Laptop\nRepair',  palette: 'violet', icon: <Laptop size={20} color="#7C3AED" />,    target: 'Repair' },
  { key: 'watch',  label: 'Watch\nRepair',   palette: 'amber',  icon: <Watch size={20} color="#B45309" />,     target: 'Repair' },
  { key: 'audio',  label: 'Audio\nDevices',  palette: 'rose',   icon: <Headphones size={20} color="#BE185D" />, target: 'Repair' },
  { key: 'tablet', label: 'Tablet\nRepair',  palette: 'sky',    icon: <Tablet size={20} color="#0369A1" />,    target: 'Repair' },
  { key: 'sell',   label: 'Sell\nDevice',    palette: 'emerald', icon: <Tag size={20} color="#047857" />,      target: 'Sell' },
];

const POPULAR_SERVICES = [
  { title: 'Screen Replacement', subtitle: '30-day warranty', emoji: '📱', from: 999 },
  { title: 'Battery Replacement', subtitle: 'Same-day service', emoji: '🔋', from: 599 },
  { title: 'Charging Port Fix', subtitle: 'Lifetime guarantee', emoji: '⚡', from: 399 },
  { title: 'Water Damage', subtitle: 'Free diagnosis', emoji: '💧', from: 799 },
];

export default function HomeScreen({ navigation }) {
  const session = useSelector(selectSession);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [shops, setShops] = useState([]);
  const [address, setAddress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, s, a] = await Promise.all([
        getBanners().catch(() => []),
        listNearbyShops().catch(() => []),
        listAddresses().catch(() => []),
      ]);
      setBanners(b);
      setShops(s);
      const def = a.find((x) => x.isDefault) || a[0] || null;
      setAddress(def);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return <Loader label="Loading your home..." />;

  const firstName = (session?.fullName || 'There').split(' ')[0];

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#00008B' }}>
        <LinearGradient
          colors={['#00008B', '#1E1EAC', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 8, paddingBottom: 14, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}
        >
          <View className="flex-row items-center justify-between px-4">
            <Pressable
              onPress={() => navigation.navigate('ManageAddress')}
              className="flex-row items-center flex-1 mr-2 active:opacity-80"
            >
              <View className="h-9 w-9 rounded-full bg-white/15 items-center justify-center mr-2">
                <Sparkles size={15} color="#FBBF24" />
              </View>
              <View className="flex-1">
                <Text className="text-white/70 text-[10px]">Deliver to</Text>
                <Text numberOfLines={1} className="text-white text-[13px] font-extrabold">
                  {address ? address.label || address.city : 'Set your location'}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              className="h-9 w-9 rounded-full bg-white/15 items-center justify-center mr-2 active:opacity-80"
            >
              <Bell size={15} color="#fff" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Profile')}>
              <Avatar fallback={firstName} size={34} />
            </Pressable>
          </View>

          <View className="px-4 mt-2.5">
            <Text className="text-white/80 text-[12px]">Hi {firstName} 👋</Text>
            <Text className="text-white text-[17px] font-extrabold mt-0.5">What needs a fix today?</Text>
          </View>

          <View className="px-4 mt-2.5">
            <SearchBar
              placeholder="Search services, brands, models..."
              onPress={() => navigation.navigate('Repair')}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* Quick stats */}
        <View className="flex-row px-4 mt-3">
          <View className="flex-1 mr-2 bg-card border border-border rounded-xl p-2.5 flex-row items-center">
            <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center mr-2">
              <Zap size={14} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted leading-3">Express</Text>
              <Text className="text-[11px] font-extrabold text-text leading-4">Pickup in 30 min</Text>
            </View>
          </View>
          <View className="flex-1 ml-2 bg-card border border-border rounded-xl p-2.5 flex-row items-center">
            <View className="h-8 w-8 rounded-full bg-warning/10 items-center justify-center mr-2">
              <PercentSquare size={14} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-text-muted leading-3">First repair</Text>
              <Text className="text-[11px] font-extrabold text-text leading-4">Flat 15% OFF</Text>
            </View>
          </View>
        </View>

        {/* Offer banner */}
        <View className="px-4 mt-3">
          <OfferBanner
            badge="FESTIVE OFFER"
            title={banners[0]?.title || 'Big Repair Sale'}
            subtitle={banners[0]?.subtitle || 'Up to 50% off on screen & battery jobs.'}
            cta="Explore offers"
            palette="primary"
            onPress={() => navigation.navigate('Repair')}
          />
        </View>

        {/* Services grid (Bike removed) */}
        <SectionHeader title="Our Services" caption="Pick what you need help with" className="mt-4 mb-2" />
        <View className="px-3 flex-row flex-wrap">
          {QUICK_SERVICES.map((s) => (
            <View key={s.key} style={{ width: '33.333%' }} className="p-1">
              <ServiceCategoryCard
                label={s.label}
                palette={s.palette}
                icon={s.icon}
                badge={s.badge}
                size="sm"
                onPress={() => navigation.navigate(s.target)}
              />
            </View>
          ))}
        </View>

        {/* Sell row */}
        <View className="px-4 mt-3">
          <Pressable
            onPress={() => navigation.navigate('Sell')}
            className="bg-card border border-border rounded-xl p-2.5 flex-row items-center active:opacity-80"
          >
            <View className="h-9 w-9 rounded-xl bg-success/10 items-center justify-center mr-2.5">
              <Tag size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-[13px] font-extrabold text-text mr-2">Sell your old device</Text>
                <Badge variant="softSuccess">INSTANT QUOTE</Badge>
              </View>
              <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>Get quotes from up to 5 nearby shops.</Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Popular rail */}
        <SectionHeader
          title="Popular Repairs"
          caption="Most booked this week"
          action="See all"
          onAction={() => navigation.navigate('Repair')}
          className="mt-4 mb-2"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {POPULAR_SERVICES.map((p) => (
            <Pressable
              key={p.title}
              onPress={() => navigation.navigate('Repair')}
              className="bg-card border border-border rounded-xl p-2.5 mx-1 active:opacity-80"
              style={{ width: 168 }}
            >
              <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mb-2">
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
              </View>
              <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{p.title}</Text>
              <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{p.subtitle}</Text>
              <View className="flex-row items-center mt-1.5">
                <Text className="text-[10px] text-text-muted">From</Text>
                <Text className="text-[12px] font-extrabold text-primary ml-1">₹{p.from}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Refer banner */}
        <View className="px-4 mt-3">
          <OfferBanner
            badge="REFER & EARN"
            title="Refer a friend, earn ₹200"
            subtitle="Share your code — both get ₹200 on their first repair."
            cta="Share now"
            palette="violet"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Nearby shops */}
        <SectionHeader
          title="Nearby Service Shops"
          caption={address ? `Around ${address.locality || address.city}` : 'Shops near your area'}
          action="View all"
          onAction={() => navigation.navigate('NearbyShops')}
          className="mt-4 mb-2"
        />
        <View className="px-4">
          {shops.length === 0 ? (
            <EmptyState
              icon={<Store size={26} color="#00008B" />}
              title="No nearby shops yet"
              description="Pull to refresh or update your location."
            />
          ) : (
            shops.slice(0, 5).map((s) => (
              <View key={s.id} className="mb-2.5">
                <ShopCard
                  name={s.name}
                  address={s.address || s.city}
                  rating={s.rating || 4.6}
                  reviews={s.reviewCount || 120}
                  distance={s.distanceKm}
                  eta={s.etaMins || 30}
                  open
                  onPress={() => navigation.navigate('ShopDetails', { shopId: s.id })}
                />
              </View>
            ))
          )}
        </View>

        {/* Trust footer */}
        <View className="px-4 mt-2">
          <View className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <View className="flex-row items-center mb-1">
              <Wrench size={14} color="#00008B" />
              <Text className="text-[12px] font-extrabold text-primary ml-1.5">Why Globo Green?</Text>
            </View>
            <Text className="text-[11px] text-text-muted">
              Verified shops · Doorstep pickup · Genuine parts · 30-day warranty.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
