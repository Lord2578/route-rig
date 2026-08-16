import Constants from 'expo-constants';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { UnitSystem } from '../../../shared/utils/units';
import { useSaveUnitSystem, useUnitSystem } from '../hooks/use-unit-system';

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'imperial', label: 'Imperial (ft, lbs)' },
  { value: 'metric', label: 'Metric (m, t)' },
];

const PRIVACY_POLICY_URL = 'https://lord2578.github.io/route-rig/privacy-policy.html';
const GITHUB_URL = 'https://github.com/Lord2578/route-rig';

export const SettingsScreen = () => {
  const unitSystem = useUnitSystem();
  const saveUnitSystem = useSaveUnitSystem();
  const current = unitSystem.data ?? 'imperial';

  return (
    <View className="flex-1 bg-gray-900">
      <View className="gap-3 p-4">
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

      <SafeAreaView edges={['bottom']} className="mt-auto items-center gap-2 border-t border-gray-800 py-5">
        <Text className="text-xs text-gray-600">RouteRig v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link"
            accessibilityLabel="Read the privacy policy"
          >
            <Text className="text-xs text-blue-400">Privacy Policy</Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-700">·</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(GITHUB_URL)}
            accessibilityRole="link"
            accessibilityLabel="View RouteRig on GitHub"
          >
            <Text className="text-xs text-blue-400">GitHub</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};
