import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TruckRestrictions } from '../../route-planning/api/directions';

const STORAGE_KEY = 'routerig:truck-profile';

export async function getTruckProfile(): Promise<TruckRestrictions | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveTruckProfile(profile: TruckRestrictions): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
