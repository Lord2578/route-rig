import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <View className="flex-row gap-2">
      {/* BottomSheetTextInput isn't registered with NativeWind's cssInterop — use `style`. */}
      <BottomSheetTextInput
        style={styles.input}
        placeholder="Height (m)"
        keyboardType="decimal-pad"
        value={height}
        onChangeText={setHeight}
      />
      <BottomSheetTextInput
        style={styles.input}
        placeholder="Weight (t)"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
      />
      <BottomSheetTextInput
        style={styles.input}
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

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
