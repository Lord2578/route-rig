import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TruckProfileEntry } from '../types';

const STORAGE_KEY = 'routerig:truck-profiles';

export async function getTruckProfiles(): Promise<TruckProfileEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTruckProfileEntry(entry: Omit<TruckProfileEntry, 'id'>): Promise<void> {
  const profiles = await getTruckProfiles();
  const newEntry: TruckProfileEntry = { ...entry, id: `${Date.now()}` };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...profiles]));
}

export async function deleteTruckProfileEntry(id: string): Promise<void> {
  const profiles = await getTruckProfiles();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.filter((profile) => profile.id !== id)));
}
