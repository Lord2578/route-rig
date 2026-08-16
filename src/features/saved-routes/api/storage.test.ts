import { normalize, type LegacyStoredRoute } from './storage';
import type { SavedRoute } from '../types';

const origin = { label: 'Warsaw', latitude: 52.2297, longitude: 21.0122 };
const destination = { label: 'Berlin', latitude: 52.52, longitude: 13.405 };
const restrictions = { heightMeters: 4, weightTons: 40, lengthMeters: 16 };

describe('normalize', () => {
  it('passes through a route already in the current waypoints format unchanged', () => {
    const route: SavedRoute = {
      id: '1',
      waypoints: [origin, destination],
      restrictions,
      createdAt: 1000,
    };

    expect(normalize(route)).toEqual(route);
  });

  it('migrates a legacy origin/destination route into the waypoints format', () => {
    const legacyRoute: LegacyStoredRoute = {
      id: '1',
      origin,
      destination,
      restrictions,
      createdAt: 1000,
    };

    expect(normalize(legacyRoute)).toEqual({
      id: '1',
      waypoints: [origin, destination],
      restrictions,
      createdAt: 1000,
    });
  });
});
