import type { UseQueryResult } from '@tanstack/react-query';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatDistance, formatDuration } from '../../../shared/utils/format';
import type { RouteResult, TruckRestrictions } from '../api/directions';

type RouteType = 'truck' | 'car';

type Props = {
  truckRoute: UseQueryResult<RouteResult>;
  carRoute: UseQueryResult<RouteResult>;
  selectedRouteType: RouteType;
  onSelectRouteType: (type: RouteType) => void;
  restrictions: TruckRestrictions | null;
  onSave?: () => void;
  isSaved?: boolean;
};

const ACCENT_COLOR: Record<RouteType, string> = {
  truck: '#3B82F6',
  car: '#FB923C',
};

export const RouteSummaryCard = ({
  truckRoute,
  carRoute,
  selectedRouteType,
  onSelectRouteType,
  restrictions,
  onSave,
  isSaved,
}: Props) => {
  const hasContent = truckRoute.data || carRoute.data || truckRoute.error || carRoute.error;
  if (!hasContent) {
    return null;
  }

  const selectedRoute = selectedRouteType === 'truck' ? truckRoute : carRoute;

  return (
    <View className="gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-md android:[elevation:4]">
      <View className="flex-row gap-2">
        {truckRoute.data && (
          <TouchableOpacity
            className={`flex-1 items-center rounded-lg py-2 ${
              selectedRouteType === 'truck' ? 'bg-blue-600' : 'border border-gray-600 bg-gray-800'
            }`}
            onPress={() => onSelectRouteType('truck')}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedRouteType === 'truck' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Truck
            </Text>
          </TouchableOpacity>
        )}
        {carRoute.data && (
          <TouchableOpacity
            className={`flex-1 items-center rounded-lg py-2 ${
              selectedRouteType === 'car' ? 'bg-orange-500' : 'border border-gray-600 bg-gray-800'
            }`}
            onPress={() => onSelectRouteType('car')}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedRouteType === 'car' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Car
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedRoute.data && (
        <View className="gap-1">
          <Text className="text-2xl font-bold" style={{ color: ACCENT_COLOR[selectedRouteType] }}>
            {formatDistance(selectedRoute.data.distanceMeters)}
          </Text>
          <Text className="text-gray-300">{formatDuration(selectedRoute.data.durationSeconds)} drive</Text>
          {selectedRouteType === 'truck' && restrictions && (
            <Text className="text-xs text-gray-500">
              Restrictions used: {restrictions.heightMeters}m height · {restrictions.weightTons}t weight ·{' '}
              {restrictions.lengthMeters}m length
            </Text>
          )}
        </View>
      )}

      {onSave && (
        <TouchableOpacity className="items-center rounded-lg bg-blue-600 py-2" onPress={onSave}>
          <Text className="text-xs font-semibold text-white">{isSaved ? 'Saved ✓' : 'Save this route'}</Text>
        </TouchableOpacity>
      )}

      {truckRoute.error && (
        <Text className="text-red-400">
          {truckRoute.error instanceof Error ? truckRoute.error.message : 'Could not find a truck route.'}
        </Text>
      )}
      {carRoute.error && (
        <Text className="text-red-400">
          {carRoute.error instanceof Error ? carRoute.error.message : 'Could not find a car route.'}
        </Text>
      )}
    </View>
  );
};
