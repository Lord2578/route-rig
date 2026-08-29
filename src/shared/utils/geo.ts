export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_METERS = 6371000;

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function isWithinMeters(a: LatLng, b: LatLng, meters: number): boolean {
  return haversineDistanceMeters(a, b) <= meters;
}

function distanceToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.longitude - a.longitude;
  const dy = b.latitude - a.latitude;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversineDistanceMeters(p, a);
  const t = Math.max(0, Math.min(1, ((p.longitude - a.longitude) * dx + (p.latitude - a.latitude) * dy) / lenSq));
  return haversineDistanceMeters(p, { latitude: a.latitude + t * dy, longitude: a.longitude + t * dx });
}

export function getClosestPointIndex(position: LatLng, points: LatLng[]): number {
  let minDist = Infinity;
  let minIndex = 0;
  for (let i = 0; i < points.length; i++) {
    const d = haversineDistanceMeters(position, points[i]);
    if (d < minDist) {
      minDist = d;
      minIndex = i;
    }
  }
  return minIndex;
}

export function distanceToPolyline(position: LatLng, points: LatLng[]): number {
  let min = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const d = distanceToSegment(position, points[i], points[i + 1]);
    if (d < min) min = d;
  }
  return min;
}
