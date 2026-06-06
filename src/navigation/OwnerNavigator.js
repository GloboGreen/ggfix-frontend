import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, FileText, Receipt, ShoppingBag, Tag, UserCircle } from 'lucide-react-native';
import colors from '../theme/colors';
import BackButton from '../components/BackButton';
import DashboardScreen from '../screens/owner/DashboardScreen';
import MyAccountScreen from '../screens/owner/MyAccountScreen';
// All booking-related screens are now grouped under owner/AllBooking/
import BookingHistoryScreen from '../screens/owner/AllBooking/BookingHistoryScreen';
import BillingScreen from '../screens/owner/BillingScreen';
import BuyScreen from '../screens/owner/BuyScreen';
import OwnerBuyListingDetailsScreen from '../screens/owner/OwnerBuyListingDetailsScreen';
import TicketListScreen from '../screens/owner/TicketListScreen';
import TicketDetailScreen from '../screens/owner/AllBooking/TicketDetailScreen';
import DeviceDetailScreen from '../screens/owner/AllBooking/DeviceDetailScreen';
import EditBookingScreen from '../screens/owner/AllBooking/EditBookingScreen';
import DeviceInformationScreen from '../screens/owner/DeviceInformationScreen';
import DeviceMissingPartsScreen from '../screens/owner/DeviceMissingPartsScreen';
import DeviceSecurityScreen from '../screens/owner/DeviceSecurityScreen';
import BookingSummaryScreen from '../screens/owner/AllBooking/BookingSummaryScreen';
import BookingTimelineScreen from '../screens/owner/AllBooking/BookingTimelineScreen';
import BarcodePrintScreen from '../screens/owner/AllBooking/BarcodePrintScreen';
import DeliveryInvoiceScreen from '../screens/owner/AllBooking/DeliveryInvoiceScreen';
import AssignTechnicianScreen from '../screens/owner/AssignTechnicianScreen';
import InventoryScreen from '../screens/owner/InventoryScreen';
import MarketplaceBuyScreen from '../screens/owner/MarketplaceBuyScreen';
import MarketplaceSellScreen from '../screens/owner/MarketplaceSellScreen';
import OwnerSellSparePartsScreen from '../screens/owner/OwnerSellSparePartsScreen';
import OwnerSellMobileChoiceScreen from '../screens/owner/OwnerSellMobileChoiceScreen';
import OwnerSellChooseSalesCategoryScreen from '../screens/owner/OwnerSellChooseSalesCategoryScreen';
import OwnerSellGadgetPriceScreen from '../screens/owner/OwnerSellGadgetPriceScreen';
import OwnerSellListedScreen from '../screens/owner/OwnerSellListedScreen';
import MarketplaceOrdersScreen from '../screens/owner/MarketplaceOrdersScreen';
import MarketplaceListingDetailsScreen from '../screens/owner/MarketplaceListingDetailsScreen';
// Reuse customer device pickers for the owner sell mobile flow.
import SelectCategoryScreen from '../screens/customer/device/SelectCategoryScreen';
import SelectBrandScreen from '../screens/customer/device/SelectBrandScreen';
import SelectSeriesScreen from '../screens/customer/device/SelectSeriesScreen';
import SelectModelScreen from '../screens/customer/device/SelectModelScreen';
import SelectVariantScreen from '../screens/customer/device/SelectVariantScreen';
// Reuse customer sell flow screens for the owner-list (Detailed / Dead Short) paths.
import SellScreeningScreen from '../screens/customer/sell/SellScreeningScreen';
import SellScreenConditionScreen from '../screens/customer/sell/SellScreenConditionScreen';
import SellFunctionalScreen from '../screens/customer/sell/SellFunctionalScreen';
import SellDeviceConfigScreen from '../screens/customer/sell/SellDeviceConfigScreen';
import SellAccessoriesWarrantyScreen from '../screens/customer/sell/SellAccessoriesWarrantyScreen';
import SellImagesScreen from '../screens/customer/sell/SellImagesScreen';
import PickupRequestsScreen from '../screens/owner/PickupRequestsScreen';
import ReportsScreen from '../screens/owner/ReportsScreen';
import OwnerPersonalInfoScreen from '../screens/owner/OwnerPersonalInfoScreen';
import OwnerShopInfoScreen from '../screens/owner/OwnerShopInfoScreen';
import OwnerKycIntroScreen from '../screens/owner/OwnerKycIntroScreen';
import OwnerKycUploadScreen from '../screens/owner/OwnerKycUploadScreen';
import OwnerKycReviewScreen from '../screens/owner/OwnerKycReviewScreen';
import OwnerKycPendingScreen from '../screens/owner/OwnerKycPendingScreen';
import OwnerKycViewScreen from '../screens/owner/OwnerKycViewScreen';
import OwnerPickupSlotsScreen from '../screens/owner/OwnerPickupSlotsScreen';
import OwnerPickupServiceListScreen from '../screens/owner/OwnerPickupServiceListScreen';
import OwnerPickupServiceDetailScreen from '../screens/owner/OwnerPickupServiceDetailScreen';
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
import OwnerEmployeePickupReportScreen from '../screens/owner/OwnerEmployeePickupReportScreen';
import OwnerEmployeeAddAdvanceScreen from '../screens/owner/OwnerEmployeeAddAdvanceScreen';
import OwnerEmployeeApplyLeaveScreen from '../screens/owner/OwnerEmployeeApplyLeaveScreen';
import OwnerQrCodeScreen from '../screens/owner/OwnerQrCodeScreen';
import NewBookingScreen from '../screens/owner/serviceBooking/NewBookingScreen';
import CustomerDetailsScreen from '../screens/owner/serviceBooking/CustomerDetailsScreen';
import ChooseDeviceScreen from '../screens/owner/serviceBooking/ChooseDeviceScreen';
import SelectDeviceBrandScreen from '../screens/owner/serviceBooking/SelectDeviceBrandScreen';
import SelectDeviceSeriesScreen from '../screens/owner/serviceBooking/SelectDeviceSeriesScreen';
import SelectDeviceModelScreen from '../screens/owner/serviceBooking/SelectDeviceModelScreen';
import DeviceColorStorageScreen from '../screens/owner/serviceBooking/DeviceColorStorageScreen';
import DeviceServicesScreen from '../screens/owner/serviceBooking/DeviceServicesScreen';
import ServicePriceEstimateScreen from '../screens/owner/serviceBooking/ServicePriceEstimateScreen';
import NewDeviceInformationScreen from '../screens/owner/serviceBooking/DeviceInformationScreen';
import NewDeviceSecurityScreen from '../screens/owner/serviceBooking/DeviceSecurityScreen';
import NewDeviceMissingPartsScreen from '../screens/owner/serviceBooking/DeviceMissingPartsScreen';
import ServiceBookingDevicesListScreen from '../screens/owner/serviceBooking/ServiceBookingDevicesListScreen';
import BookingThankYouScreen from '../screens/owner/serviceBooking/BookingThankYouScreen';
import NewAssignTechnicianScreen from '../screens/owner/serviceBooking/AssignTechnicianScreen';
import BookingSuccessfulScreen from '../screens/owner/serviceBooking/BookingSuccessfulScreen';
import ScanQrCodeScreen from '../screens/owner/serviceBooking/ScanQrCodeScreen';
import BookingStatusScreen from '../screens/owner/serviceBooking/BookingStatusScreen';
import ShopServiceStatusScreen from '../screens/owner/ShopServiceStatusScreen';
import OwnerLeaveRequestsScreen from '../screens/owner/OwnerLeaveRequestsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const OWNER_TAB_ICONS = {
  Home: LayoutGrid,
  Bookings: FileText,
  Billing: Receipt,
  Buy: ShoppingBag,
  Sell: Tag,
  MyAccount: UserCircle,
};

