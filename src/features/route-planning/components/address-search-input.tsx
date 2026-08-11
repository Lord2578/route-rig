import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { GeocodeResult } from '../api/geocode';
import { useAddressSearch } from '../hooks/use-address-search';

type Props = {
  placeholder: string;
  onSelect: (result: GeocodeResult) => void;
  initialValue?: string;
};

export const AddressSearchInput = ({ placeholder, onSelect, initialValue }: Props) => {
  const [query, setQuery] = useState(initialValue ?? '');
  const [showResults, setShowResults] = useState(false);
  const { data: results, isLoading } = useAddressSearch(query);

  // Reflects a value set programmatically by the parent (e.g. "current location"
  // as the default origin) without clobbering text the user is actively typing.
  useEffect(() => {
    if (initialValue && !showResults) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSelect = (result: GeocodeResult) => {
    setQuery(result.label);
    setShowResults(false);
    onSelect(result);
  };

  return (
    <View>
      <TextInput
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowResults(true);
        }}
      />
      {isLoading && <Text className="px-3 py-1 text-gray-400">Searching…</Text>}
      {showResults && results && results.length > 0 && (
        <FlatList
          className="max-h-60 rounded-lg border border-gray-700 bg-gray-800"
          data={results}
          keyExtractor={(item, index) => `${item.label}-${index}`}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="border-b border-gray-700 px-3 py-2"
              onPress={() => handleSelect(item)}
            >
              <Text className="text-white">{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
