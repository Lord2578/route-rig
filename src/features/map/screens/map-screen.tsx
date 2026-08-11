import { useRef } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import { useCurrentLocation } from '../hooks/use-current-location';

export const MapScreen = () => {
  const { location, errorMsg } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

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
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={region} showsUserLocation />
      <TouchableOpacity
        className="absolute bottom-8 right-4 rounded-lg bg-white px-4 py-2.5 shadow-md android:[elevation:3]"
        onPress={() => mapRef.current?.animateToRegion(region, 500)}
      >
        <Text className="font-semibold">Center</Text>
      </TouchableOpacity>
    </View>
  );
};
