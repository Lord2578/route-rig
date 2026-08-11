import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      {/* BottomSheetTextInput/BottomSheetFlatList are @gorhom/bottom-sheet's own
          components, not registered with NativeWind's cssInterop — use `style`. */}
      <BottomSheetTextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={(text: string) => {
          setQuery(text);
          setShowResults(true);
        }}
      />
      {isLoading && <Text className="px-3 py-1 text-gray-400">Searching…</Text>}
      {showResults && results && results.length > 0 && (
        <BottomSheetFlatList
          style={styles.results}
          data={results}
          keyExtractor={(item, index) => `${item.label}-${index}`}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="border-b border-gray-100 px-3 py-2"
              onPress={() => handleSelect(item)}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  results: {
    maxHeight: 240,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
});
