import type { Maneuver } from '../api/directions';

export function getCurrentManeuverIndex(progressIndex: number, maneuvers: Maneuver[]): number {
  for (let i = 0; i < maneuvers.length; i++) {
    if (progressIndex < maneuvers[i].waypointEndIndex) return i;
  }
  return maneuvers.length - 1;
}
