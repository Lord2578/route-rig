import type { TruckRestrictions } from '../route-planning/api/directions';

export type TruckProfileEntry = {
  id: string;
  name: string;
  restrictions: TruckRestrictions;
};
