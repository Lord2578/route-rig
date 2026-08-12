import { memo } from 'react';
import { View } from 'react-native';

import { IconButton } from '../../../shared/components/icon-button';
import type { GeocodeResult } from '../api/geocode';
import type { WaypointSlot } from '../hooks/use-waypoints';
import { AddressSearchInput } from './address-search-input';

type Props = {
  slot: WaypointSlot;
  placeholder: string;
  onUpdate: (id: string, result: GeocodeResult) => void;
  onRemove?: (id: string) => void;
};

export const WaypointRow = memo(function WaypointRow({ slot, placeholder, onUpdate, onRemove }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        <AddressSearchInput
          placeholder={placeholder}
          onSelect={(result) => onUpdate(slot.id, result)}
          initialValue={slot.value?.label}
        />
      </View>
      {onRemove && (
        <IconButton
          name="close"
          size={16}
          color="#F87171"
          className="h-8 w-8 items-center justify-center rounded-full border border-gray-600 bg-gray-800"
          onPress={() => onRemove(slot.id)}
        />
      )}
    </View>
  );
});
