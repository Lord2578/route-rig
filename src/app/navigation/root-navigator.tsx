import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MapScreen } from '../../features/map/screens/map-screen';
import { SavedRoutesScreen } from '../../features/saved-routes/screens/saved-routes-screen';
import type { SavedRoute } from '../../features/saved-routes/types';

export type RootStackParamList = {
  Map: { savedRoute?: SavedRoute } | undefined;
  SavedRoutes: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
