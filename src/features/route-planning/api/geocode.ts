export type GeocodeResult = {
  label: string;
  latitude: number;
  longitude: number;
};

type OrsFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    label: string;
  };
};

type OrsGeocodeResponse = {
  features: OrsFeature[];
};

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${process.env.EXPO_PUBLIC_ORS_API_KEY}&text=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const data: OrsGeocodeResponse = await response.json();

  return data.features.map((feature) => ({
    label: feature.properties.label,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
  }));
}
