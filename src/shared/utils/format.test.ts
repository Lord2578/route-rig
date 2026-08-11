import { formatDistance, formatDuration } from './format';

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
