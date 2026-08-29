import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { TRUCK_ROUTE_COLOR } from '../../../shared/constants/route-colors';
import { formatDistance, formatDuration, formatTruckRestrictions } from '../../../shared/utils/format';
import type { UnitSystem } from '../../../shared/utils/units';
import type { RouteResult, TruckRestrictions } from '../api/directions';

type Props = {
  truckRoute: { data?: RouteResult; error?: unknown };
  restrictions: TruckRestrictions | null;
  unitSystem: UnitSystem;
  onSave?: () => void;
  isSaved?: boolean;
  onShare?: () => void;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Could not find a truck route.';

export const RouteSummaryCard = memo(({ truckRoute, restrictions, unitSystem, onSave, isSaved, onShare }: Props) => {
  if (!truckRoute.data && !truckRoute.error) {
    return null;
  }

  return (
    <View className="gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-md android:[elevation:4]">
      {truckRoute.data && (
        <View className="gap-1">
          <Text className="text-2xl font-bold" style={{ color: TRUCK_ROUTE_COLOR }}>
            {formatDistance(truckRoute.data.distanceMeters)}
          </Text>
          <Text className="text-gray-300">{formatDuration(truckRoute.data.durationSeconds)} drive</Text>
          {restrictions && (
            <Text className="text-xs text-gray-500">
              Restrictions used:{' '}
              {formatTruckRestrictions(
                restrictions.heightMeters,
                restrictions.weightTons,
                restrictions.lengthMeters,
                unitSystem
              )}
            </Text>
          )}
        </View>
      )}

      {(onSave || onShare) && (
        <View className="flex-row gap-2">
          {onSave && (
            <TouchableOpacity className="flex-1 items-center rounded-lg bg-blue-600 py-2" onPress={onSave}>
              <Text className="text-xs font-semibold text-white">{isSaved ? 'Saved ✓' : 'Save this route'}</Text>
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              className="flex-1 items-center rounded-lg border-2 border-gray-500 bg-gray-700 py-2"
              onPress={onShare}
            >
              <Text className="text-xs font-semibold text-gray-200">Share</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!!truckRoute.error && <Text className="text-red-400">{errorMessage(truckRoute.error)}</Text>}
    </View>
  );
});
