import React, { useCallback, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  Bell,
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
  Wrench,
  Repeat,
  ShoppingBag,
  ClipboardList,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Volume2,
  PercentCircle,
  Truck,
  IndianRupee,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, EmptyState, Loader, SectionHeader, ShopCard } from '../../components/rnr';
import { getDeviceCategories, getBrands } from '../../api/masterData';
import { listNearbyShops } from '../../api/shops';
import { listAddresses } from '../../api/customer';
import { listMyOrders } from '../../api/orders';
import { getUnreadCount } from '../../api/notifications';
import { selectSession } from '../../store/authSlice';
import { useCustomerLocation } from '../../hooks/useCustomerLocation';
import { travelTimesFor } from '../../utils/travelTimes';

// Icon fallback keyed by the admin-derived category CODE ("Mobile" -> MOBILE).
const CODE_META = {
  MOBILE:        { icon: Smartphone, color: '#00008B' },
  SMARTPHONE:    { icon: Smartphone, color: '#00008B' },
  LAPTOP:        { icon: Laptop,     color: '#7C3AED' },
  TABLET:        { icon: Tablet,     color: '#0369A1' },
  SMARTWATCH:    { icon: Watch,      color: '#B45309' },
  SMARTWATCHES:  { icon: Watch,      color: '#B45309' },
  WATCH:         { icon: Watch,      color: '#B45309' },
  AUDIO:         { icon: Headphones, color: '#BE185D' },
  AUDIO_DEVICES: { icon: Headphones, color: '#BE185D' },
  SPEAKER:       { icon: Volume2,    color: '#047857' },
  SPEAKERS:      { icon: Volume2,    color: '#047857' },
};
const DEFAULT_META = { icon: Smartphone, color: '#00008B' };

// Preferred display order for category tiles (backend returns them
// alphabetically). Unknown codes fall to the end, alphabetically.
const CATEGORY_ORDER = ['MOBILE', 'SMARTPHONE', 'LAPTOP', 'TABLET', 'SMARTWATCH', 'SMARTWATCHES', 'WATCH', 'AUDIO', 'AUDIO_DEVICES', 'AUDIO_DEVICE', 'SPEAKER', 'SPEAKERS'];
function sortByPreferredOrder(list) {
  const rank = (c) => {
    const i = CATEGORY_ORDER.indexOf((c.code || '').toUpperCase());
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...list].sort((a, b) => {
    const d = rank(a) - rank(b);
    return d !== 0 ? d : (a.name || '').localeCompare(b.name || '');
  });
}

// Resolve a master-data image (base64 preferred) to an <Image> uri, or null.
function imgUri(item) {
  if (!item) return null;
  const b64 = item.imageBase64 && String(item.imageBase64).trim();
  if (b64) return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
  const url = item.imageUrl && String(item.imageUrl).trim();
  return url || null;
}

const QUICK_ACTIONS = [
  { key: 'repair', label: 'Repair Device',   icon: Wrench,        route: 'Repair' },
  { key: 'sell',   label: 'Sell Old Device', icon: Repeat,        route: 'Sell' },
  { key: 'buy',    label: 'Buy Accessories', icon: ShoppingBag,   route: 'Buy' },
  { key: 'track',  label: 'Track Booking',   icon: ClipboardList, route: 'MyOrders' },
];

const OFFERS = [
  { key: 'off',   title: 'Up to 30% Off', sub: 'on Screen Replacement', cta: 'Book Now',  icon: PercentCircle, tint: '#00008B', bg: 'bg-primary/5' },
  { key: 'pick',  title: 'Free Pickup',   sub: '& Drop on all repairs', cta: 'Learn More', icon: Truck,        tint: '#047857', bg: 'bg-success/5' },
  { key: 'exch',  title: 'Exchange Bonus', sub: 'Up to ₹3,000 extra',   cta: 'Sell Now',  icon: IndianRupee,  tint: '#B45309', bg: 'bg-warning/5' },
];

