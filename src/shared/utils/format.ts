import { metersToFeet, tonsToLbs, type UnitSystem } from './units';

export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${minutes}min`;
}

export function formatTruckRestrictions(
  heightMeters: number,
  weightTons: number,
  lengthMeters: number,
  unitSystem: UnitSystem
): string {
  if (unitSystem === 'metric') {
    return `${heightMeters}m height · ${weightTons}t weight · ${lengthMeters}m length`;
  }
  const heightFt = Math.round(metersToFeet(heightMeters) * 10) / 10;
  const weightLbs = Math.round(tonsToLbs(weightTons));
  const lengthFt = Math.round(metersToFeet(lengthMeters) * 10) / 10;
  return `${heightFt}ft height · ${weightLbs.toLocaleString()}lbs weight · ${lengthFt}ft length`;
}
