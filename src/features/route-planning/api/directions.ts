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

export type Maneuver = {
  instruction: string;
  distanceMeters: number;
  waypointEndIndex: number;
};

export type RouteResult = {
  points: RoutePoint[];
  distanceMeters: number;
  durationSeconds: number;
  maneuvers: Maneuver[];
};

type OrsDirectionsResponse = {
  features: {
    geometry: {
      coordinates: [number, number][];
    };
    properties: {
      segments?: {
        distance: number;
        duration: number;
        steps?: { instruction: string; distance: number; waypoints?: [number, number] }[];
      }[];
    };
  }[];
};

type DirectionsRequestBody = {
  coordinates: [number, number][];
  instructions: true;
  options?: {
    vehicle_type: string;
    profile_params: {
      restrictions: { height: number; weight: number; length: number };
    };
  };
};

export function buildDirectionsRequestBody(
  profile: 'driving-hgv' | 'driving-car',
  waypoints: GeocodeResult[],
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
    coordinates: waypoints.map((waypoint) => [waypoint.longitude, waypoint.latitude]),
    instructions: true,
    ...(options ? { options } : {}),
  };
}

async function fetchRoute(
  profile: 'driving-hgv' | 'driving-car',
  waypoints: GeocodeResult[],
  restrictions?: TruckRestrictions
): Promise<RouteResult> {
  const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: {
      Authorization: process.env.EXPO_PUBLIC_ORS_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildDirectionsRequestBody(profile, waypoints, restrictions)),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many route requests — please wait a moment and try again.');
    }
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Routing request failed: ${response.status}`);
  }

  const data: OrsDirectionsResponse = await response.json();
  const feature = data.features?.[0];

  if (!feature) {
    throw new Error('No route found for the given waypoints.');
  }

  const segments = feature.properties.segments ?? [];

  const maneuvers: Maneuver[] = segments.flatMap((segment) =>
    (segment.steps ?? []).map((step) => ({
      instruction: step.instruction,
      distanceMeters: step.distance,
      waypointEndIndex: step.waypoints?.[1] ?? 0,
    }))
  );

  let distanceMeters = 0;
  let durationSeconds = 0;
  for (const segment of segments) {
    distanceMeters += segment.distance;
    durationSeconds += segment.duration;
  }

  return {
    points: feature.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanceMeters,
    durationSeconds,
    maneuvers,
  };
}

export function getTruckRoute(waypoints: GeocodeResult[], restrictions: TruckRestrictions): Promise<RouteResult> {
  return fetchRoute('driving-hgv', waypoints, restrictions);
}
