import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteTruckProfileEntry, getTruckProfiles, saveTruckProfileEntry } from '../api/profiles-storage';
import type { TruckProfileEntry } from '../types';

const QUERY_KEY = ['truck-profiles'];

export function useTruckProfiles() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getTruckProfiles });
}

export function useSaveTruckProfileEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<TruckProfileEntry, 'id'>) => saveTruckProfileEntry(entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTruckProfileEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTruckProfileEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
