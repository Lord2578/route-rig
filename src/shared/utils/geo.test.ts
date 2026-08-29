import { distanceToPolyline, getClosestPointIndex, haversineDistanceMeters, isWithinMeters } from './geo';

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

describe('isWithinMeters', () => {
  const kyiv = { latitude: 50.4501, longitude: 30.5234 };

  it('returns true when the two points are identical', () => {
    expect(isWithinMeters(kyiv, kyiv, 500)).toBe(true);
  });

  it('returns false for points ~1204 km apart with a 500 m threshold', () => {
    const berlin = { latitude: 52.52, longitude: 13.405 };
    expect(isWithinMeters(kyiv, berlin, 500)).toBe(false);
  });

  it('returns true for points ~110 m apart with a 500 m threshold', () => {
    // ~0.001° latitude ≈ 111 m
    const nearby = { latitude: 50.4511, longitude: 30.5234 };
    expect(isWithinMeters(kyiv, nearby, 500)).toBe(true);
  });

  it('returns false for points ~110 m apart when threshold is 100 m', () => {
    const nearby = { latitude: 50.4511, longitude: 30.5234 };
    expect(isWithinMeters(kyiv, nearby, 100)).toBe(false);
  });
});

describe('getClosestPointIndex', () => {
  const p0 = { latitude: 0, longitude: 0 };
  const p1 = { latitude: 0.01, longitude: 0 };
  const p2 = { latitude: 0.02, longitude: 0 };

  it('returns 0 when position is exactly at the first point', () => {
    expect(getClosestPointIndex(p0, [p0, p1, p2])).toBe(0);
  });

  it('returns the last index when position is exactly at the last point', () => {
    expect(getClosestPointIndex(p2, [p0, p1, p2])).toBe(2);
  });

  it('returns the index of the nearest point when between two points', () => {
    // slightly closer to p1 than to p0 or p2
    const nearP1 = { latitude: 0.009, longitude: 0 };
    expect(getClosestPointIndex(nearP1, [p0, p1, p2])).toBe(1);
  });
});

describe('distanceToPolyline', () => {
  // Segment along longitude=0: from (0,0) to (0.01,0)
  const a = { latitude: 0, longitude: 0 };
  const b = { latitude: 0.01, longitude: 0 };

  it('returns 0 when position is exactly on a polyline point', () => {
    expect(distanceToPolyline(a, [a, b])).toBeCloseTo(0, 1);
  });

  it('returns ~0 when position is exactly on the midpoint of a segment', () => {
    const mid = { latitude: 0.005, longitude: 0 };
    expect(distanceToPolyline(mid, [a, b])).toBeCloseTo(0, 1);
  });

  it('returns ~111 m when position is offset 0.001° longitude perpendicular to segment', () => {
    // At equator, 1° longitude ≈ 111 km → 0.001° ≈ 111 m
    const offset = { latitude: 0.005, longitude: 0.001 };
    const dist = distanceToPolyline(offset, [a, b]);
    expect(dist).toBeGreaterThan(100);
    expect(dist).toBeLessThan(120);
  });

  it('returns the minimum distance across all segments in a multi-segment polyline', () => {
    const c = { latitude: 0.02, longitude: 0 };
    // Position is directly beside the second segment, far from the first
    const nearSecond = { latitude: 0.015, longitude: 0.001 };
    const distMulti = distanceToPolyline(nearSecond, [a, b, c]);
    const distFirstOnly = distanceToPolyline(nearSecond, [a, b]);
    expect(distMulti).toBeLessThan(distFirstOnly);
  });
});
