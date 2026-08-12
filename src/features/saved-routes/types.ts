import type { TruckRestrictions } from '../route-planning/api/directions';
import type { GeocodeResult } from '../route-planning/api/geocode';

export type SavedRoute = {
  id: string;
  waypoints: GeocodeResult[];
  restrictions: TruckRestrictions;
  createdAt: number;
};
