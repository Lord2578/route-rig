import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { GeocodeResult } from '../../route-planning/api/geocode';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import { AddressSearchInput } from '../../route-planning/components/address-search-input';
import { TruckParamsForm } from '../../route-planning/components/truck-params-form';
import { useCarRoute, useTruckRoute } from '../../route-planning/hooks/use-routes';
import { useCurrentLocation } from '../hooks/use-current-location';
import { formatDistance, formatDuration } from '../../../shared/utils/format';

export const MapScreen = () => {
  const { location, errorMsg } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);
  const [origin, setOrigin] = useState<GeocodeResult | null>(null);
  const [destination, setDestination] = useState<GeocodeResult | null>(null);
  const [restrictions, setRestrictions] = useState<TruckRestrictions | null>(null);

  const truckRoute = useTruckRoute(origin, destination, restrictions);
  const carRoute = useCarRoute(origin, destination);

  useEffect(() => {
    const points = truckRoute.data?.points ?? carRoute.data?.points;
    if (points && points.length > 0) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 220, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  }, [truckRoute.data, carRoute.data]);

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

  return (
    <View className="flex-1">
      {/* react-native-maps' MapView isn't registered with NativeWind's cssInterop,
          so `className` wouldn't apply here — keep plain `style` for this one. */}
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={region} showsUserLocation>
        {carRoute.data && (
          <Polyline coordinates={carRoute.data.points} strokeColor="#9CA3AF" strokeWidth={4} />
        )}
        {truckRoute.data && (
          <Polyline coordinates={truckRoute.data.points} strokeColor="#2563EB" strokeWidth={4} />
        )}
      </MapView>

      <SafeAreaView className="absolute left-0 right-0 top-0 gap-2 p-3" edges={['top']}>
        <AddressSearchInput placeholder="From" onSelect={setOrigin} initialValue={origin?.label} />
        <AddressSearchInput placeholder="To" onSelect={setDestination} />
        <TruckParamsForm onSubmit={setRestrictions} disabled={truckRoute.isFetching || carRoute.isFetching} />

        {(truckRoute.isFetching || carRoute.isFetching) && (
          <View className="flex-row items-center gap-2 rounded-lg bg-white/90 px-3 py-2">
            <ActivityIndicator size="small" />
            <Text className="text-xs text-gray-500">Fetching routes…</Text>
          </View>
        )}

        {(truckRoute.data || carRoute.data) && (
          <View className="gap-1 rounded-lg bg-white/90 px-3 py-2">
            {truckRoute.data && (
              <View className="flex-row items-center gap-2">
                <View className="h-1 w-4 bg-blue-600" />
                <Text className="text-xs">
                  Truck: {formatDistance(truckRoute.data.distanceMeters)} ·{' '}
                  {formatDuration(truckRoute.data.durationSeconds)}
                </Text>
              </View>
            )}
            {carRoute.data && (
              <View className="flex-row items-center gap-2">
                <View className="h-1 w-4 bg-gray-400" />
                <Text className="text-xs">
                  Car: {formatDistance(carRoute.data.distanceMeters)} ·{' '}
                  {formatDuration(carRoute.data.durationSeconds)}
                </Text>
              </View>
            )}
          </View>
        )}

        {truckRoute.error && (
          <Text className="rounded-lg bg-white/90 px-3 py-2 text-red-600">
            {truckRoute.error instanceof Error ? truckRoute.error.message : 'Could not find a truck route.'}
          </Text>
        )}
        {carRoute.error && (
          <Text className="rounded-lg bg-white/90 px-3 py-2 text-red-600">
            {carRoute.error instanceof Error ? carRoute.error.message : 'Could not find a car route.'}
          </Text>
        )}
      </SafeAreaView>

      <TouchableOpacity
        className="absolute bottom-8 right-4 rounded-lg bg-white px-4 py-2.5 shadow-md android:[elevation:3]"
        onPress={() => mapRef.current?.animateToRegion(region, 500)}
      >
        <Text className="font-semibold">Center</Text>
      </TouchableOpacity>
    </View>
  );
};
