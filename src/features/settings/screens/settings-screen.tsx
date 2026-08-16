import { Text, TouchableOpacity, View } from 'react-native';

import type { UnitSystem } from '../../../shared/utils/units';
import { useSaveUnitSystem, useUnitSystem } from '../hooks/use-unit-system';

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'imperial', label: 'Imperial (ft, lbs)' },
  { value: 'metric', label: 'Metric (m, t)' },
];

export const SettingsScreen = () => {
  const unitSystem = useUnitSystem();
  const saveUnitSystem = useSaveUnitSystem();
  const current = unitSystem.data ?? 'imperial';

  return (
    <View className="flex-1 gap-3 bg-gray-900 p-4">
      <Text className="text-xs font-semibold uppercase text-gray-500">Units</Text>
      <View className="flex-row gap-2">
        {UNIT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`flex-1 items-center rounded-lg py-3 ${
              current === option.value ? 'bg-blue-600' : 'border-2 border-gray-500 bg-gray-700'
            }`}
            onPress={() => saveUnitSystem.mutate(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`Use ${option.label}`}
          >
            <Text className={`font-semibold ${current === option.value ? 'text-white' : 'text-gray-200'}`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-xs text-gray-500">
        Applies to truck height, weight, and length everywhere in the app.
      </Text>
    </View>
  );
};
