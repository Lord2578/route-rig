import { skipToken, useQuery } from '@tanstack/react-query';

import { getCarRoute, getTruckRoute, type TruckRestrictions } from '../api/directions';
import type { GeocodeResult } from '../api/geocode';

export function useTruckRoute(waypoints: GeocodeResult[] | null, restrictions: TruckRestrictions | null) {
  return useQuery({
    queryKey: ['truck-route', waypoints, restrictions],
    queryFn: waypoints && restrictions ? () => getTruckRoute(waypoints, restrictions) : skipToken,
  });
}

export function useCarRoute(waypoints: GeocodeResult[] | null) {
  return useQuery({
    queryKey: ['car-route', waypoints],
    queryFn: waypoints ? () => getCarRoute(waypoints) : skipToken,
  });
}
