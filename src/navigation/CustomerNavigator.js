import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, Tag, ShoppingBag, Wrench, User } from 'lucide-react-native';
import colors from '../theme/colors';
import BackButton from '../components/BackButton';

// Tab root screens
import HomeScreen from '../screens/customer/HomeScreen';
import CategoryServiceMenuScreen from '../screens/customer/CategoryServiceMenuScreen';
import SellHomeScreen from '../screens/customer/sell/SellHomeScreen';
import BuyHomeScreen from '../screens/customer/buy/BuyHomeScreen';
import RepairHomeScreen from '../screens/customer/repair/RepairHomeScreen';
import ProfileScreen from '../screens/customer/profile/ProfileScreen';

// Profile screens
import EditProfileScreen from '../screens/customer/profile/EditProfileScreen';
import ManageAddressScreen from '../screens/customer/profile/ManageAddressScreen';
import AddressFormScreen from '../screens/customer/profile/AddressFormScreen';
import ManageDeviceScreen from '../screens/customer/profile/ManageDeviceScreen';
import CustomerSupportScreen from '../screens/customer/profile/CustomerSupportScreen';
import AboutUsScreen from '../screens/customer/profile/AboutUsScreen';
import TermsScreen from '../screens/customer/profile/TermsScreen';
import FaqScreen from '../screens/customer/profile/FaqScreen';
import MyOrdersScreen from '../screens/customer/profile/MyOrdersScreen';
import MyCartScreen from '../screens/customer/profile/MyCartScreen';
import NotificationsScreen from '../screens/customer/profile/NotificationsScreen';

// Device wizard (shared by Profile / Sell / Repair)
import SelectCategoryScreen from '../screens/customer/device/SelectCategoryScreen';
import SelectBrandScreen from '../screens/customer/device/SelectBrandScreen';
import SelectSeriesScreen from '../screens/customer/device/SelectSeriesScreen';
import SelectModelScreen from '../screens/customer/device/SelectModelScreen';
import SelectVariantScreen from '../screens/customer/device/SelectVariantScreen';

// Repair flow (Mobile Repair end-to-end wizard lives in repair/)
import RepairSelectDeviceScreen from '../screens/customer/repair/RepairSelectDeviceScreen';
import RepairSelectServiceScreen from '../screens/customer/repair/RepairSelectServiceScreen';
import RepairReviewScreen from '../screens/customer/repair/RepairReviewScreen';
import RepairServiceOptionsScreen from '../screens/customer/repair/RepairServiceOptionsScreen';
import RepairPickupShopsScreen from '../screens/customer/repair/RepairPickupShopsScreen';
import RepairShopDetailsScreen from '../screens/customer/repair/RepairShopDetailsScreen';
import RepairSelectAddressScreen from '../screens/customer/repair/RepairSelectAddressScreen';
import RepairPickupSlotScreen from '../screens/customer/repair/RepairPickupSlotScreen';
import RepairCompleteOrderScreen from '../screens/customer/repair/RepairCompleteOrderScreen';
import RepairConfirmationScreen from '../screens/customer/repair/RepairConfirmationScreen';
import RepairOrderDetailsScreen from '../screens/customer/repair/RepairOrderDetailsScreen';
import ServiceTicketDetailsScreen from '../screens/customer/repair/ServiceTicketDetailsScreen';
import RepairOrderHistoryScreen from '../screens/customer/repair/RepairOrderHistoryScreen';
import RepairPickupStatusScreen from '../screens/customer/repair/RepairPickupStatusScreen';
import ServiceReceiptScreen from '../screens/customer/repair/ServiceReceiptScreen';
import InvoiceReceiptScreen from '../screens/customer/repair/InvoiceReceiptScreen';
import ShopChatScreen from '../screens/customer/repair/ShopChatScreen';

