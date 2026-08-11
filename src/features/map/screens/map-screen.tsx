import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['14%', '55%', '92%'], []);

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
        edgePadding: { top: 100, right: 50, bottom: 260, left: 50 },
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
      <View className="flex-1 items-center justify-center">
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
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

  return (
    <View className="flex-1">
      {/* react-native-maps' MapView isn't registered with NativeWind's cssInterop,
          so `className` wouldn't apply here — keep plain `style` for this one. */}
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={region} showsUserLocation>
        {selectedRouteType === 'car' && carRoute.data && (
          <Polyline coordinates={carRoute.data.points} strokeColor="#F97316" strokeWidth={4} />
        )}
        {selectedRouteType === 'truck' && truckRoute.data && (
          <Polyline coordinates={truckRoute.data.points} strokeColor="#2563EB" strokeWidth={4} />
        )}
      </MapView>

      <SafeAreaView className="absolute right-3 top-3 gap-2" edges={['top']} pointerEvents="box-none">
        <TouchableOpacity
          className="rounded-lg bg-white px-3 py-2 shadow-md android:[elevation:3]"
          onPress={() => navigation.navigate('SavedRoutes')}
        >
          <Text className="text-xs font-semibold">Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="rounded-lg bg-white px-3 py-2 shadow-md android:[elevation:3]"
          onPress={() => mapRef.current?.animateToRegion(region, 500)}
        >
          <Text className="text-xs font-semibold">Center</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints} keyboardBehavior="extend">
        {/* BottomSheetView isn't registered with NativeWind's cssInterop — use `style`. */}
        <BottomSheetView style={styles.sheetContent}>
          <AddressSearchInput placeholder="From" onSelect={setOrigin} initialValue={origin?.label} />
          <AddressSearchInput
            placeholder="To"
            onSelect={setDestination}
            initialValue={destination?.label}
          />
          <TruckParamsForm
            onSubmit={setRestrictions}
            disabled={truckRoute.isFetching || carRoute.isFetching}
            initialRestrictions={savedRoute?.restrictions}
          />

          {(truckRoute.isFetching || carRoute.isFetching) && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-xs text-gray-500">Fetching routes…</Text>
            </View>
          )}

          {(truckRoute.data || carRoute.data) && (
            <View className="gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <View className="flex-row gap-2">
                {truckRoute.data && (
                  <TouchableOpacity
                    className={`flex-1 items-center rounded-lg py-2 ${
                      selectedRouteType === 'truck' ? 'bg-blue-600' : 'border border-gray-300 bg-white'
                    }`}
                    onPress={() => setSelectedRouteType('truck')}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedRouteType === 'truck' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Truck
                    </Text>
                  </TouchableOpacity>
                )}
                {carRoute.data && (
                  <TouchableOpacity
                    className={`flex-1 items-center rounded-lg py-2 ${
                      selectedRouteType === 'car' ? 'bg-orange-500' : 'border border-gray-300 bg-white'
                    }`}
                    onPress={() => setSelectedRouteType('car')}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedRouteType === 'car' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Car
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedRoute.data && (
                <View className="gap-1">
                  <Text className="text-2xl font-bold">
                    {formatDistance(selectedRoute.data.distanceMeters)}
                  </Text>
                  <Text className="text-gray-500">
                    {formatDuration(selectedRoute.data.durationSeconds)} drive
                  </Text>
                  {selectedRouteType === 'truck' && restrictions && (
                    <Text className="text-xs text-gray-400">
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
            </View>
          )}

          {truckRoute.error && (
            <Text className="text-red-600">
              {truckRoute.error instanceof Error
                ? truckRoute.error.message
                : 'Could not find a truck route.'}
            </Text>
          )}
          {carRoute.error && (
            <Text className="text-red-600">
              {carRoute.error instanceof Error ? carRoute.error.message : 'Could not find a car route.'}
            </Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
