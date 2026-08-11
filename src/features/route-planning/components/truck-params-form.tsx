import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { TruckRestrictions } from '../api/directions';

type Props = {
  onSubmit: (restrictions: TruckRestrictions) => void;
  disabled?: boolean;
};

export const TruckParamsForm = ({ onSubmit, disabled }: Props) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');

  const isValid = Number(height) > 0 && Number(weight) > 0 && Number(length) > 0;

  return (
    <View className="flex-row gap-2">
      <TextInput
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
        placeholder="Height (m)"
        keyboardType="decimal-pad"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
        placeholder="Weight (t)"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
        placeholder="Length (m)"
        keyboardType="decimal-pad"
        value={length}
        onChangeText={setLength}
      />
      <TouchableOpacity
        className="items-center justify-center rounded-lg bg-blue-600 px-4 py-2 disabled:opacity-40"
        disabled={!isValid || disabled}
        onPress={() =>
          onSubmit({
            heightMeters: Number(height),
            weightTons: Number(weight),
            lengthMeters: Number(length),
          })
        }
      >
        <Text className="font-semibold text-white">Go</Text>
      </TouchableOpacity>
    </View>
  );
};