function OwnerTabs({ onLogout }) {
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
        tabBarIcon: ({ color, focused }) => {
          const Icon = OWNER_TAB_ICONS[route.name] || LayoutGrid;
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
      <Tab.Screen name="Home" options={{ title: 'Home' }}>
        {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
      <Tab.Screen name="Billing" component={BillingScreen} />
      <Tab.Screen name="Buy" component={BuyScreen} options={{ title: 'Buy' }} />
      <Tab.Screen
        name="Sell"
        component={SelectCategoryScreen}
        options={{ title: 'Sell' }}
        initialParams={{ flow: 'OWNER_LIST' }}
      />
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
      <Stack.Screen name="SelectDeviceSeries" component={SelectDeviceSeriesScreen} options={{ title: 'Select Device Series', headerShown: false }} />
      <Stack.Screen name="SelectDeviceModel" component={SelectDeviceModelScreen} options={{ title: 'Select Device Model', headerShown: false }} />
      <Stack.Screen name="DeviceColorStorage" component={DeviceColorStorageScreen} options={{ title: 'Device Color & Storage', headerShown: false }} />
      <Stack.Screen name="DeviceServices" component={DeviceServicesScreen} options={{ title: 'Device Services', headerShown: false }} />
      <Stack.Screen name="ServiceBookingDevicesList" component={ServiceBookingDevicesListScreen} options={{ title: 'Service Booking', headerShown: false }} />
      <Stack.Screen name="ServicePriceEstimate" component={ServicePriceEstimateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeviceInformation" component={NewDeviceInformationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeviceSecurity" component={NewDeviceSecurityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeviceMissingParts" component={NewDeviceMissingPartsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingThankYou" component={BookingThankYouScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AssignTechnician" component={NewAssignTechnicianScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingSuccessful" component={BookingSuccessfulScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScanQrCode" component={ScanQrCodeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingStatus" component={BookingStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShopServiceStatus" component={ShopServiceStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ title: 'Device Details' }} />
      <Stack.Screen name="EditBooking" component={EditBookingScreen} options={{ title: 'Edit Booking' }} />
      <Stack.Screen name="LegacyDeviceInformation" component={DeviceInformationScreen} options={{ title: 'Device Information' }} />
      <Stack.Screen name="LegacyDeviceMissingParts" component={DeviceMissingPartsScreen} options={{ title: 'Device Missing Parts' }} />
      <Stack.Screen name="LegacyDeviceSecurity" component={DeviceSecurityScreen} options={{ title: 'Device Security' }} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} options={{ title: 'Booking Successful' }} />
      <Stack.Screen name="BookingTimeline" component={BookingTimelineScreen} options={{ title: 'History' }} />
      <Stack.Screen name="BarcodePrint" component={BarcodePrintScreen} options={{ title: 'Barcode E-Print' }} />
      <Stack.Screen name="DeliveryInvoice" component={DeliveryInvoiceScreen} options={{ title: 'Deliver Invoice' }} />
      <Stack.Screen name="LegacyAssignTechnician" component={AssignTechnicianScreen} options={{ title: 'Assign Technician' }} />
      <Stack.Screen name="MarketplaceSell" component={MarketplaceSellScreen} options={{ title: 'Sell' }} />
      <Stack.Screen name="OwnerBuyListingDetails" component={OwnerBuyListingDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerSellMobile" component={OwnerSellMobileChoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerSellSpareParts" component={OwnerSellSparePartsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerSellChooseSalesCategory" component={OwnerSellChooseSalesCategoryScreen} options={{ headerShown: false }} />
      {/* Shared device pickers (also registered in the customer stack). */}
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectBrand" component={SelectBrandScreen} options={{ title: 'Select Brand' }} />
      <Stack.Screen name="SelectSeries" component={SelectSeriesScreen} options={{ title: 'Select Series' }} />
      <Stack.Screen name="SelectModel" component={SelectModelScreen} options={{ title: 'Select Model' }} />
      <Stack.Screen name="SelectVariant" component={SelectVariantScreen} options={{ title: 'Your Device' }} />
      {/* Shared sell-flow screens (also registered in the customer stack). */}
      <Stack.Screen name="SellScreening" component={SellScreeningScreen} options={{ title: 'Screening Question' }} />
      <Stack.Screen name="SellScreenCondition" component={SellScreenConditionScreen} options={{ title: 'Screen' }} />
      <Stack.Screen name="SellFunctional" component={SellFunctionalScreen} options={{ title: 'Functional' }} />
      <Stack.Screen name="SellDeviceConfig" component={SellDeviceConfigScreen} options={{ title: 'Device Configuration' }} />
      <Stack.Screen name="SellAccessoriesWarranty" component={SellAccessoriesWarrantyScreen} options={{ title: 'Accessoires & Warranty' }} />
      <Stack.Screen name="SellImages" component={SellImagesScreen} options={{ title: 'Sell Device Images' }} />
      <Stack.Screen name="OwnerSellGadgetPrice" component={OwnerSellGadgetPriceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerSellListed" component={OwnerSellListedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MarketplaceOrders" component={MarketplaceOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MarketplaceListingDetails" component={MarketplaceListingDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="OwnerPersonalInfo" component={OwnerPersonalInfoScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="OwnerShopInfo" component={OwnerShopInfoScreen} options={{ title: 'Shop Information' }} />
      <Stack.Screen name="OwnerKycIntro" component={OwnerKycIntroScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycUpload" component={OwnerKycUploadScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycReview" component={OwnerKycReviewScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerKycPending" component={OwnerKycPendingScreen} options={{ title: 'KYC Status' }} />
      <Stack.Screen name="OwnerKycView" component={OwnerKycViewScreen} options={{ title: 'KYC Documents' }} />
      <Stack.Screen name="OwnerPickupSlots" component={OwnerPickupSlotsScreen} options={{ title: 'Service Pickup Options' }} />
      <Stack.Screen name="OwnerPickupServiceList" component={OwnerPickupServiceListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerPickupServiceDetail" component={OwnerPickupServiceDetailScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="OwnerEmployeePickupReport" component={OwnerEmployeePickupReportScreen} options={{ title: 'Pickup report' }} />
      <Stack.Screen name="OwnerEmployeeAddAdvance" component={OwnerEmployeeAddAdvanceScreen} options={{ title: 'Add advance' }} />
      <Stack.Screen name="OwnerEmployeeApplyLeave" component={OwnerEmployeeApplyLeaveScreen} options={{ title: 'Apply for leave' }} />
      <Stack.Screen name="OwnerLeaveRequests" component={OwnerLeaveRequestsScreen} options={{ title: 'Leave requests' }} />
      <Stack.Screen name="OwnerQrCode" component={OwnerQrCodeScreen} options={{ title: 'My QR Code' }} />
    </Stack.Navigator>
  );
}
