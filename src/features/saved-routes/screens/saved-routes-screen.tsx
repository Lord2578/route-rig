import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { useDeleteRoute, useSavedRoutes } from '../hooks/use-saved-routes';
import type { SavedRoute } from '../types';

export const SavedRoutesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: routes } = useSavedRoutes();
  const deleteRoute = useDeleteRoute();

  const openRoute = (route: SavedRoute) => {
    navigation.navigate('Map', { savedRoute: route });
  };

  if (!routes || routes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 p-6">
        <Text className="text-gray-400">No saved routes yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-gray-900"
      data={routes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-800 px-4 py-3"
          onPress={() => openRoute(item)}
        >
          <View className="flex-1 pr-3">
            <Text className="font-semibold text-white" numberOfLines={1}>
              {item.origin.label}
            </Text>
            <Text className="text-gray-400" numberOfLines={1}>
              → {item.destination.label}
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              {item.restrictions.heightMeters}m · {item.restrictions.weightTons}t ·{' '}
              {item.restrictions.lengthMeters}m
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-lg bg-red-500/20 px-3 py-2"
            onPress={() => deleteRoute.mutate(item.id)}
          >
            <Text className="text-red-400">Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
};
