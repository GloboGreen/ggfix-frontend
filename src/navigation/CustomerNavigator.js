import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import BackButton from '../components/BackButton';
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import BookRepairScreen from '../screens/customer/BookRepairScreen';
import ChooseNearbyShopScreen from '../screens/customer/ChooseNearbyShopScreen';
import SchedulePickupScreen from '../screens/customer/SchedulePickupScreen';
import TrackRepairScreen from '../screens/customer/TrackRepairScreen';
import BuyProductsScreen from '../screens/customer/BuyProductsScreen';
import PurchaseHistoryScreen from '../screens/customer/PurchaseHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Dashboard' ? 'home-outline'
              : route.name === 'Track' ? 'navigate-outline'
              : route.name === 'Buy' ? 'bag-handle-outline'
              : 'time-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={CustomerDashboardScreen} initialParams={{ onLogout }} />
      <Tab.Screen name="Track" component={TrackRepairScreen} />
      <Tab.Screen name="Buy" component={BuyProductsScreen} />
      <Tab.Screen name="History" component={PurchaseHistoryScreen} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator({ session, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.headerBg },
        headerShadowVisible: true,
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.headerText },
        headerLeft: () => {
          if (!navigation.canGoBack()) return null;
          return <BackButton onPress={() => navigation.goBack()} />;
        },
        headerBackVisible: false,
      })}
    >
      <Stack.Screen name="CustomerTabs" options={{ headerShown: false }}>
        {(props) => <CustomerTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="BookRepair" component={BookRepairScreen} options={{ title: 'Book Repair' }} />
      <Stack.Screen name="ChooseNearbyShop" component={ChooseNearbyShopScreen} options={{ title: 'Choose Shop' }} />
      <Stack.Screen name="SchedulePickup" component={SchedulePickupScreen} options={{ title: 'Schedule Pickup' }} />
    </Stack.Navigator>
  );
}
