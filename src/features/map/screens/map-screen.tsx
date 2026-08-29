import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Share, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, type UserLocationChangeEvent } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { IconButton } from '../../../shared/components/icon-button';
import { OfflineBanner } from '../../../shared/components/offline-banner';
import { PermissionPrimer } from '../../../shared/components/permission-primer';
import { TRUCK_ROUTE_COLOR } from '../../../shared/constants/route-colors';
import { formatDistance, formatDuration } from '../../../shared/utils/format';
import { useIsOffline } from '../../../shared/hooks/use-is-offline';
import { useProximityNotification } from '../../notifications/hooks/use-proximity-notification';
import { useSaveRoute } from '../../saved-routes/hooks/use-saved-routes';
import { useUnitSystem } from '../../settings/hooks/use-unit-system';
import { useSaveTruckProfile, useTruckProfile } from '../../truck-profile/hooks/use-truck-profile';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import { RouteSummaryCard } from '../../route-planning/components/route-summary-card';
import { TruckParamsForm } from '../../route-planning/components/truck-params-form';
import { WaypointRow } from '../../route-planning/components/waypoint-row';
import { useTruckRoute } from '../../route-planning/hooks/use-routes';
import { useWaypoints } from '../../route-planning/hooks/use-waypoints';
import { distanceToPolyline, getClosestPointIndex, isWithinMeters } from '../../../shared/utils/geo';
import { restrictionsMismatch } from '../../../shared/utils/restrictions';
import { getCurrentManeuverIndex } from '../../route-planning/utils/maneuver';
import { getNextUnvisitedWaypoint } from '../../route-planning/utils/waypoint-progression';
import { useCurrentLocation } from '../hooks/use-current-location';

const DEVIATION_THRESHOLD_METERS = 150;

const waypointPlaceholder = (index: number, total: number) => {
  if (index === 0) return 'From';
  if (index === total - 1) return 'To';
  return `Stop ${index}`;
};

