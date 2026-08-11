import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { formatDistance, formatDuration } from '../../../shared/utils/format';
import { useProximityNotification } from '../../notifications/hooks/use-proximity-notification';
import { useSaveRoute } from '../../saved-routes/hooks/use-saved-routes';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import type { GeocodeResult } from '../../route-planning/api/geocode';
import { AddressSearchInput } from '../../route-planning/components/address-search-input';
import { TruckParamsForm } from '../../route-planning/components/truck-params-form';
import { useCarRoute, useTruckRoute } from '../../route-planning/hooks/use-routes';
import { useCurrentLocation } from '../hooks/use-current-location';

export const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const savedRoute = route.params?.savedRoute;

  const { location, errorMsg } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  const [origin, setOrigin] = useState<GeocodeResult | null>(savedRoute?.origin ?? null);
  const [destination, setDestination] = useState<GeocodeResult | null>(savedRoute?.destination ?? null);
  const [restrictions, setRestrictions] = useState<TruckRestrictions | null>(
    savedRoute?.restrictions ?? null
  );
  const [selectedRouteType, setSelectedRouteType] = useState<'truck' | 'car'>('truck');

  const truckRoute = useTruckRoute(origin, destination, restrictions);
  const carRoute = useCarRoute(origin, destination);
  const saveRoute = useSaveRoute();

  useProximityNotification(truckRoute.data ? destination : null);

  useEffect(() => {
    const selected = selectedRouteType === 'truck' ? truckRoute.data : carRoute.data;
    const points = selected?.points ?? truckRoute.data?.points ?? carRoute.data?.points;
    if (points && points.length > 0) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 220, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [truckRoute.data, carRoute.data, selectedRouteType]);

  useEffect(() => {
    if (location && !origin) {
      setOrigin({
        label: 'Current location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location, origin]);

  if (errorMsg) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white">{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const selectedRoute = selectedRouteType === 'truck' ? truckRoute : carRoute;
  const accentColor = selectedRouteType === 'truck' ? '#3B82F6' : '#FB923C';

  return (
    <View className="flex-1">
      {/* react-native-maps' MapView isn't registered with NativeWind's cssInterop,
          so `className` wouldn't apply here — keep plain `style` for this one.
          userInterfaceStyle switches Apple Maps to its dark tile style on iOS;
          on Android it depends on device dark mode support for Google Maps. */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation
        userInterfaceStyle="dark"
      >
        {selectedRouteType === 'car' && carRoute.data && (
          <Polyline coordinates={carRoute.data.points} strokeColor="#FB923C" strokeWidth={4} />
        )}
        {selectedRouteType === 'truck' && truckRoute.data && (
          <Polyline coordinates={truckRoute.data.points} strokeColor="#3B82F6" strokeWidth={4} />
        )}
      </MapView>

      <SafeAreaView className="absolute left-0 right-0 top-0 gap-2 p-3" edges={['top']}>
        <AddressSearchInput placeholder="From" onSelect={setOrigin} initialValue={origin?.label} />
        <AddressSearchInput placeholder="To" onSelect={setDestination} initialValue={destination?.label} />

        <TruckParamsForm
          onSubmit={setRestrictions}
          disabled={truckRoute.isFetching || carRoute.isFetching}
          initialRestrictions={savedRoute?.restrictions}
        />

        {(truckRoute.isFetching || carRoute.isFetching) && (
          <View className="flex-row items-center gap-2 rounded-lg bg-gray-800/90 px-3 py-2">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-xs text-gray-300">Fetching routes…</Text>
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView className="absolute bottom-0 left-0 right-0 gap-3 p-3" edges={['bottom']}>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-gray-800 shadow-md android:[elevation:4]"
            onPress={() => navigation.navigate('SavedRoutes')}
          >
            <Ionicons name="bookmark" size={22} color="#60A5FA" />
          </TouchableOpacity>
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-gray-800 shadow-md android:[elevation:4]"
            onPress={() => mapRef.current?.animateToRegion(region, 500)}
          >
            <Ionicons name="locate" size={22} color="#60A5FA" />
          </TouchableOpacity>
        </View>

        {(truckRoute.data || carRoute.data || truckRoute.error || carRoute.error) && (
          <View className="gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-md android:[elevation:4]">
            <View className="flex-row gap-2">
              {truckRoute.data && (
                <TouchableOpacity
                  className={`flex-1 items-center rounded-lg py-2 ${
                    selectedRouteType === 'truck' ? 'bg-blue-600' : 'border border-gray-600 bg-gray-800'
                  }`}
                  onPress={() => setSelectedRouteType('truck')}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedRouteType === 'truck' ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    Truck
                  </Text>
                </TouchableOpacity>
              )}
              {carRoute.data && (
                <TouchableOpacity
                  className={`flex-1 items-center rounded-lg py-2 ${
                    selectedRouteType === 'car' ? 'bg-orange-500' : 'border border-gray-600 bg-gray-800'
                  }`}
                  onPress={() => setSelectedRouteType('car')}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedRouteType === 'car' ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    Car
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedRoute.data && (
              <View className="gap-1">
                <Text className="text-2xl font-bold" style={{ color: accentColor }}>
                  {formatDistance(selectedRoute.data.distanceMeters)}
                </Text>
                <Text className="text-gray-300">
                  {formatDuration(selectedRoute.data.durationSeconds)} drive
                </Text>
                {selectedRouteType === 'truck' && restrictions && (
                  <Text className="text-xs text-gray-500">
                    Restrictions used: {restrictions.heightMeters}m height ·{' '}
                    {restrictions.weightTons}t weight · {restrictions.lengthMeters}m length
                  </Text>
                )}
              </View>
            )}

            {origin && destination && restrictions && truckRoute.data && (
              <TouchableOpacity
                className="items-center rounded-lg bg-blue-600 py-2"
                onPress={() => saveRoute.mutate({ origin, destination, restrictions })}
              >
                <Text className="text-xs font-semibold text-white">
                  {saveRoute.isSuccess ? 'Saved ✓' : 'Save this route'}
                </Text>
              </TouchableOpacity>
            )}

            {truckRoute.error && (
              <Text className="text-red-400">
                {truckRoute.error instanceof Error
                  ? truckRoute.error.message
                  : 'Could not find a truck route.'}
              </Text>
            )}
            {carRoute.error && (
              <Text className="text-red-400">
                {carRoute.error instanceof Error ? carRoute.error.message : 'Could not find a car route.'}
              </Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};
