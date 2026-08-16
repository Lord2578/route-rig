import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UnitSystem } from '../../../shared/utils/units';
import { getUnitSystem, saveUnitSystem } from '../api/storage';

const QUERY_KEY = ['unit-system'];

export function useUnitSystem() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getUnitSystem });
}

export function useSaveUnitSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitSystem: UnitSystem) => saveUnitSystem(unitSystem),
    onSuccess: (_data, unitSystem) => queryClient.setQueryData(QUERY_KEY, unitSystem),
  });
}
