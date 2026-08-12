import { formatDistance, formatDuration, formatRouteDelta } from './format';

describe('formatDistance', () => {
  it('converts meters to kilometers with one decimal place', () => {
    expect(formatDistance(1500)).toBe('1.5 km');
  });

  it('rounds to the nearest tenth of a kilometer', () => {
    expect(formatDistance(1234)).toBe('1.2 km');
  });

  it('handles zero', () => {
    expect(formatDistance(0)).toBe('0.0 km');
  });
});

describe('formatDuration', () => {
  it('shows only minutes under one hour', () => {
    expect(formatDuration(1800)).toBe('30 min');
  });

  it('shows hours and minutes at or above one hour', () => {
    expect(formatDuration(5400)).toBe('1h 30min');
  });

  it('rounds seconds to the nearest minute', () => {
    expect(formatDuration(150)).toBe('3 min');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0 min');
  });

  it('rolls over to the next hour when minutes round up to 60', () => {
    expect(formatDuration(3599)).toBe('1h 0min');
  });
});

describe('formatRouteDelta', () => {
  it('formats a positive delta with + signs', () => {
    expect(formatRouteDelta(12400, 1080)).toBe('+12.4 km · +18 min vs car');
  });

  it('formats a negative delta with − signs, using the absolute value', () => {
    expect(formatRouteDelta(-5000, -600)).toBe('−5.0 km · −10 min vs car');
  });

  it('handles mixed-sign deltas independently per unit', () => {
    expect(formatRouteDelta(2000, -300)).toBe('+2.0 km · −5 min vs car');
  });

  it('handles a zero delta', () => {
    expect(formatRouteDelta(0, 0)).toBe('+0.0 km · +0 min vs car');
  });
});
