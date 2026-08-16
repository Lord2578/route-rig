import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UnitSystem } from '../../../shared/utils/units';

const STORAGE_KEY = 'routerig:unit-system';

export async function getUnitSystem(): Promise<UnitSystem> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored === 'metric' ? 'metric' : 'imperial';
}

export async function saveUnitSystem(unitSystem: UnitSystem): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, unitSystem);
}
