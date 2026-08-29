import type { GeocodeResult } from '../api/geocode';
import type { WaypointSlot } from '../hooks/use-waypoints';

export type UnvisitedWaypoint = { id: string; value: GeocodeResult };

export function getNextUnvisitedWaypoint(slots: WaypointSlot[], visitedIds: Set<string>): UnvisitedWaypoint | null {
  for (const slot of slots) {
    if (!visitedIds.has(slot.id) && slot.value) {
      return { id: slot.id, value: slot.value };
    }
  }
  return null;
}
