const METERS_PER_FOOT = 0.3048;
const LBS_PER_METRIC_TON = 2204.6226218;

export function feetToMeters(feet: number): number {
  return feet * METERS_PER_FOOT;
}

export function metersToFeet(meters: number): number {
  return meters / METERS_PER_FOOT;
}

export function lbsToTons(lbs: number): number {
  return lbs / LBS_PER_METRIC_TON;
}

export function tonsToLbs(tons: number): number {
  return tons * LBS_PER_METRIC_TON;
}
