import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useCurrentLocation = (shouldRequest: boolean) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldRequest) {
      return;
    }

    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, [shouldRequest]);

  return { location, errorMsg };
};