// Sell flow
import SellSelectDeviceScreen from '../screens/customer/sell/SellSelectDeviceScreen';
import SellConditionScreen from '../screens/customer/sell/SellConditionScreen';
import SellScreeningScreen from '../screens/customer/sell/SellScreeningScreen';
import SellScreenConditionScreen from '../screens/customer/sell/SellScreenConditionScreen';
import SellFunctionalScreen from '../screens/customer/sell/SellFunctionalScreen';
import SellDeviceConfigScreen from '../screens/customer/sell/SellDeviceConfigScreen';
import SellAccessoriesWarrantyScreen from '../screens/customer/sell/SellAccessoriesWarrantyScreen';
import SellImagesScreen from '../screens/customer/sell/SellImagesScreen';
import SellAddressScreen from '../screens/customer/sell/SellAddressScreen';
import SellCompleteScreen from '../screens/customer/sell/SellCompleteScreen';
import SellOrderDetailsScreen from '../screens/customer/sell/SellOrderDetailsScreen';
import SellSuccessScreen from '../screens/customer/sell/SellSuccessScreen';
import SellQuotationScreen from '../screens/customer/sell/SellQuotationScreen';
import SellSelectShopScreen from '../screens/customer/sell/SellSelectShopScreen';

// Buy flow
import BuyCategoryScreen from '../screens/customer/buy/BuyCategoryScreen';
import BuyListingScreen from '../screens/customer/buy/BuyListingScreen';
import BuyProductDetailsScreen from '../screens/customer/buy/BuyProductDetailsScreen';

