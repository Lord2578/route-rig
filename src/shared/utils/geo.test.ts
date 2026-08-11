import { haversineDistanceMeters } from './geo';

describe('haversineDistanceMeters', () => {
  it('returns 0 for identical points', () => {
    const point = { latitude: 50.4501, longitude: 30.5234 };
    expect(haversineDistanceMeters(point, point)).toBe(0);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { latitude: 50.4501, longitude: 30.5234 };
    const b = { latitude: 52.5200, longitude: 13.4050 };
    expect(haversineDistanceMeters(a, b)).toBeCloseTo(haversineDistanceMeters(b, a), 6);
  });

  it('matches the known straight-line distance between Kyiv and Berlin (~1204 km)', () => {
    const kyiv = { latitude: 50.4501, longitude: 30.5234 };
    const berlin = { latitude: 52.52, longitude: 13.405 };

    const distanceKm = haversineDistanceMeters(kyiv, berlin) / 1000;

    expect(distanceKm).toBeGreaterThan(1190);
    expect(distanceKm).toBeLessThan(1220);
  });

  it('returns a small distance for two nearby points (~111m per 0.001° latitude)', () => {
    const a = { latitude: 50.45, longitude: 30.5234 };
    const b = { latitude: 50.451, longitude: 30.5234 };

    const distance = haversineDistanceMeters(a, b);

    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });
});
