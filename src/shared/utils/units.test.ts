import { feetToMeters, lbsToTons, metersToFeet, tonsToLbs } from './units';

describe('feetToMeters / metersToFeet', () => {
  it('converts feet to meters', () => {
    expect(feetToMeters(13.5)).toBeCloseTo(4.1148, 4);
  });

  it('round-trips back to the original value', () => {
    expect(metersToFeet(feetToMeters(53))).toBeCloseTo(53, 6);
  });
});

describe('lbsToTons / tonsToLbs', () => {
  it('converts pounds to metric tons', () => {
    expect(lbsToTons(80000)).toBeCloseTo(36.2874, 4);
  });

  it('round-trips back to the original value', () => {
    expect(tonsToLbs(lbsToTons(80000))).toBeCloseTo(80000, 4);
  });
});
