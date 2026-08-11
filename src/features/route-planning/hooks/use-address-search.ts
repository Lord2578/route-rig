import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchAddress } from '../api/geocode';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useAddressSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ['address-search', debouncedQuery],
    queryFn: () => searchAddress(debouncedQuery),
    enabled: debouncedQuery.trim().length >= MIN_QUERY_LENGTH,
  });
}
