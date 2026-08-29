import { getCurrentManeuverIndex } from './maneuver';
import type { Maneuver } from '../api/directions';

// Polyline: 0──5──12──12
// Maneuver 0: "Head north"  ends at index 5
// Maneuver 1: "Turn right"  ends at index 12
// Maneuver 2: "Arrive"      ends at index 12
const maneuvers: Maneuver[] = [
  { instruction: 'Head north on Main St', distanceMeters: 400, waypointEndIndex: 5 },
  { instruction: 'Turn right onto 2nd Ave', distanceMeters: 600, waypointEndIndex: 12 },
  { instruction: 'Arrive at destination', distanceMeters: 0, waypointEndIndex: 12 },
];

describe('getCurrentManeuverIndex', () => {
  it('returns 0 when progressIndex is at the start of the route', () => {
    expect(getCurrentManeuverIndex(0, maneuvers)).toBe(0);
  });

  it('returns 0 while progressIndex is still within the first maneuver', () => {
    expect(getCurrentManeuverIndex(4, maneuvers)).toBe(0);
  });

  it('advances to the next maneuver when progressIndex reaches the boundary', () => {
    expect(getCurrentManeuverIndex(5, maneuvers)).toBe(1);
  });

  it('returns the last maneuver index when progressIndex is at or beyond the end', () => {
    expect(getCurrentManeuverIndex(12, maneuvers)).toBe(2);
  });
});
