import { useQuery } from '@tanstack/react-query';

import { getCarRoute, getTruckRoute, type TruckRestrictions } from '../api/directions';
import type { GeocodeResult } from '../api/geocode';

export function useTruckRoute(
  origin: GeocodeResult | null,
  destination: GeocodeResult | null,
  restrictions: TruckRestrictions | null
) {
  return useQuery({
    queryKey: ['truck-route', origin, destination, restrictions],
    queryFn: () => getTruckRoute(origin!, destination!, restrictions!),
    enabled: !!origin && !!destination && !!restrictions,
  });
}

export function useCarRoute(origin: GeocodeResult | null, destination: GeocodeResult | null) {
  return useQuery({
    queryKey: ['car-route', origin, destination],
    queryFn: () => getCarRoute(origin!, destination!),
    enabled: !!origin && !!destination,
  });
}
