import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { memo, useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

import type { RootStackParamList } from '../../../app/navigation/root-navigator';
import { AppTextInput } from '../../../shared/components/app-text-input';
import { formatTruckRestrictions } from '../../../shared/utils/format';
import type { UnitSystem } from '../../../shared/utils/units';
import { useUnitSystem } from '../../settings/hooks/use-unit-system';
import { TruckParamsForm } from '../../route-planning/components/truck-params-form';
import type { TruckRestrictions } from '../../route-planning/api/directions';
import { useDeleteTruckProfileEntry, useSaveTruckProfileEntry, useTruckProfiles } from '../hooks/use-truck-profiles';
import type { TruckProfileEntry } from '../types';

type ProfileRowProps = {
  profile: TruckProfileEntry;
  unitSystem: UnitSystem;
  onApply: (profile: TruckProfileEntry) => void;
  onDelete: (profile: TruckProfileEntry) => void;
};

const ProfileRow = memo(function ProfileRow({ profile, unitSystem, onApply, onDelete }: ProfileRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-800 px-4 py-3"
      onPress={() => onApply(profile)}
    >
      <View className="flex-1 pr-3">
        <Text className="font-semibold text-white" numberOfLines={1}>
          {profile.name}
        </Text>
        <Text className="mt-1 text-xs text-gray-500">
          {formatTruckRestrictions(
            profile.restrictions.heightMeters,
            profile.restrictions.weightTons,
            profile.restrictions.lengthMeters,
            unitSystem
          )}
        </Text>
      </View>
      <TouchableOpacity className="rounded-lg bg-red-600 px-3 py-2" onPress={() => onDelete(profile)}>
        <Text className="font-semibold text-white">Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export const TruckProfilesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: profiles } = useTruckProfiles();
  const unitSystem = useUnitSystem().data ?? 'imperial';
  const saveProfile = useSaveTruckProfileEntry();
  const deleteProfile = useDeleteTruckProfileEntry();
  const [name, setName] = useState('');

  const applyProfile = useCallback(
    (profile: TruckProfileEntry) => {
      navigation.navigate('Map', { applyTruckProfile: profile.restrictions });
    },
    [navigation]
  );

  const confirmDelete = useCallback(
    (profile: TruckProfileEntry) => {
      Alert.alert('Delete profile?', profile.name, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProfile.mutate(profile.id) },
      ]);
    },
    [deleteProfile.mutate]
  );

  const handleSaveProfile = useCallback(
    (restrictions: TruckRestrictions) => {
      saveProfile.mutate({ name: name.trim(), restrictions });
      setName('');
    },
    [name, saveProfile.mutate]
  );

  return (
    <FlatList
      className="flex-1 bg-gray-900"
      data={profiles ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProfileRow profile={item} unitSystem={unitSystem} onApply={applyProfile} onDelete={confirmDelete} />
      )}
      ListEmptyComponent={
        <View className="items-center p-6">
          <Ionicons name="car-outline" size={40} color="#4B5563" />
          <Text className="mt-3 text-center font-semibold text-gray-300">No truck profiles yet</Text>
          <Text className="mt-1 text-center text-gray-500">
            Save a truck's dimensions below to switch between vehicles quickly.
          </Text>
        </View>
      }
      ListFooterComponent={
        <View className="gap-2 border-t border-gray-800 p-4">
          <Text className="text-xs font-semibold uppercase text-gray-500">Add a truck profile</Text>
          <AppTextInput placeholder="Name (e.g. Freightliner #2)" value={name} onChangeText={setName} />
          <TruckParamsForm
            onSubmit={handleSaveProfile}
            disabled={!name.trim()}
            unitSystem={unitSystem}
            submitLabel="Save profile"
          />
        </View>
      }
    />
  );
};
