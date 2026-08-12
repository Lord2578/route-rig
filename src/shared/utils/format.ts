export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${minutes}min`;
}

export function formatRouteDelta(deltaDistanceMeters: number, deltaDurationSeconds: number): string {
  const distanceSign = deltaDistanceMeters >= 0 ? '+' : '−';
  const durationSign = deltaDurationSeconds >= 0 ? '+' : '−';
  return `${distanceSign}${formatDistance(Math.abs(deltaDistanceMeters))} · ${durationSign}${formatDuration(
    Math.abs(deltaDurationSeconds)
  )} vs car`;
}
