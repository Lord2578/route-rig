import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavedRoute } from '../types';

const STORAGE_KEY = 'routerig:saved-routes';

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveRoute(route: Omit<SavedRoute, 'id' | 'createdAt'>): Promise<void> {
  const routes = await getSavedRoutes();
  const newRoute: SavedRoute = {
    ...route,
    id: `${Date.now()}`,
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newRoute, ...routes]));
}

export async function deleteRoute(id: string): Promise<void> {
  const routes = await getSavedRoutes();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(routes.filter((route) => route.id !== id)));
}
