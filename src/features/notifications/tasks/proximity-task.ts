import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { haversineDistanceMeters } from '../../../shared/utils/geo';

export const PROXIMITY_TASK_NAME = 'routerig-proximity-task';

const PROXIMITY_THRESHOLD_METERS = 500;

type LatLng = { latitude: number; longitude: number };

type ProximityState = {
  target: LatLng | null;
  hasNotified: boolean;
};

let state: ProximityState = { target: null, hasNotified: false };

export function setProximityTarget(destination: LatLng | null) {
  const isSameTarget =
    destination?.latitude === state.target?.latitude && destination?.longitude === state.target?.longitude;
  state = { target: destination, hasNotified: isSameTarget ? state.hasNotified : false };
}

TaskManager.defineTask(PROXIMITY_TASK_NAME, async ({ data, error }) => {
  const { target, hasNotified } = state;
  if (error || !data || !target || hasNotified) {
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const latest = locations[locations.length - 1];
  if (!latest) {
    return;
  }

  const distance = haversineDistanceMeters(
    { latitude: latest.coords.latitude, longitude: latest.coords.longitude },
    target
  );

  if (distance <= PROXIMITY_THRESHOLD_METERS) {
    state = { ...state, hasNotified: true };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Approaching destination',
        body: "You're less than 500m from your destination.",
      },
      trigger: null,
    });
  }
});