export const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const savedRoute = route.params?.savedRoute;

  const [locationPrimerAcknowledged, setLocationPrimerAcknowledged] = useState(false);
  const [showLocationPrimer, setShowLocationPrimer] = useState(false);
  const [bgPrimerAcknowledged, setBgPrimerAcknowledged] = useState(false);
  const [showBgPrimer, setShowBgPrimer] = useState(false);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'undetermined') {
        setShowLocationPrimer(true);
      } else {
        setLocationPrimerAcknowledged(true);
      }
    });
  }, []);

  const { location, errorMsg } = useCurrentLocation(locationPrimerAcknowledged);
  const mapRef = useRef<MapView>(null);

  const { slots, updateWaypoint, addStop, removeStop, origin, destination, resolved } = useWaypoints(
    savedRoute?.waypoints
  );
  const [restrictions, setRestrictions] = useState<TruckRestrictions | null>(
    savedRoute?.restrictions ?? null
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [visitedWaypointIds, setVisitedWaypointIds] = useState<Set<string>>(new Set());
  const [currentManeuverIndex, setCurrentManeuverIndex] = useState(0);
  const currentManeuverIndexRef = useRef(0);
  const isOffline = useIsOffline();
  const isReroutingRef = useRef(false);
  const truckRoute = useTruckRoute(resolved, restrictions);

  const nextUnvisited = useMemo(
    () => getNextUnvisitedWaypoint(slots, visitedWaypointIds),
    [slots, visitedWaypointIds]
  );
  const saveRoute = useSaveRoute();
  const truckProfile = useTruckProfile();
  const saveTruckProfile = useSaveTruckProfile();
  const unitSystem = useUnitSystem().data ?? 'imperial';

  useEffect(() => {
    if (!truckRoute.data || bgPrimerAcknowledged) {
      return;
    }
    Location.getBackgroundPermissionsAsync().then(({ status }) => {
      if (status === 'undetermined') {
        setShowBgPrimer(true);
      } else {
        setBgPrimerAcknowledged(true);
      }
    });
  }, [truckRoute.data, bgPrimerAcknowledged]);

  useProximityNotification(
    isNavigating && bgPrimerAcknowledged && nextUnvisited ? nextUnvisited.value : null
  );

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
    if (!origin || !destination || !truckRoute.data) {
      return;
    }
    Share.share({
      message: `${origin.label} → ${destination.label}\n${formatDistance(truckRoute.data.distanceMeters)} · ${formatDuration(
        truckRoute.data.durationSeconds
      )}\n\nPlanned with RouteRig`,
    });
  }, [origin, destination, truckRoute.data]);

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

  useEffect(() => {
    if (!savedRoute || !truckProfile.data) return;
    if (!restrictionsMismatch(savedRoute.restrictions, truckProfile.data)) return;

    Alert.alert(
      'Different truck profile',
      'This route was saved with different truck restrictions than your current profile.',
      [
        { text: 'Use saved restrictions', style: 'cancel' },
        {
          text: 'Use current truck',
          onPress: () => setRestrictions(truckProfile.data!),
        },
      ]
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRoute, truckProfile.data]);
  // Intentionally excludes `restrictions` — alert fires once per loaded saved route.

  useEffect(() => {
    if (route.params?.applyTruckProfile) {
      handleSubmitRestrictions(route.params.applyTruckProfile);
      navigation.setParams({ applyTruckProfile: undefined });
    }
  }, [route.params?.applyTruckProfile, handleSubmitRestrictions, navigation]);

  useEffect(() => {
    if (isNavigating) return;
    const points = truckRoute.data?.points;
    if (points && points.length > 0) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 260, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [truckRoute.data, isNavigating]);

  const handleUserLocationChange = useCallback(
    (event: UserLocationChangeEvent) => {
      if (!isNavigating) return;
      const coord = event.nativeEvent.coordinate;
      if (!coord) return;
      const { latitude, longitude, heading } = coord;

      mapRef.current?.animateCamera(
        { center: { latitude, longitude }, heading: heading ?? 0, pitch: 0, zoom: 16 },
        { duration: 300 }
      );

      if (nextUnvisited && isWithinMeters({ latitude, longitude }, nextUnvisited.value, 500)) {
        setVisitedWaypointIds((prev) => {
          const updated = new Set([...prev, nextUnvisited.id]);
          const allVisited = slots.every((s) => !s.value || updated.has(s.id));
          if (allVisited) setIsNavigating(false);
          return updated;
        });
        return;
      }

      const routePoints = truckRoute.data?.points;
      if (routePoints && truckRoute.data?.maneuvers) {
        const progressIndex = getClosestPointIndex({ latitude, longitude }, routePoints);
        const nextManeuverIdx = getCurrentManeuverIndex(progressIndex, truckRoute.data.maneuvers);
        if (nextManeuverIdx !== currentManeuverIndexRef.current) {
          currentManeuverIndexRef.current = nextManeuverIdx;
          setCurrentManeuverIndex(nextManeuverIdx);
        }
      }

      if (routePoints && !isReroutingRef.current) {
        const offRoute = distanceToPolyline({ latitude, longitude }, routePoints) > DEVIATION_THRESHOLD_METERS;
        if (offRoute) {
          if (isOffline) {
            Alert.alert('Off route', 'Rerouting unavailable — check your connection.');
          } else {
            isReroutingRef.current = true;
            updateWaypoint(slots[0].id, { label: 'Current location', latitude, longitude });
          }
        }
      }
    },
    [isNavigating, nextUnvisited, slots, truckRoute.data, isOffline, updateWaypoint]
  );

  useEffect(() => {
    isReroutingRef.current = false;
    currentManeuverIndexRef.current = 0;
    setCurrentManeuverIndex(0);
  }, [truckRoute.data]);

  useEffect(() => {
    if (location && !origin) {
      updateWaypoint(slots[0].id, {
        label: 'Current location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location, origin, slots, updateWaypoint]);

  if (showLocationPrimer) {
    return (
      <PermissionPrimer
        visible
        title="Location access"
        description="RouteRig uses your current location as the starting point for routes and to show it on the map. We only use it while you're using the app."
        onContinue={() => {
          setShowLocationPrimer(false);
          setLocationPrimerAcknowledged(true);
        }}
      />
    );
  }

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
        onUserLocationChange={handleUserLocationChange}
      >
        {truckRoute.data && (
          <Polyline coordinates={truckRoute.data.points} strokeColor={TRUCK_ROUTE_COLOR} strokeWidth={4} />
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

        {isNavigating && truckRoute.data?.maneuvers && truckRoute.data.maneuvers.length > 0 && (
          <View className="rounded-xl bg-gray-900/95 px-4 py-3">
            {currentManeuverIndex < truckRoute.data.maneuvers.length - 1 && (
              <Text className="text-xs font-medium uppercase tracking-wide text-blue-400">
                {`${Math.round(truckRoute.data.maneuvers[currentManeuverIndex].distanceMeters)}m`}
              </Text>
            )}
            <Text className="text-base font-semibold text-white" numberOfLines={2}>
              {truckRoute.data.maneuvers[currentManeuverIndex].instruction}
            </Text>
          </View>
        )}

        {!isNavigating && slots.map((slot, index) => (
          <WaypointRow
            key={slot.id}
            slot={slot}
            placeholder={waypointPlaceholder(index, slots.length)}
            onUpdate={updateWaypoint}
            onRemove={index > 0 && index < slots.length - 1 ? removeStop : undefined}
          />
        ))}

        {!isNavigating && (
          <TouchableOpacity
            className="flex-row items-center gap-1 self-start rounded-lg border border-blue-500 bg-blue-500/10 px-3 py-1.5"
            onPress={addStop}
          >
            <Ionicons name="add" size={16} color="#60A5FA" />
            <Text className="text-xs font-semibold text-blue-400">Add stop</Text>
          </TouchableOpacity>
        )}

        {!isNavigating && (
          <TruckParamsForm
            onSubmit={handleSubmitRestrictions}
            disabled={truckRoute.isFetching}
            initialRestrictions={savedRoute?.restrictions ?? truckProfile.data ?? undefined}
            unitSystem={unitSystem}
          />
        )}

        {truckRoute.isFetching && (
          <View className="flex-row items-center gap-2 rounded-lg bg-gray-800/90 px-3 py-2">
            <ActivityIndicator size="small" color={TRUCK_ROUTE_COLOR} />
            <Text className="text-xs text-gray-300">Fetching routes…</Text>
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView className="absolute bottom-0 left-0 right-0 gap-3 p-3" edges={['bottom']}>
        {!isNavigating && (
          <View className="flex-row justify-between">
            <IconButton
              name="bookmark"
              onPress={() => navigation.navigate('SavedRoutes')}
              accessibilityLabel="Saved routes"
            />
            <IconButton
              name="locate"
              onPress={() => mapRef.current?.animateToRegion(region, 500)}
              accessibilityLabel="Center map on current location"
            />
            <IconButton
              name="car-outline"
              onPress={() => navigation.navigate('TruckProfiles')}
              accessibilityLabel="Truck profiles"
            />
            <IconButton
              name="settings-outline"
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="Settings"
            />
          </View>
        )}

        {isNavigating ? (
          <TouchableOpacity
            className="items-center rounded-xl bg-red-600 py-3"
            onPress={() => setIsNavigating(false)}
            accessibilityLabel="Stop navigation"
          >
            <Text className="text-base font-bold text-white">Stop navigation</Text>
          </TouchableOpacity>
        ) : (
          truckRoute.data && (
            <TouchableOpacity
              className="items-center rounded-xl bg-blue-600 py-3"
              onPress={() => {
                setVisitedWaypointIds(new Set());
                currentManeuverIndexRef.current = 0;
                setCurrentManeuverIndex(0);
                setIsNavigating(true);
              }}
              accessibilityLabel="Start navigation"
            >
              <Text className="text-base font-bold text-white">Start navigation</Text>
            </TouchableOpacity>
          )
        )}

        {!isNavigating && (
          <RouteSummaryCard
            truckRoute={{ data: truckRoute.data, error: truckRoute.error }}
            restrictions={restrictions}
            unitSystem={unitSystem}
            isSaved={saveRoute.isSuccess}
            onSave={canSave ? handleSave : undefined}
            onShare={origin && destination && truckRoute.data ? handleShare : undefined}
          />
        )}
      </SafeAreaView>

      <PermissionPrimer
        visible={showBgPrimer}
        title="Stay on track"
        description="To alert you when you're getting close to your destination — even if RouteRig is in the background — we need 'Always' location access. You can skip this and still use the app without background alerts."
        onContinue={() => {
          setShowBgPrimer(false);
          setBgPrimerAcknowledged(true);
        }}
      />
    </View>
  );
};
