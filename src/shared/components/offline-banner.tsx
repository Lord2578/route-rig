import { Text, View } from 'react-native';

import { useIsOffline } from '../hooks/use-is-offline';

export const OfflineBanner = () => {
  const isOffline = useIsOffline();
  if (!isOffline) {
    return null;
  }

  return (
    <View className="rounded-lg bg-red-500 px-3 py-2">
      <Text className="text-center text-xs font-semibold text-white">No internet connection</Text>
    </View>
  );
};
