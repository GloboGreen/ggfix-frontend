import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Phone,
  Navigation,
  Star,
  Clock,
  Wrench,
  MessageCircle,
  Truck,
  Smartphone,
  Headphones,
  ShoppingCart,
  ChevronRight,
  Share2,
  Bookmark,
  MapPin,
  ShieldCheck,
  Award,
  Check,
} from 'lucide-react-native';
import {
  BottomActionBar,
  Loader,
  Badge,
  ShopCard,
} from '../../../components/rnr';
import { getShop, listNearbyShops } from '../../../api/shops';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_HEIGHT = 240;

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1604754742629-3e0498a8e3e0?w=1080&q=70',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1080&q=70',
  'https://images.unsplash.com/photo-1565376103889-fcf45953ddb4?w=1080&q=70',
];

const PRIMARY_OPTIONS = [
  { key: 'ENQUIRY', title: 'Service Enquiry',  icon: MessageCircle, palette: ['#059669', '#10B981'] },
  { key: 'PICKUP',  title: 'Doorstep Pickup', icon: Truck,         palette: ['#00008B', '#2563EB'] },
];

const FEATURE_CARDS = [
  { key: 'REPAIR',   title: 'Repair your Phone',     icon: Smartphone, accent: '#00008B', bg: 'bg-primary/10' },
  { key: 'EXCHANGE', title: 'Smart Exchange Available', icon: ShoppingCart, accent: '#7C3AED', bg: 'bg-primary/10' },
];

