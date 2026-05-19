import React from 'react';
import { Button } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import BackButton from '../components/BackButton';
import TechnicianProfileScreen from '../screens/technician/TechnicianProfileScreen';
import TechnicianDashboardScreen from '../screens/technician/TechnicianDashboardScreen';
import AssignedTicketsScreen from '../screens/technician/AssignedTicketsScreen';
import TechnicianTicketDetailScreen from '../screens/technician/TechnicianTicketDetailScreen';
import UpdateStatusScreen from '../screens/technician/UpdateStatusScreen';
import AddRepairNotesScreen from '../screens/technician/AddRepairNotesScreen';
import UploadRepairImagesScreen from '../screens/technician/UploadRepairImagesScreen';
import TechnicianApplyLeaveScreen from '../screens/technician/TechnicianApplyLeaveScreen';

const Stack = createNativeStackNavigator();

export default function TechnicianNavigator({ session, onLogout }) {
  return (
    <Stack.Navigator
      initialRouteName="TechnicianProfile"
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
      <Stack.Screen
        name="TechnicianProfile"
        component={TechnicianProfileScreen}
        options={{ title: 'My Profile', headerRight: () => <Button onPress={onLogout} title="Log out" color={colors.primary} /> }}
      />
      <Stack.Screen name="TechnicianDashboard" component={TechnicianDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AssignedTickets" component={AssignedTicketsScreen} options={{ title: 'My Tickets' }} />
      <Stack.Screen name="TechnicianTicketDetail" component={TechnicianTicketDetailScreen} options={{ title: 'Ticket Detail' }} />
      <Stack.Screen name="UpdateStatus" component={UpdateStatusScreen} options={{ title: 'Update Status' }} />
      <Stack.Screen name="AddRepairNotes" component={AddRepairNotesScreen} options={{ title: 'Add Note' }} />
      <Stack.Screen name="UploadRepairImages" component={UploadRepairImagesScreen} options={{ title: 'Upload Images' }} />
      <Stack.Screen name="TechnicianApplyLeave" component={TechnicianApplyLeaveScreen} options={{ title: 'Apply for leave' }} />
    </Stack.Navigator>
  );
}
