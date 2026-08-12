import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Share, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { IconButton } from '../../../shared/components/icon-button';
import { OfflineBanner } from '../../../shared/components/offline-banner';
import { ROUTE_TYPE_COLOR } from '../../../shared/constants/route-colors';
import { formatDistance, formatDuration } from '../../../shared/utils/format';
import { useProximityNotification } from '../../notifications/hooks/use-proximity-notification';
import { useSaveRoute } from '../../saved-routes/hooks/use-saved-routes';
import { useSaveTruckProfile, useTruckProfile } from '../../truck-profile/hooks/use-truck-profile';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import { RouteSummaryCard } from '../../route-planning/components/route-summary-card';
import { TruckParamsForm } from '../../route-planning/components/truck-params-form';
import { WaypointRow } from '../../route-planning/components/waypoint-row';
import { useCarRoute, useTruckRoute } from '../../route-planning/hooks/use-routes';
import { useWaypoints } from '../../route-planning/hooks/use-waypoints';
import { useCurrentLocation } from '../hooks/use-current-location';

const waypointPlaceholder = (index: number, total: number) => {
  if (index === 0) return 'From';
  if (index === total - 1) return 'To';
  return `Stop ${index}`;
};

export const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const savedRoute = route.params?.savedRoute;

  const { location, errorMsg } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  const { slots, updateWaypoint, addStop, removeStop, origin, destination, resolved } = useWaypoints(
    savedRoute?.waypoints
  );
  const [restrictions, setRestrictions] = useState<TruckRestrictions | null>(
    savedRoute?.restrictions ?? null
  );
  const [selectedRouteType, setSelectedRouteType] = useState<'truck' | 'car'>('truck');

  const truckRoute = useTruckRoute(resolved, restrictions);
  const carRoute = useCarRoute(resolved);
  const saveRoute = useSaveRoute();
  const truckProfile = useTruckProfile();
  const saveTruckProfile = useSaveTruckProfile();

  useProximityNotification(truckRoute.data ? destination : null);

  const canSave = useMemo(
    () => Boolean(resolved && restrictions && truckRoute.data),
    [resolved, restrictions, truckRoute.data]
  );

  const handleSave = useCallback(() => {
    if (resolved && restrictions) {
      saveRoute.mutate({ waypoints: resolved, restrictions });
    }
  }, [resolved, restrictions, saveRoute.mutate]);

  const handleShare = useCallback(() => {
    const selectedRoute = selectedRouteType === 'truck' ? truckRoute.data : carRoute.data;
    if (!origin || !destination || !selectedRoute) {
      return;
    }
    Share.share({
      message: `${origin.label} → ${destination.label}\n${formatDistance(selectedRoute.distanceMeters)} · ${formatDuration(
        selectedRoute.durationSeconds
      )} by ${selectedRouteType}\n\nPlanned with RouteRig`,
    });
  }, [origin, destination, selectedRouteType, truckRoute.data, carRoute.data]);

  const handleSubmitRestrictions = useCallback(
    (newRestrictions: TruckRestrictions) => {
      setRestrictions(newRestrictions);
      saveTruckProfile.mutate(newRestrictions);
    },
    [saveTruckProfile.mutate]
  );

  useEffect(() => {
    if (!savedRoute && !restrictions && truckProfile.data) {
      setRestrictions(truckProfile.data);
    }
  }, [savedRoute, restrictions, truckProfile.data]);

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
        edgePadding: { top: 260, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [truckRoute.data, carRoute.data, selectedRouteType]);

  useEffect(() => {
    if (location && !origin) {
      updateWaypoint(slots[0].id, {
        label: 'Current location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location, origin, slots, updateWaypoint]);

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
        {slots.map((slot, index) => {
          if (!slot.value) {
            return null;
          }
          const isOrigin = index === 0;
          const isDestination = index === slots.length - 1;
          return (
            <Marker
              key={slot.id}
              coordinate={{ latitude: slot.value.latitude, longitude: slot.value.longitude }}
              title={slot.value.label}
              description={isOrigin ? 'From' : isDestination ? 'To' : `Stop ${index}`}
              pinColor={isOrigin ? 'green' : isDestination ? 'red' : 'orange'}
            />
          );
        })}
      </MapView>

      <SafeAreaView className="absolute left-0 right-0 top-0 gap-2 p-3" edges={['top']}>
        <OfflineBanner />

        {slots.map((slot, index) => (
          <WaypointRow
            key={slot.id}
            slot={slot}
            placeholder={waypointPlaceholder(index, slots.length)}
            onUpdate={updateWaypoint}
            onRemove={index > 0 && index < slots.length - 1 ? removeStop : undefined}
          />
        ))}

        <TouchableOpacity
          className="flex-row items-center gap-1 self-start rounded-lg border border-blue-500 bg-blue-500/10 px-3 py-1.5"
          onPress={addStop}
        >
          <Ionicons name="add" size={16} color="#60A5FA" />
          <Text className="text-xs font-semibold text-blue-400">Add stop</Text>
        </TouchableOpacity>

        <TruckParamsForm
          onSubmit={handleSubmitRestrictions}
          disabled={truckRoute.isFetching || carRoute.isFetching}
          initialRestrictions={savedRoute?.restrictions ?? truckProfile.data ?? undefined}
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
          onSave={canSave ? handleSave : undefined}
          onShare={
            origin && destination && (selectedRouteType === 'truck' ? truckRoute.data : carRoute.data)
              ? handleShare
              : undefined
          }
        />
      </SafeAreaView>
    </View>
  );
};
