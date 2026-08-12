import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TruckRestrictions } from '../../route-planning/api/directions';
import { getTruckProfile, saveTruckProfile } from '../api/storage';

const QUERY_KEY = ['truck-profile'];

export function useTruckProfile() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getTruckProfile });
}

export function useSaveTruckProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: TruckRestrictions) => saveTruckProfile(profile),
    onSuccess: (_data, profile) => queryClient.setQueryData(QUERY_KEY, profile),
  });
}
