import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { IconButton } from '../../../shared/components/icon-button';
import { ROUTE_TYPE_COLOR } from '../../../shared/constants/route-colors';
import { useProximityNotification } from '../../notifications/hooks/use-proximity-notification';
import { useSaveRoute } from '../../saved-routes/hooks/use-saved-routes';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import type { GeocodeResult } from '../../route-planning/api/geocode';
import { AddressSearchInput } from '../../route-planning/components/address-search-input';
import { RouteSummaryCard } from '../../route-planning/components/route-summary-card';
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

  const handleSave = useCallback(() => {
    if (origin && destination && restrictions) {
      saveRoute.mutate({ origin, destination, restrictions });
    }
  }, [origin, destination, restrictions, saveRoute.mutate]);

  const truckRouteState = useMemo(
    () => ({ data: truckRoute.data, error: truckRoute.error }),
    [truckRoute.data, truckRoute.error]
  );
  const carRouteState = useMemo(
    () => ({ data: carRoute.data, error: carRoute.error }),
    [carRoute.data, carRoute.error]
  );

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

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation
        userInterfaceStyle="dark"
      >
        {selectedRouteType === 'car' && carRoute.data && (
          <Polyline coordinates={carRoute.data.points} strokeColor={ROUTE_TYPE_COLOR.car} strokeWidth={4} />
        )}
        {selectedRouteType === 'truck' && truckRoute.data && (
          <Polyline coordinates={truckRoute.data.points} strokeColor={ROUTE_TYPE_COLOR.truck} strokeWidth={4} />
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
          <IconButton name="bookmark" onPress={() => navigation.navigate('SavedRoutes')} />
          <IconButton name="locate" onPress={() => mapRef.current?.animateToRegion(region, 500)} />
        </View>

        <RouteSummaryCard
          truckRoute={truckRouteState}
          carRoute={carRouteState}
          selectedRouteType={selectedRouteType}
          onSelectRouteType={setSelectedRouteType}
          restrictions={restrictions}
          isSaved={saveRoute.isSuccess}
          onSave={origin && destination && restrictions && truckRoute.data ? handleSave : undefined}
        />
      </SafeAreaView>
    </View>
  );
};
