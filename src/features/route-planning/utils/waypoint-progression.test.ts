import { getNextUnvisitedWaypoint } from './waypoint-progression';
import type { WaypointSlot } from '../hooks/use-waypoints';

const makeSlot = (id: string, lat: number): WaypointSlot => ({
  id,
  value: { label: id, latitude: lat, longitude: 0 },
});

const a = makeSlot('a', 1);
const b = makeSlot('b', 2);
const c = makeSlot('c', 3);

describe('getNextUnvisitedWaypoint', () => {
  it('returns null when all waypoints are visited', () => {
    expect(getNextUnvisitedWaypoint([a, b, c], new Set(['a', 'b', 'c']))).toBeNull();
  });

  it('returns the first slot when nothing is visited', () => {
    expect(getNextUnvisitedWaypoint([a, b, c], new Set())).toEqual({ id: 'a', value: a.value });
  });

  it('skips visited slots and returns the next unvisited one', () => {
    expect(getNextUnvisitedWaypoint([a, b, c], new Set(['a']))).toEqual({ id: 'b', value: b.value });
  });

  it('returns null when the only slot has no value', () => {
    const empty: WaypointSlot = { id: 'x', value: null };
    expect(getNextUnvisitedWaypoint([empty], new Set())).toBeNull();
  });
});
