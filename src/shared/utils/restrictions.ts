import type { TruckRestrictions } from '../../features/route-planning/api/directions';

export function restrictionsMismatch(a: TruckRestrictions, b: TruckRestrictions): boolean {
  return a.heightMeters !== b.heightMeters || a.weightTons !== b.weightTons || a.lengthMeters !== b.lengthMeters;
}
