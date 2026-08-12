import { useCallback, useRef, useState } from 'react';

import type { GeocodeResult } from '../api/geocode';

export type WaypointSlot = {
  id: string;
  value: GeocodeResult | null;
};

export function useWaypoints(initial?: GeocodeResult[]) {
  const nextIdRef = useRef(0);
  const createId = () => {
    nextIdRef.current += 1;
    return `waypoint-${nextIdRef.current}`;
  };

  const [slots, setSlots] = useState<WaypointSlot[]>(() =>
    initial && initial.length >= 2
      ? initial.map((value) => ({ id: createId(), value }))
      : [
          { id: createId(), value: null },
          { id: createId(), value: null },
        ]
  );

  const updateWaypoint = useCallback((id: string, value: GeocodeResult) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, value } : slot)));
  }, []);

  const addStop = useCallback(() => {
    const id = createId();
    setSlots((prev) => [...prev.slice(0, -1), { id, value: null }, prev[prev.length - 1]]);
  }, []);

  const removeStop = useCallback((id: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  }, []);

  const values = slots.map((slot) => slot.value);
  const origin = values[0] ?? null;
  const destination = values[values.length - 1] ?? null;
  const resolved: GeocodeResult[] | null =
    values.length >= 2 && values.every((value) => value) ? (values as GeocodeResult[]) : null;

  return { slots, updateWaypoint, addStop, removeStop, origin, destination, resolved };
}