const DONE_STATES = new Set(['COMPLETED', 'CANCELLED', 'DELIVERED', 'CLOSED', 'REJECTED']);

// Keep content readable on tablets/large screens — phone-width column, centered.
const MAX_CONTENT_W = 720;

export default function HomeScreen({ navigation }) {
  const session = useSelector(selectSession);
  const { lat, lng, addressLabel: gpsLabel, source: locSource, loading: locating, detectGps } = useCustomerLocation();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [address, setAddress] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [ongoing, setOngoing] = useState(null);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, a, c, br, orders, unreadCount] = await Promise.all([
        listNearbyShops({
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          radiusKm: lat != null && lng != null ? 20 : undefined,
        }).catch(() => []),
        listAddresses().catch(() => []),
        getDeviceCategories().catch(() => []),
        getBrands().catch(() => []),
        listMyOrders({ orderType: 'REPAIR' }).catch(() => []),
        getUnreadCount().catch(() => 0),
      ]);
      setShops(s);
      setUnread(unreadCount || 0);
      setCategories(sortByPreferredOrder((c || []).filter((x) => x.isActive !== false)));
      setBrands(br || []);
      const def = a.find((x) => x.isDefault) || a[0] || null;
      setAddress(def);
      const active = (orders || []).find((o) => !DONE_STATES.has(String(o.status).toUpperCase()));
      setOngoing(active || (orders || [])[0] || null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lng]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return <Loader label="Loading your home..." />;

  const firstName = (session?.fullName || 'Customer').split(' ')[0];
  // Prefer an explicitly saved address; otherwise show the GPS-resolved area.
  // Falls back to a tappable "Set your location" prompt.
  const gpsResolved = gpsLabel && locSource && locSource !== 'default';
  const locationLabel = address
    ? [address.pincode, address.city || address.locality].filter(Boolean).join(', ')
    : locating
      ? 'Detecting location…'
      : gpsResolved
        ? gpsLabel
        : 'Set your location';

  const onLocationPress = async () => {
    const ok = await detectGps();
    if (!ok) navigation.navigate('ManageAddress');
  };

  // Responsive sizing derived from the (capped) content width so cards scale
  // up on tablets and stay tappable on small phones.
  const contentW = Math.min(width, MAX_CONTENT_W);
  const isTablet = width >= 700;
  const centered = { width: '100%', maxWidth: MAX_CONTENT_W, alignSelf: 'center' };
  const avatarSize = isTablet ? 52 : 44;
  const heroTitleSize = isTablet ? 28 : 22;
  // Device Categories render as a 3-column grid that wraps vertically. Images
  // use "contain" so admin-uploaded banner images show in full (incl. their
  // text) — matching the admin's object-contain preview.
  const catGridGap = 10;
  const catGridPadH = 12;
  const catColW = Math.floor((contentW - catGridPadH * 2 - catGridGap * 2) / 3);
  const catImgH = Math.round(catColW * 0.6);
  const brandW = Math.round(Math.min(140, Math.max(92, contentW / 4.2)));
  const brandLogoBox = brandW - 24;
  const brandImg = Math.round(brandLogoBox * 0.82);
  const offerW = Math.round(Math.min(260, contentW * 0.62));

  const openCategory = (c) => navigation.navigate('CategoryServiceMenu', {
    categoryId: c.id,
    categoryCode: (c.code || '').toUpperCase(),
    categoryName: c.name,
  });

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-3 bg-card" style={centered}>
          <Pressable onPress={() => navigation.navigate('Profile')} className="active:opacity-80">
            <Avatar source={session?.profileImageUrl} fallback={firstName} size={avatarSize} />
          </Pressable>
          <Pressable
            onPress={onLocationPress}
            className="flex-1 ml-3 active:opacity-80"
          >
            <Text className="text-[16px] font-extrabold text-text">Hi, {firstName}</Text>
            <View className="flex-row items-center mt-0.5">
              <MapPin size={12} color="#00008B" />
              <Text numberOfLines={1} className="text-[12px] text-text-muted ml-1 max-w-[80%]">{locationLabel}</Text>
              <ChevronDown size={12} color="#94A3B8" />
            </View>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            className="h-10 w-10 rounded-full bg-background items-center justify-center active:opacity-80"
          >
            <Bell size={18} color="#0F172A" />
            {unread > 0 ? (
              <View className="absolute -top-0.5 -right-0.5 bg-danger rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                <Text className="text-white text-[9px] font-bold">{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00008B" />}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
       <View style={centered}>
        {/* Search */}
        <Pressable
          onPress={() => navigation.navigate('Repair')}
          className="mx-4 mt-2 flex-row items-center bg-card border border-border rounded-2xl px-4 py-3.5 active:opacity-80"
        >
          <Search size={18} color="#94A3B8" />
          <Text className="text-[13px] text-text-muted ml-2.5">Search repair, brand, model...</Text>
        </Pressable>

        {/* Hero banner */}
        <View className="px-4 mt-3">
          <LinearGradient
            colors={['#00008B', '#1E1EAC', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 18 }}
          >
            <Text className="text-white font-extrabold" style={{ fontSize: heroTitleSize }}>We Fix. You Relax.</Text>
            <Text className="text-white/80 text-[12px] mt-1">Fast & reliable repairs{'\n'}for all your devices.</Text>
            <View className="mt-3 flex-row flex-wrap">
              <Pressable
                onPress={() => navigation.navigate('Repair')}
                className="bg-white rounded-xl px-4 py-2.5 flex-row items-center mr-2 mb-2 active:opacity-80"
              >
                <Text className="text-primary text-[13px] font-extrabold mr-1">Repair Your Device</Text>
                <ChevronRight size={15} color="#00008B" />
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Sell')}
                className="border border-white/60 rounded-xl px-4 py-2.5 flex-row items-center mb-2 active:opacity-80"
              >
                <Repeat size={14} color="#fff" />
                <Text className="text-white text-[13px] font-extrabold mx-1">Sell Old Device</Text>
                <ChevronRight size={15} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Quick actions */}
        <View className="mx-4 mt-3 bg-card border border-border rounded-2xl px-2 py-3 flex-row">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Pressable
                key={a.key}
                onPress={() => navigation.navigate(a.route)}
                className="flex-1 items-center active:opacity-70"
              >
                <View className="h-12 w-12 rounded-2xl bg-primary/5 items-center justify-center mb-1.5">
                  <Icon size={22} color="#00008B" />
                </View>
                <Text className="text-[10px] font-bold text-text text-center" numberOfLines={2}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Device Categories — backend-driven */}
        <SectionHeader
          title="Our Service"
          action="View All"
          onAction={() => navigation.navigate('Repair')}
          className="mt-5 mb-2"
        />
        {categories.length === 0 ? (
          <View className="px-4">
            <EmptyState title="No categories yet" description="Device categories will appear here once published." />
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ paddingHorizontal: catGridPadH }}>
            {categories.map((c, i) => {
              const code = (c.code || '').toUpperCase();
              const meta = CODE_META[code] || DEFAULT_META;
              const Icon = meta.icon;
              const uri = imgUri(c);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => openCategory(c)}
                  className="bg-card border border-border rounded-2xl p-2 active:opacity-80"
                  style={{ width: catColW, marginLeft: i % 3 === 0 ? 0 : catGridGap, marginBottom: catGridGap }}
                >
                  <View
                    className="rounded-xl bg-background items-center justify-center overflow-hidden mb-1.5"
                    style={{ width: '100%', height: catImgH }}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon size={Math.round(catImgH * 0.5)} color={meta.color} />
                    )}
                  </View>
                  <Text className="text-[12px] font-bold text-text text-center" numberOfLines={1}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Popular Brands — backend-driven */}
        {brands.length > 0 ? (
          <>
            <SectionHeader
              title="Popular Brands"
              action="View All"
              onAction={() => navigation.navigate('Repair')}
              className="mt-5 mb-2"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {brands.slice(0, 12).map((b) => {
                const uri = imgUri(b);
                const initial = (b.name || '?').slice(0, 1).toUpperCase();
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => navigation.navigate('Repair')}
                    className="bg-card border border-border rounded-2xl p-2.5 mx-1 items-center active:opacity-80"
                    style={{ width: brandW }}
                  >
                    <View
                      className="items-center justify-center mb-1.5"
                      style={{ width: brandLogoBox, height: brandLogoBox }}
                    >
                      {uri ? (
                        <Image source={{ uri }} style={{ width: brandImg, height: brandImg }} resizeMode="contain" />
                      ) : (
                        <Text className="font-extrabold text-primary" style={{ fontSize: Math.round(brandLogoBox * 0.46) }}>{initial}</Text>
                      )}
                    </View>
                    <Text className="text-[11px] font-bold text-text text-center" numberOfLines={1}>{b.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {/* Ongoing booking */}
        {ongoing ? (
          <>
            <SectionHeader title="Your Ongoing Booking" className="mt-5 mb-2" />
            <View className="px-4">
              <Pressable
                onPress={() => {
                  const ref = ongoing.payload?.bookingId || ongoing.referenceId;
                  if (ref) navigation.navigate('RepairOrderDetails', { bookingId: ref });
                  else navigation.navigate('MyOrders');
                }}
                className="bg-card border border-border rounded-2xl p-3 active:opacity-80"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mr-3">
                    <Smartphone size={22} color="#00008B" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>
                      {ongoing.payload?.title || `Booking #${ongoing.orderNumber || ''}`}
                    </Text>
                    <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>
                      {ongoing.payload?.deviceName || ongoing.orderType}
                      {ongoing.createdAt ? ` · ${new Date(ongoing.createdAt).toLocaleDateString()}` : ''}
                    </Text>
                  </View>
                  <Badge variant="softSuccess">{(ongoing.status || 'ACTIVE').replace(/_/g, ' ')}</Badge>
                </View>
              </Pressable>
            </View>
          </>
        ) : null}

        {/* Offers */}
        <SectionHeader title="Offers for You" action="View All" onAction={() => navigation.navigate('Repair')} className="mt-5 mb-2" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {OFFERS.map((o) => {
            const Icon = o.icon;
            const target = o.key === 'exch' ? 'Sell' : 'Repair';
            return (
              <Pressable
                key={o.key}
                onPress={() => navigation.navigate(target)}
                className={`rounded-2xl p-3 mx-1 active:opacity-80 ${o.bg}`}
                style={{ width: offerW }}
              >
                <View className="h-9 w-9 rounded-full bg-card items-center justify-center mb-2">
                  <Icon size={18} color={o.tint} />
                </View>
                <Text className="text-[13px] font-extrabold text-text" numberOfLines={1}>{o.title}</Text>
                <Text className="text-[11px] text-text-muted mt-0.5" numberOfLines={1}>{o.sub}</Text>
                <View className="flex-row items-center mt-1.5">
                  <Text className="text-[11px] font-bold text-primary mr-0.5">{o.cta}</Text>
                  <ChevronRight size={12} color="#00008B" />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Nearby shops */}
        {shops.length > 0 ? (
          <>
            <SectionHeader
              title="Nearby Service Shops"
              caption={address ? `Around ${address.locality || address.city}` : 'Shops near your area'}
              action="View all"
              onAction={() => navigation.navigate('NearbyShops')}
              className="mt-5 mb-2"
            />
            <View className="px-4">
              {shops.slice(0, 5).map((s) => (
                <View key={s.id} className="mb-2.5">
                  <ShopCard
                    name={s.name}
                    address={s.address || s.city}
                    rating={s.rating || 4.6}
                    reviews={s.reviewCount || 120}
                    distance={s.distanceKm}
                    travelTimes={travelTimesFor(s.distanceKm)}
                    open
                    onPress={() => navigation.navigate('ShopDetails', { shopId: s.id })}
                  />
                </View>
              ))}
            </View>
          </>
        ) : null}
       </View>
      </ScrollView>
    </View>
  );
}
