import { memo, useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { AppTextInput } from '../../../shared/components/app-text-input';
import type { GeocodeResult } from '../api/geocode';
import { useAddressSearch } from '../hooks/use-address-search';

type Props = {
  placeholder: string;
  onSelect: (result: GeocodeResult) => void;
  initialValue?: string;
};

type ResultItemProps = {
  item: GeocodeResult;
  onPress: (item: GeocodeResult) => void;
};

const ResultItem = memo(function ResultItem({ item, onPress }: ResultItemProps) {
  return (
    <TouchableOpacity className="border-b border-gray-700 px-3 py-2" onPress={() => onPress(item)}>
      <Text className="text-white">{item.label}</Text>
    </TouchableOpacity>
  );
});

export const AddressSearchInput = ({ placeholder, onSelect, initialValue }: Props) => {
  const [query, setQuery] = useState(initialValue ?? '');
  const [showResults, setShowResults] = useState(false);
  const { data: results, isLoading } = useAddressSearch(query);

  useEffect(() => {
    if (initialValue && !showResults) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSelect = useCallback(
    (result: GeocodeResult) => {
      setQuery(result.label);
      setShowResults(false);
      onSelect(result);
    },
    [onSelect]
  );

  return (
    <View>
      <AppTextInput
        placeholder={placeholder}
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
          renderItem={({ item }) => <ResultItem item={item} onPress={handleSelect} />}
        />
      )}
    </View>
  );
};