export default function RepairShopDetailsScreen({ navigation, route }) {
  const params = route.params || {};
  const shopId = params.shopId;
  const [shop, setShop] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('PICKUP');
  const [page, setPage] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, list] = await Promise.all([
          getShop(shopId).catch(() => null),
          listNearbyShops().catch(() => []),
        ]);
        setShop(s);
        setOthers((list || []).filter((x) => x.id !== shopId).slice(0, 6));
      } catch (_) {}
      setLoading(false);
    })();
  }, [shopId]);

  if (loading) return <Loader label="Loading shop..." />;
  if (!shop) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-text-muted text-center">We couldn't load this shop.</Text>
      </View>
    );
  }

  const images = (shop.images?.length ? shop.images.map((i) => i.url || i) : null) || FALLBACK_IMAGES;
  const rating = Number(shop.rating || 5);
  const hoursText = shop.hoursText || '09:30 AM to 09:00 PM';
  const openDays = shop.openDays || 'Monday – Saturday';

  const callShop = () => {
    if (!shop.phone) return;
    Linking.openURL(`tel:${shop.phone}`).catch(() => {});
  };
  const directions = () => {
    const q = encodeURIComponent(shop.address || shop.name || '');
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      default: `https://maps.google.com/?q=${q}`,
    });
    Linking.openURL(url).catch(() => {});
  };

  const onContinue = () => {
    if (selected === 'ENQUIRY') {
      navigation.navigate('ShopChat', { ...params, shopId, mode: 'ENQUIRY' });
    } else {
      navigation.navigate('RepairSelectAddress', { ...params, shopId });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >
        {/* Hero carousel */}
        <View style={{ height: HERO_HEIGHT, backgroundColor: '#E2E8F0' }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setPage(idx);
            }}
          >
            {images.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={{ width: SCREEN_W, height: HERO_HEIGHT }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Gradient overlay for legibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90 }}
          />

          {/* Top bar (back / actions) */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View className="flex-row items-center justify-between px-3 pt-2">
              <Pressable
                onPress={() => navigation.goBack()}
                className="h-10 w-10 rounded-full bg-white items-center justify-center active:opacity-80"
                style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}
              >
                <ChevronLeft size={20} color="#0F172A" />
              </Pressable>
              <View className="flex-row">
                <Pressable
                  onPress={() => setBookmarked((v) => !v)}
                  className="h-10 w-10 rounded-full bg-white items-center justify-center active:opacity-80 mr-2"
                  style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}
                >
                  <Bookmark size={18} color={bookmarked ? '#00008B' : '#0F172A'} fill={bookmarked ? '#00008B' : 'transparent'} />
                </Pressable>
                <Pressable
                  className="h-10 w-10 rounded-full bg-white items-center justify-center active:opacity-80"
                  style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}
                >
                  <Share2 size={17} color="#0F172A" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>

          {/* Open Now badge */}
          <View className="absolute left-3 bottom-3 bg-success rounded-full px-3 py-1 flex-row items-center"
                style={{ shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
            <View className="h-1.5 w-1.5 rounded-full bg-white mr-1.5" />
            <Text className="text-white text-[11px] font-bold tracking-wide">OPEN NOW</Text>
          </View>

          {/* Dots */}
          <View className="absolute right-3 bottom-3 flex-row">
            {images.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full mx-0.5 ${i === page ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}
              />
            ))}
          </View>
        </View>

        {/* Shop card overlay */}
        <View className="px-4 -mt-5">
          <View className="bg-card border border-border rounded-2xl p-4"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }}>
            <View className="flex-row items-start mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-[19px] font-extrabold text-text leading-6" numberOfLines={2}>{shop.name}</Text>
                <View className="flex-row items-center mt-1.5 flex-wrap">
                  <View className="flex-row items-center bg-success rounded-md px-1.5 py-0.5 mr-2">
                    <Text className="text-white text-[11px] font-extrabold mr-0.5">{rating.toFixed(1)}</Text>
                    <Star size={11} color="#fff" fill="#fff" />
                  </View>
                  <Text className="text-[11px] text-text-muted">
                    {(shop.reviewCount || 248).toLocaleString()} reviews
                  </Text>
                  {shop.distanceKm != null ? (
                    <>
                      <Text className="text-text-muted mx-2">·</Text>
                      <Text className="text-[11px] text-text-muted">{Number(shop.distanceKm).toFixed(1)} km</Text>
                    </>
                  ) : null}
                </View>
              </View>
              <Badge variant="softSuccess">VERIFIED</Badge>
            </View>

            <View className="flex-row items-start mt-1">
              <MapPin size={13} color="#64748B" style={{ marginTop: 2 }} />
              <Text className="text-[12px] text-text ml-1 flex-1 leading-5">
                {shop.address || `${shop.city || ''}${shop.pincode ? ' · ' + shop.pincode : ''}`}
              </Text>
            </View>
            {shop.phone ? (
              <View className="flex-row items-center mt-1.5">
                <Phone size={12} color="#64748B" />
                <Text className="text-[12px] text-text-muted ml-1">{shop.phone}</Text>
              </View>
            ) : null}

            {/* Call / Directions */}
            <View className="flex-row mt-4">
              <Pressable
                onPress={callShop}
                className="flex-1 mr-2 bg-success rounded-2xl flex-row items-center justify-center py-3 active:opacity-90"
                style={{ shadowColor: '#10B981', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}
              >
                <Phone size={16} color="#fff" />
                <Text className="text-white text-[14px] font-extrabold ml-2">Call Shop</Text>
              </Pressable>
              <Pressable
                onPress={directions}
                className="flex-1 ml-2 bg-card border border-success rounded-2xl flex-row items-center justify-center py-3 active:opacity-80"
              >
                <Navigation size={16} color="#10B981" />
                <Text className="text-success text-[14px] font-extrabold ml-2">Get Directions</Text>
              </Pressable>
            </View>

            {/* Hours + ratings inline */}
            <View className="flex-row mt-4 -mx-1.5">
              <View className="flex-1 mx-1.5 bg-background rounded-2xl p-3 flex-row items-center">
                <View className="h-9 w-9 rounded-full bg-success/10 items-center justify-center mr-2">
                  <Clock size={16} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] text-text-muted uppercase tracking-widest">Open</Text>
                  <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{openDays}</Text>
                  <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={1}>{hoursText}</Text>
                </View>
              </View>
            </View>

            <View className="bg-background rounded-2xl p-3 mt-3 flex-row items-center">
              <View className="h-9 w-9 rounded-full bg-warning/10 items-center justify-center mr-2">
                <Award size={16} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest">Rating</Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-[14px] font-extrabold text-text mr-2">{rating.toFixed(1)}</Text>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        color="#F59E0B"
                        fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text className="text-[11px] text-text-muted">{(shop.reviewCount || 248).toLocaleString()} reviews</Text>
            </View>
          </View>
        </View>

        {/* Services available */}
        <View className="px-4 mt-5">
          <Text className="text-[13px] font-extrabold text-text">Services available at {shop.name}</Text>
        </View>

        <View className="px-4 mt-3 flex-row">
          {PRIMARY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setSelected(opt.key)}
                className={`flex-1 ${opt.key === 'ENQUIRY' ? 'mr-2' : 'ml-2'} rounded-2xl overflow-hidden border ${isSelected ? 'border-transparent' : 'border-border opacity-90'}`}
                style={isSelected
                  ? { shadowColor: opt.palette[0], shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }
                  : null
                }
              >
                <LinearGradient colors={opt.palette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 12 }}>
                  <View className="flex-row items-center justify-between">
                    <Icon size={20} color="#fff" />
                    <View className={`h-5 w-5 rounded-md border-2 border-white items-center justify-center ${isSelected ? 'bg-white' : ''}`}>
                      {isSelected ? <Check size={12} color={opt.palette[0]} strokeWidth={3} /> : null}
                    </View>
                  </View>
                  <Text className="text-white text-[14px] font-extrabold mt-3">{opt.title}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Feature cards */}
        <View className="px-4 mt-3 flex-row">
          {FEATURE_CARDS.map((f, idx) => {
            const Icon = f.icon;
            return (
              <View
                key={f.key}
                className={`flex-1 ${idx === 0 ? 'mr-2' : 'ml-2'} bg-card border border-border rounded-2xl p-3 flex-row items-center`}
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className={`h-11 w-11 rounded-xl ${f.bg} items-center justify-center mr-2`}>
                  <Icon size={20} color={f.accent} />
                </View>
                <Text className="text-[11px] font-bold text-text flex-1" numberOfLines={2}>{f.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Sell promo */}
        <View className="px-4 mt-4">
          <Pressable
            onPress={() => navigation.navigate('Sell')}
            className="rounded-2xl overflow-hidden active:opacity-90"
            style={{ shadowColor: '#10B981', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
          >
            <LinearGradient
              colors={['#0EA5E9', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}
            >
              <View className="flex-1 pr-3">
                <View className="bg-white/20 self-start rounded-full px-2 py-0.5 mb-1.5">
                  <Text className="text-white text-[9px] font-bold tracking-widest">USE CODE · TECH500</Text>
                </View>
                <Text className="text-white text-[15px] font-extrabold leading-5">Sell old phone now</Text>
                <Text className="text-white/90 text-[12px] mt-0.5">Get up to ₹500 extra</Text>
              </View>
              <View className="bg-text rounded-xl px-3 py-2">
                <Text className="text-white text-[11px] font-extrabold">Sell Now</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Trust strip */}
        <View className="px-4 mt-4 flex-row">
          <View className="flex-1 mr-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <ShieldCheck size={16} color="#10B981" />
            <Text className="text-[10px] font-bold text-text mt-1">30-day Warranty</Text>
          </View>
          <View className="flex-1 mx-1 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Award size={16} color="#F59E0B" />
            <Text className="text-[10px] font-bold text-text mt-1">Verified Shop</Text>
          </View>
          <View className="flex-1 ml-2 bg-card border border-border rounded-2xl py-2.5 items-center">
            <Truck size={16} color="#00008B" />
            <Text className="text-[10px] font-bold text-text mt-1">Free Pickup</Text>
          </View>
        </View>

        {/* Nearby shops rail */}
        {others.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between px-4 mt-5 mb-2">
              <Text className="text-[13px] font-extrabold text-text">Nearest Service Shops</Text>
              <Pressable onPress={() => navigation.navigate('NearbyShops')} className="flex-row items-center active:opacity-70">
                <Text className="text-[11px] font-bold text-primary mr-0.5">See all</Text>
                <ChevronRight size={12} color="#00008B" />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {others.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => navigation.replace('RepairShopDetails', { ...params, shopId: s.id })}
                  className="bg-card border border-border rounded-2xl mx-1.5 active:opacity-90 overflow-hidden"
                  style={{ width: 200, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
                >
                  <Image
                    source={{ uri: (s.images?.[0]?.url || FALLBACK_IMAGES[0]) }}
                    style={{ width: 200, height: 90 }}
                    resizeMode="cover"
                  />
                  <View className="absolute left-2 top-2 bg-success rounded-full px-2 py-0.5">
                    <Text className="text-white text-[9px] font-bold tracking-wide">OPEN NOW</Text>
                  </View>
                  <View className="absolute right-2 top-2 bg-white rounded-full p-1">
                    <Bookmark size={12} color="#64748B" />
                  </View>
                  <View className="p-2.5">
                    <View className="flex-row items-center mb-1">
                      <View className="bg-success rounded-md px-1 py-0.5 mr-1.5">
                        <Text className="text-white text-[10px] font-extrabold">★ {Number(s.rating || 4.5).toFixed(1)}</Text>
                      </View>
                      <Text className="text-[10px] text-text-muted">{s.etaMins || 25} min</Text>
                      <Text className="text-[10px] text-text-muted ml-auto">{s.distanceKm != null ? `${s.distanceKm.toFixed(1)} km` : ''}</Text>
                    </View>
                    <Text className="text-[12px] font-extrabold text-text" numberOfLines={1}>{s.name}</Text>
                    <Text className="text-[10px] text-text-muted mt-0.5" numberOfLines={2}>{s.address || s.city}</Text>
                    <View className="flex-row mt-2 pt-1.5 border-t border-border">
                      <View className="flex-1 flex-row items-center justify-center py-1">
                        <Phone size={11} color="#10B981" />
                        <Text className="text-[10px] font-bold text-success ml-1">Call</Text>
                      </View>
                      <View className="flex-1 flex-row items-center justify-center py-1 border-l border-border">
                        <Navigation size={11} color="#2563EB" />
                        <Text className="text-[10px] font-bold text-secondary ml-1">Directions</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      <BottomActionBar
        title={selected === 'ENQUIRY' ? 'Start Enquiry Chat' : 'Continue with this Shop'}
        onPress={onContinue}
      />
    </View>
  );
}
