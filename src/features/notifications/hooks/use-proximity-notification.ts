import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { haversineDistanceMeters } from '../../../shared/utils/geo';

const PROXIMITY_THRESHOLD_METERS = 500;

type LatLng = { latitude: number; longitude: number };

export function useProximityNotification(destination: LatLng | null) {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!destination) {
      return;
    }

    notifiedRef.current = false;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 20 },
        (position) => {
          if (notifiedRef.current) {
            return;
          }

          const distance = haversineDistanceMeters(
            { latitude: position.coords.latitude, longitude: position.coords.longitude },
            destination
          );

          if (distance <= PROXIMITY_THRESHOLD_METERS) {
            notifiedRef.current = true;
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'Approaching destination',
                body: "You're less than 500m from your destination.",
              },
              trigger: null,
            });
          }
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, [destination]);
}
