import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { deleteRoute, getSavedRoutes, saveRoute } from '../api/storage';
import type { SavedRoute } from '../types';

const QUERY_KEY = ['saved-routes'];

export function useSavedRoutes() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getSavedRoutes });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (route: Omit<SavedRoute, 'id' | 'createdAt'>) => saveRoute(route),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
