import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppTextInput } from '../../../shared/components/app-text-input';
import { feetToMeters, lbsToTons, metersToFeet, tonsToLbs, type UnitSystem } from '../../../shared/utils/units';
import type { TruckRestrictions } from '../api/directions';

type Props = {
  onSubmit: (restrictions: TruckRestrictions) => void;
  disabled?: boolean;
  initialRestrictions?: TruckRestrictions;
  unitSystem: UnitSystem;
  submitLabel?: string;
};

const toDisplay = (restrictions: TruckRestrictions, unitSystem: UnitSystem) => {
  if (unitSystem === 'metric') {
    return {
      height: `${restrictions.heightMeters}`,
      weight: `${restrictions.weightTons}`,
      length: `${restrictions.lengthMeters}`,
    };
  }
  return {
    height: `${Math.round(metersToFeet(restrictions.heightMeters) * 10) / 10}`,
    weight: `${Math.round(tonsToLbs(restrictions.weightTons))}`,
    length: `${Math.round(metersToFeet(restrictions.lengthMeters) * 10) / 10}`,
  };
};

const toMetric = (height: number, weight: number, length: number, unitSystem: UnitSystem): TruckRestrictions => {
  if (unitSystem === 'metric') {
    return { heightMeters: height, weightTons: weight, lengthMeters: length };
  }
  return {
    heightMeters: feetToMeters(height),
    weightTons: lbsToTons(weight),
    lengthMeters: feetToMeters(length),
  };
};

const FIELD_LABELS: Record<UnitSystem, { height: string; weight: string; length: string }> = {
  imperial: { height: 'Height (ft)', weight: 'Weight (lbs)', length: 'Length (ft)' },
  metric: { height: 'Height (m)', weight: 'Weight (t)', length: 'Length (m)' },
};

export const TruckParamsForm = ({
  onSubmit,
  disabled,
  initialRestrictions,
  unitSystem,
  submitLabel = 'Go',
}: Props) => {
  const initial = initialRestrictions ? toDisplay(initialRestrictions, unitSystem) : null;
  const [height, setHeight] = useState(initial?.height ?? '');
  const [weight, setWeight] = useState(initial?.weight ?? '');
  const [length, setLength] = useState(initial?.length ?? '');

  useEffect(() => {
    if (initialRestrictions) {
      const display = toDisplay(initialRestrictions, unitSystem);
      setHeight(display.height);
      setWeight(display.weight);
      setLength(display.length);
    }
  }, [initialRestrictions, unitSystem]);

  const isValid = Number(height) > 0 && Number(weight) > 0 && Number(length) > 0;
  const labels = FIELD_LABELS[unitSystem];

  const fields = [
    { key: 'height', placeholder: labels.height, value: height, onChangeText: setHeight },
    { key: 'weight', placeholder: labels.weight, value: weight, onChangeText: setWeight },
    { key: 'length', placeholder: labels.length, value: length, onChangeText: setLength },
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
        onPress={() => onSubmit(toMetric(Number(height), Number(weight), Number(length), unitSystem))}
      >
        <Text className="font-semibold text-white">{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};
