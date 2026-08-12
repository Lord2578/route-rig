import { buildDirectionsRequestBody } from './directions';
import type { GeocodeResult } from './geocode';

const origin: GeocodeResult = { label: 'Warsaw', latitude: 52.2297, longitude: 21.0122 };
const destination: GeocodeResult = { label: 'Berlin', latitude: 52.52, longitude: 13.405 };
const stop: GeocodeResult = { label: 'Krakow', latitude: 50.0647, longitude: 19.945 };

describe('buildDirectionsRequestBody', () => {
  it('orders coordinates as [longitude, latitude], not [latitude, longitude]', () => {
    const body = buildDirectionsRequestBody('driving-car', [origin, destination]);

    expect(body.coordinates).toEqual([
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ]);
  });

  it('includes an intermediate stop in coordinate order', () => {
    const body = buildDirectionsRequestBody('driving-car', [origin, stop, destination]);

    expect(body.coordinates).toEqual([
      [origin.longitude, origin.latitude],
      [stop.longitude, stop.latitude],
      [destination.longitude, destination.latitude],
    ]);
  });

  it('omits options entirely for a car route', () => {
    const body = buildDirectionsRequestBody('driving-car', [origin, destination]);

    expect(body.options).toBeUndefined();
  });

  it('omits options for a truck route with no restrictions provided', () => {
    const body = buildDirectionsRequestBody('driving-hgv', [origin, destination]);

    expect(body.options).toBeUndefined();
  });

  it('maps truck restrictions into options.profile_params.restrictions', () => {
    const body = buildDirectionsRequestBody('driving-hgv', [origin, destination], {
      heightMeters: 4,
      weightTons: 40,
      lengthMeters: 16.5,
    });

    expect(body.options).toEqual({
      vehicle_type: 'hgv',
      profile_params: {
        restrictions: { height: 4, weight: 40, length: 16.5 },
      },
    });
  });
});
