import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import BackButton from '../components/BackButton';
import DashboardScreen from '../screens/owner/DashboardScreen';
import MyAccountScreen from '../screens/owner/MyAccountScreen';
import BookingHistoryScreen from '../screens/owner/BookingHistoryScreen';
import BillingScreen from '../screens/owner/BillingScreen';
import BuyScreen from '../screens/owner/BuyScreen';
import TicketListScreen from '../screens/owner/TicketListScreen';
import TicketDetailScreen from '../screens/owner/TicketDetailScreen';
import EditBookingScreen from '../screens/owner/EditBookingScreen';
import DeviceInformationScreen from '../screens/owner/DeviceInformationScreen';
import DeviceMissingPartsScreen from '../screens/owner/DeviceMissingPartsScreen';
import DeviceSecurityScreen from '../screens/owner/DeviceSecurityScreen';
import BookingSummaryScreen from '../screens/owner/BookingSummaryScreen';
import BookingTimelineScreen from '../screens/owner/BookingTimelineScreen';
import BarcodePrintScreen from '../screens/owner/BarcodePrintScreen';
import DeliveryInvoiceScreen from '../screens/owner/DeliveryInvoiceScreen';
import AssignTechnicianScreen from '../screens/owner/AssignTechnicianScreen';
import InventoryScreen from '../screens/owner/InventoryScreen';
import MarketplaceBuyScreen from '../screens/owner/MarketplaceBuyScreen';
import MarketplaceSellScreen from '../screens/owner/MarketplaceSellScreen';
import PickupRequestsScreen from '../screens/owner/PickupRequestsScreen';
import ReportsScreen from '../screens/owner/ReportsScreen';
import OwnerPersonalInfoScreen from '../screens/owner/OwnerPersonalInfoScreen';
import OwnerShopInfoScreen from '../screens/owner/OwnerShopInfoScreen';
import OwnerKycIntroScreen from '../screens/owner/OwnerKycIntroScreen';
import OwnerKycUploadScreen from '../screens/owner/OwnerKycUploadScreen';
import OwnerKycReviewScreen from '../screens/owner/OwnerKycReviewScreen';
import OwnerKycPendingScreen from '../screens/owner/OwnerKycPendingScreen';
import OwnerPickupOptionsScreen from '../screens/owner/OwnerPickupOptionsScreen';
import OwnerEmployeeListScreen from '../screens/owner/OwnerEmployeeListScreen';
import OwnerEmployeeDetailScreen from '../screens/owner/OwnerEmployeeDetailScreen';
import OwnerEmployeeCreatedScreen from '../screens/owner/OwnerEmployeeCreatedScreen';
import OwnerEmployeeAddScreen from '../screens/owner/OwnerEmployeeAddScreen';
import OwnerEmployeeAttendanceScreen from '../screens/owner/OwnerEmployeeAttendanceScreen';
import OwnerEmployeeLeaveScreen from '../screens/owner/OwnerEmployeeLeaveScreen';
import OwnerEmployeeSalaryReportScreen from '../screens/owner/OwnerEmployeeSalaryReportScreen';
import OwnerEmployeePayslipScreen from '../screens/owner/OwnerEmployeePayslipScreen';
import OwnerEmployeeShiftDetailsScreen from '../screens/owner/OwnerEmployeeShiftDetailsScreen';
import OwnerEmployeeWorkingRecordScreen from '../screens/owner/OwnerEmployeeWorkingRecordScreen';
import OwnerEmployeeAddAdvanceScreen from '../screens/owner/OwnerEmployeeAddAdvanceScreen';
import OwnerEmployeeApplyLeaveScreen from '../screens/owner/OwnerEmployeeApplyLeaveScreen';
import OwnerQrCodeScreen from '../screens/owner/OwnerQrCodeScreen';
import NewBookingScreen from '../screens/owner/NewBookingScreen';
import CustomerDetailsScreen from '../screens/owner/CustomerDetailsScreen';
import ChooseDeviceScreen from '../screens/owner/ChooseDeviceScreen';
import SelectDeviceBrandScreen from '../screens/owner/SelectDeviceBrandScreen';
import SelectDeviceModelScreen from '../screens/owner/SelectDeviceModelScreen';
import DeviceColorStorageScreen from '../screens/owner/DeviceColorStorageScreen';
import DeviceServicesScreen from '../screens/owner/DeviceServicesScreen';
import ServiceBookingDevicesListScreen from '../screens/owner/ServiceBookingDevicesListScreen';
import OwnerLeaveRequestsScreen from '../screens/owner/OwnerLeaveRequestsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function OwnerTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#282A2D', borderTopColor: '#111827' },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#9AA0A6',
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'MyAccount'
              ? 'person-circle-outline'
              : route.name === 'Bookings'
              ? 'file-tray-full-outline'
              : route.name === 'Billing'
              ? 'receipt-outline'
              : route.name === 'BuySell'
              ? 'bag-handle-outline'
              : 'grid-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Home' }}>
        {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
      <Tab.Screen name="Billing" component={BillingScreen} />
      <Tab.Screen name="BuySell" component={BuyScreen} />
      <Tab.Screen name="MyAccount" options={{ title: 'My Account' }}>
        {(props) => <MyAccountScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function OwnerNavigator({ session, onLogout }) {
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
      <Stack.Screen name="OwnerTabs" options={{ headerShown: false }}>
        {(props) => <OwnerTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="NewBooking" component={NewBookingScreen} options={{ title: 'New Booking', headerShown: false }} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} options={{ title: 'Customer Details', headerShown: false }} />
      <Stack.Screen name="ChooseDevice" component={ChooseDeviceScreen} options={{ title: 'Choose a Device', headerShown: false }} />
      <Stack.Screen name="SelectDeviceBrand" component={SelectDeviceBrandScreen} options={{ title: 'Select Device Brand', headerShown: false }} />
      <Stack.Screen name="SelectDeviceModel" component={SelectDeviceModelScreen} options={{ title: 'Select Device Model', headerShown: false }} />
      <Stack.Screen name="DeviceColorStorage" component={DeviceColorStorageScreen} options={{ title: 'Device Color & Storage', headerShown: false }} />
      <Stack.Screen name="DeviceServices" component={DeviceServicesScreen} options={{ title: 'Device Services', headerShown: false }} />
      <Stack.Screen name="ServiceBookingDevicesList" component={ServiceBookingDevicesListScreen} options={{ title: 'Service Booking', headerShown: false }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="EditBooking" component={EditBookingScreen} options={{ title: 'Edit Booking' }} />
      <Stack.Screen name="DeviceInformation" component={DeviceInformationScreen} options={{ title: 'Device Information' }} />
      <Stack.Screen name="DeviceMissingParts" component={DeviceMissingPartsScreen} options={{ title: 'Device Missing Parts' }} />
      <Stack.Screen name="DeviceSecurity" component={DeviceSecurityScreen} options={{ title: 'Device Security' }} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} options={{ title: 'Booking Successful' }} />
      <Stack.Screen name="BookingTimeline" component={BookingTimelineScreen} options={{ title: 'History' }} />
      <Stack.Screen name="BarcodePrint" component={BarcodePrintScreen} options={{ title: 'Barcode E-Print' }} />
      <Stack.Screen name="DeliveryInvoice" component={DeliveryInvoiceScreen} options={{ title: 'Deliver Invoice' }} />
      <Stack.Screen name="AssignTechnician" component={AssignTechnicianScreen} options={{ title: 'Assign Technician' }} />
      <Stack.Screen name="MarketplaceSell" component={MarketplaceSellScreen} options={{ title: 'Sell' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="OwnerPersonalInfo" component={OwnerPersonalInfoScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="OwnerShopInfo" component={OwnerShopInfoScreen} options={{ title: 'Shop Information' }} />
      <Stack.Screen name="OwnerKycIntro" component={OwnerKycIntroScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycUpload" component={OwnerKycUploadScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycReview" component={OwnerKycReviewScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycPending" component={OwnerKycPendingScreen} options={{ title: 'KYC Status' }} />
      <Stack.Screen name="OwnerPickupOptions" component={OwnerPickupOptionsScreen} options={{ title: 'Service Pickup Options' }} />
      <Stack.Screen name="OwnerEmployeeList" component={OwnerEmployeeListScreen} options={{ title: 'Employee Management' }} />
      <Stack.Screen name="OwnerEmployeeAdd" component={OwnerEmployeeAddScreen} options={{ title: 'Add Staff' }} />
      <Stack.Screen name="OwnerEmployeeDetail" component={OwnerEmployeeDetailScreen} options={{ title: 'Employee Details' }} />
      <Stack.Screen name="OwnerEmployeeCreated" component={OwnerEmployeeCreatedScreen} options={{ title: 'Employee Created', headerShown: false }} />
      <Stack.Screen name="OwnerEmployeeAttendance" component={OwnerEmployeeAttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="OwnerEmployeeLeave" component={OwnerEmployeeLeaveScreen} options={{ title: 'Leave details' }} />
      <Stack.Screen name="OwnerEmployeeSalaryReport" component={OwnerEmployeeSalaryReportScreen} options={{ title: 'Salary report' }} />
      <Stack.Screen name="OwnerEmployeePayslip" component={OwnerEmployeePayslipScreen} options={{ title: 'Pay slip' }} />
      <Stack.Screen name="OwnerEmployeeShiftDetails" component={OwnerEmployeeShiftDetailsScreen} options={{ title: 'Shift details' }} />
      <Stack.Screen name="OwnerEmployeeWorkingRecord" component={OwnerEmployeeWorkingRecordScreen} options={{ title: 'Working record' }} />
      <Stack.Screen name="OwnerEmployeeAddAdvance" component={OwnerEmployeeAddAdvanceScreen} options={{ title: 'Add advance' }} />
      <Stack.Screen name="OwnerEmployeeApplyLeave" component={OwnerEmployeeApplyLeaveScreen} options={{ title: 'Apply for leave' }} />
      <Stack.Screen name="OwnerLeaveRequests" component={OwnerLeaveRequestsScreen} options={{ title: 'Leave requests' }} />
      <Stack.Screen name="OwnerQrCode" component={OwnerQrCodeScreen} options={{ title: 'My QR Code' }} />
    </Stack.Navigator>
  );
}
