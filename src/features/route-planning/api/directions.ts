import type { GeocodeResult } from './geocode';

export type TruckRestrictions = {
  heightMeters: number;
  weightTons: number;
  lengthMeters: number;
};

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export type RouteResult = {
  points: RoutePoint[];
  distanceMeters: number;
  durationSeconds: number;
};

type OrsDirectionsResponse = {
  features: {
    geometry: {
      coordinates: [number, number][];
    };
    properties: {
      segments: { distance: number; duration: number }[];
    };
  }[];
};

type DirectionsRequestBody = {
  coordinates: [number, number][];
  options?: {
    vehicle_type: string;
    profile_params: {
      restrictions: { height: number; weight: number; length: number };
    };
  };
};

export function buildDirectionsRequestBody(
  profile: 'driving-hgv' | 'driving-car',
  origin: GeocodeResult,
  destination: GeocodeResult,
  restrictions?: TruckRestrictions
): DirectionsRequestBody {
  const options =
    profile === 'driving-hgv' && restrictions
      ? {
          vehicle_type: 'hgv',
          profile_params: {
            restrictions: {
              height: restrictions.heightMeters,
              weight: restrictions.weightTons,
              length: restrictions.lengthMeters,
            },
          },
        }
      : undefined;

  return {
    coordinates: [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ],
    ...(options ? { options } : {}),
  };
}

async function fetchRoute(
  profile: 'driving-hgv' | 'driving-car',
  origin: GeocodeResult,
  destination: GeocodeResult,
  restrictions?: TruckRestrictions
): Promise<RouteResult> {
  const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: {
      Authorization: process.env.EXPO_PUBLIC_ORS_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildDirectionsRequestBody(profile, origin, destination, restrictions)),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Routing request failed: ${response.status}`);
  }

  const data: OrsDirectionsResponse = await response.json();
  const feature = data.features[0];
  const segment = feature.properties.segments[0];

  return {
    points: feature.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanceMeters: segment.distance,
    durationSeconds: segment.duration,
  };
}

export function getTruckRoute(
  origin: GeocodeResult,
  destination: GeocodeResult,
  restrictions: TruckRestrictions
): Promise<RouteResult> {
  return fetchRoute('driving-hgv', origin, destination, restrictions);
}

export function getCarRoute(origin: GeocodeResult, destination: GeocodeResult): Promise<RouteResult> {
  return fetchRoute('driving-car', origin, destination);
}
