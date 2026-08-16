import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GeocodeResult } from '../../route-planning/api/geocode';
import type { SavedRoute } from '../types';

const STORAGE_KEY = 'routerig:saved-routes';

export type LegacyStoredRoute = Omit<SavedRoute, 'waypoints'> & {
  origin: GeocodeResult;
  destination: GeocodeResult;
};

type StoredRoute = SavedRoute | LegacyStoredRoute;

export function normalize(route: StoredRoute): SavedRoute {
  if ('waypoints' in route) {
    return route;
  }
  const { origin, destination, ...rest } = route;
  return { ...rest, waypoints: [origin, destination] };
}

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const stored: StoredRoute[] = raw ? JSON.parse(raw) : [];
  const hasLegacyFormat = stored.some((route) => !('waypoints' in route));
  const routes = stored.map(normalize);

  if (hasLegacyFormat) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  }

  return routes;
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
