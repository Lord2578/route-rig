import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MapScreen } from '../../features/map/screens/map-screen';
import type { TruckRestrictions } from '../../features/route-planning/api/directions';
import { SavedRoutesScreen } from '../../features/saved-routes/screens/saved-routes-screen';
import type { SavedRoute } from '../../features/saved-routes/types';
import { SettingsScreen } from '../../features/settings/screens/settings-screen';
import { TruckProfilesScreen } from '../../features/truck-profile/screens/truck-profiles-screen';

export type RootStackParamList = {
  Map: { savedRoute?: SavedRoute; applyTruckProfile?: TruckRestrictions } | undefined;
  SavedRoutes: undefined;
  Settings: undefined;
  TruckProfiles: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen
          name="SavedRoutes"
          component={SavedRoutesScreen}
          options={{ headerShown: true, title: 'Saved Routes' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: '#111827' },
            headerShadowVisible: false,
            headerTintColor: '#60A5FA',
            headerTitleStyle: { color: '#FFFFFF', fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="TruckProfiles"
          component={TruckProfilesScreen}
          options={{ headerShown: true, title: 'Truck Profiles' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
