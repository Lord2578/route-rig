import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppTextInput } from '../../../shared/components/app-text-input';
import type { TruckRestrictions } from '../api/directions';

type Props = {
  onSubmit: (restrictions: TruckRestrictions) => void;
  disabled?: boolean;
  initialRestrictions?: TruckRestrictions;
};

export const TruckParamsForm = ({ onSubmit, disabled, initialRestrictions }: Props) => {
  const [height, setHeight] = useState(initialRestrictions ? `${initialRestrictions.heightMeters}` : '');
  const [weight, setWeight] = useState(initialRestrictions ? `${initialRestrictions.weightTons}` : '');
  const [length, setLength] = useState(initialRestrictions ? `${initialRestrictions.lengthMeters}` : '');

  useEffect(() => {
    if (initialRestrictions) {
      setHeight(`${initialRestrictions.heightMeters}`);
      setWeight(`${initialRestrictions.weightTons}`);
      setLength(`${initialRestrictions.lengthMeters}`);
    }
  }, [initialRestrictions]);

  const isValid = Number(height) > 0 && Number(weight) > 0 && Number(length) > 0;

  const fields = [
    { key: 'height', placeholder: 'Height (m)', value: height, onChangeText: setHeight },
    { key: 'weight', placeholder: 'Weight (t)', value: weight, onChangeText: setWeight },
    { key: 'length', placeholder: 'Length (m)', value: length, onChangeText: setLength },
  ];

  return (
    <View className="flex-row gap-2">
      {fields.map((field) => (
        <AppTextInput
          key={field.key}
          className="flex-1"
          placeholder={field.placeholder}
          keyboardType="decimal-pad"
          value={field.value}
          onChangeText={field.onChangeText}
        />
      ))}
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