// Shop browse
import NearbyShopsScreen from '../screens/customer/shop/NearbyShopsScreen';
import ShopDetailsScreen from '../screens/customer/shop/ShopDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: HomeIcon,
  Sell: Tag,
  Buy: ShoppingBag,
  Repair: Wrench,
  Profile: User,
};

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarActiveTintColor: '#00008B',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ color, size, focused }) => {
          const Icon = TAB_ICONS[route.name] || HomeIcon;
          return (
            <View
              style={{
                width: 44,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: focused ? '#EEF2FF' : 'transparent',
              }}
            >
              <Icon size={20} color={color} strokeWidth={focused ? 2.4 : 2} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sell" component={SellHomeScreen} />
      <Tab.Screen name="Buy" component={BuyHomeScreen} />
      <Tab.Screen name="Repair" component={RepairHomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator({ session, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.headerBg, height: 52 },
        headerShadowVisible: false,
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontSize: 15, fontWeight: '700', color: colors.headerText },
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: colors.background },
        headerLeft: () => {
          if (!navigation.canGoBack()) return null;
          return <BackButton onPress={() => navigation.goBack()} />;
        },
        headerBackVisible: false,
      })}
    >
      <Stack.Screen name="CustomerTabs" options={{ headerShown: false }}>
        {(props) => <CustomerTabs {...props} session={session} onLogout={onLogout} />}
      </Stack.Screen>

      {/* Category service menu (Repair / Sell / Buy for a tapped category) */}
      <Stack.Screen
        name="CategoryServiceMenu"
        component={CategoryServiceMenuScreen}
        options={({ route }) => ({ title: route.params?.categoryName || 'Our Service' })}
      />

      {/* Profile sub-flows */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ManageAddress" component={ManageAddressScreen} options={{ title: 'Manage Address' }} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Add Address' }} />
      <Stack.Screen name="ManageDevice" component={ManageDeviceScreen} options={{ title: 'Manage My Device' }} />
      <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} options={{ title: 'Customer Support' }} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="Faq" component={FaqScreen} options={{ title: 'FAQ' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="MyCart" component={MyCartScreen} options={{ title: 'My Cart' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />

      {/* Device wizard */}
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectBrand" component={SelectBrandScreen} options={{ title: 'Select Brand' }} />
      <Stack.Screen name="SelectSeries" component={SelectSeriesScreen} options={{ title: 'Select Series' }} />
      <Stack.Screen name="SelectModel" component={SelectModelScreen} options={{ title: 'Select Model' }} />
      <Stack.Screen name="SelectVariant" component={SelectVariantScreen} options={{ title: 'Your Device' }} />

      {/* Repair flow */}
      <Stack.Screen name="RepairSelectDevice" component={RepairSelectDeviceScreen} options={{ title: 'Select Device' }} />
      <Stack.Screen name="RepairSelectService" component={RepairSelectServiceScreen} options={{ title: 'Select Repair Service' }} />
      <Stack.Screen name="RepairReview" component={RepairReviewScreen} options={{ title: 'Review Report' }} />
      <Stack.Screen name="RepairServiceOptions" component={RepairServiceOptionsScreen} options={{ title: 'Service Options' }} />
      <Stack.Screen name="RepairPickupShops" component={RepairPickupShopsScreen} options={{ title: 'Pickup Service Shop' }} />
      <Stack.Screen name="RepairShopDetails" component={RepairShopDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RepairSelectAddress" component={RepairSelectAddressScreen} options={{ title: 'Select Address' }} />
      <Stack.Screen name="RepairPickupSlot" component={RepairPickupSlotScreen} options={{ title: 'Select Pickup Slot' }} />
      <Stack.Screen name="RepairCompleteOrder" component={RepairCompleteOrderScreen} options={{ title: 'Complete Order' }} />
      <Stack.Screen name="RepairConfirmation" component={RepairConfirmationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RepairOrderDetails" component={RepairOrderDetailsScreen} options={{ title: 'View Details' }} />
      <Stack.Screen name="ServiceTicketDetails" component={ServiceTicketDetailsScreen} options={{ title: 'View Details' }} />
      <Stack.Screen name="RepairOrderHistory" component={RepairOrderHistoryScreen} options={{ title: 'Service History' }} />
      <Stack.Screen name="RepairPickupStatus" component={RepairPickupStatusScreen} options={{ title: 'Pickup Status' }} />
      <Stack.Screen name="ServiceReceipt" component={ServiceReceiptScreen} options={{ title: 'Receipt' }} />
      <Stack.Screen name="InvoiceReceipt" component={InvoiceReceiptScreen} options={{ title: 'Invoice Receipt' }} />
      <Stack.Screen name="ShopChat" component={ShopChatScreen} options={{ headerShown: false }} />

      {/* Sell flow */}
      <Stack.Screen name="SellSelectDevice" component={SellSelectDeviceScreen} options={{ title: 'Select Sell Device' }} />
      <Stack.Screen name="SellCondition" component={SellConditionScreen} options={{ title: 'Your Device' }} />
      <Stack.Screen name="SellScreening" component={SellScreeningScreen} options={{ title: 'Screening Question' }} />
      <Stack.Screen name="SellScreenCondition" component={SellScreenConditionScreen} options={{ title: 'Screen' }} />
      <Stack.Screen name="SellFunctional" component={SellFunctionalScreen} options={{ title: 'Functional' }} />
      <Stack.Screen name="SellDeviceConfig" component={SellDeviceConfigScreen} options={{ title: 'Device Configuration' }} />
      <Stack.Screen name="SellAccessoriesWarranty" component={SellAccessoriesWarrantyScreen} options={{ title: 'Accessoires & Warranty' }} />
      <Stack.Screen name="SellImages" component={SellImagesScreen} options={{ title: 'Sell Device Images' }} />
      <Stack.Screen name="SellAddress" component={SellAddressScreen} options={{ title: 'Select Address' }} />
      <Stack.Screen name="SellComplete" component={SellCompleteScreen} options={{ title: 'Complete Order' }} />
      <Stack.Screen name="SellOrderDetails" component={SellOrderDetailsScreen} options={{ title: 'Sell Device Details' }} />
      <Stack.Screen name="SellSuccess" component={SellSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SellQuotation" component={SellQuotationScreen} options={{ title: 'View Quotation Report' }} />
      <Stack.Screen name="SellSelectShop" component={SellSelectShopScreen} options={{ title: 'Select Sell Shop' }} />

      {/* Buy flow */}
      <Stack.Screen name="BuyCategory" component={BuyCategoryScreen} options={{ title: 'Smart Phones' }} />
      <Stack.Screen name="BuyListing" component={BuyListingScreen} options={{ title: 'Listings' }} />
      <Stack.Screen name="BuyProductDetails" component={BuyProductDetailsScreen} options={{ title: 'Product Details' }} />

      {/* Shop browse */}
      <Stack.Screen name="NearbyShops" component={NearbyShopsScreen} options={{ title: 'Nearby Shops' }} />
      <Stack.Screen name="ShopDetails" component={ShopDetailsScreen} options={{ title: 'Shop Details' }} />
    </Stack.Navigator>
  );
}
