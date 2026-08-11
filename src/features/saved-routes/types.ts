import type { TruckRestrictions } from '../route-planning/api/directions';
import type { GeocodeResult } from '../route-planning/api/geocode';

export type SavedRoute = {
  id: string;
  origin: GeocodeResult;
  destination: GeocodeResult;
  restrictions: TruckRestrictions;
  createdAt: number;
};
