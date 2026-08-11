import { skipToken, useQuery } from '@tanstack/react-query';

import { getCarRoute, getTruckRoute, type TruckRestrictions } from '../api/directions';
import type { GeocodeResult } from '../api/geocode';

export function useTruckRoute(
  origin: GeocodeResult | null,
  destination: GeocodeResult | null,
  restrictions: TruckRestrictions | null
) {
  return useQuery({
    queryKey: ['truck-route', origin, destination, restrictions],
    queryFn:
      origin && destination && restrictions
        ? () => getTruckRoute(origin, destination, restrictions)
        : skipToken,
  });
}

export function useCarRoute(origin: GeocodeResult | null, destination: GeocodeResult | null) {
  return useQuery({
    queryKey: ['car-route', origin, destination],
    queryFn: origin && destination ? () => getCarRoute(origin, destination) : skipToken,
  });
}
