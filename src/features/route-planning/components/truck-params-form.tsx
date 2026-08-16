import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppTextInput } from '../../../shared/components/app-text-input';
import { feetToMeters, lbsToTons, metersToFeet, tonsToLbs } from '../../../shared/utils/units';
import type { TruckRestrictions } from '../api/directions';

type Props = {
  onSubmit: (restrictions: TruckRestrictions) => void;
  disabled?: boolean;
  initialRestrictions?: TruckRestrictions;
};

const toImperial = (restrictions: TruckRestrictions) => ({
  height: `${Math.round(metersToFeet(restrictions.heightMeters) * 10) / 10}`,
  weight: `${Math.round(tonsToLbs(restrictions.weightTons))}`,
  length: `${Math.round(metersToFeet(restrictions.lengthMeters) * 10) / 10}`,
});

export const TruckParamsForm = ({ onSubmit, disabled, initialRestrictions }: Props) => {
  const initial = initialRestrictions ? toImperial(initialRestrictions) : null;
  const [height, setHeight] = useState(initial?.height ?? '');
  const [weight, setWeight] = useState(initial?.weight ?? '');
  const [length, setLength] = useState(initial?.length ?? '');

  useEffect(() => {
    if (initialRestrictions) {
      const imperial = toImperial(initialRestrictions);
      setHeight(imperial.height);
      setWeight(imperial.weight);
      setLength(imperial.length);
    }
  }, [initialRestrictions]);

  const isValid = Number(height) > 0 && Number(weight) > 0 && Number(length) > 0;

  const fields = [
    { key: 'height', placeholder: 'Height (ft)', value: height, onChangeText: setHeight },
    { key: 'weight', placeholder: 'Weight (lbs)', value: weight, onChangeText: setWeight },
    { key: 'length', placeholder: 'Length (ft)', value: length, onChangeText: setLength },
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
            heightMeters: feetToMeters(Number(height)),
            weightTons: lbsToTons(Number(weight)),
            lengthMeters: feetToMeters(Number(length)),
          })
        }
      >
        <Text className="font-semibold text-white">Go</Text>
      </TouchableOpacity>
    </View>
  );
};
