import { restrictionsMismatch } from './restrictions';

const base = { heightMeters: 4, weightTons: 20, lengthMeters: 12 };

describe('restrictionsMismatch', () => {
  it('returns false when all three fields are identical', () => {
    expect(restrictionsMismatch(base, { ...base })).toBe(false);
  });

  it('returns true when heightMeters differs', () => {
    expect(restrictionsMismatch(base, { ...base, heightMeters: 3.5 })).toBe(true);
  });

  it('returns true when weightTons differs', () => {
    expect(restrictionsMismatch(base, { ...base, weightTons: 15 })).toBe(true);
  });

  it('returns true when lengthMeters differs', () => {
    expect(restrictionsMismatch(base, { ...base, lengthMeters: 16.5 })).toBe(true);
  });
});
