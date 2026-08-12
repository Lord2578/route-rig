import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { PROXIMITY_TASK_NAME, setProximityTarget } from '../tasks/proximity-task';

type LatLng = { latitude: number; longitude: number };

async function stopIfRunning() {
  const started = await Location.hasStartedLocationUpdatesAsync(PROXIMITY_TASK_NAME);
  if (started) {
    await Location.stopLocationUpdatesAsync(PROXIMITY_TASK_NAME);
  }
}

export function useProximityNotification(destination: LatLng | null) {
  useEffect(() => {
    setProximityTarget(destination);

    if (!destination) {
      stopIfRunning();
      return;
    }

    (async () => {
      const [{ status: foregroundStatus }, { status: notificationStatus }] = await Promise.all([
        Location.requestForegroundPermissionsAsync(),
        Notifications.requestPermissionsAsync(),
      ]);
      if (foregroundStatus !== 'granted' || notificationStatus !== 'granted') {
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        return;
      }

      const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(PROXIMITY_TASK_NAME);
      if (!alreadyStarted) {
        await Location.startLocationUpdatesAsync(PROXIMITY_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 50,
          pausesUpdatesAutomatically: false,
          foregroundService: {
            notificationTitle: 'RouteRig is tracking your route',
            notificationBody: "We'll alert you when you're close to your destination.",
          },
        });
      }
    })();
  }, [destination]);

  useEffect(() => {
    return () => {
      stopIfRunning();
    };
  }, []);
}
