import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ROUTE_TYPE_COLOR } from '../../../shared/constants/route-colors';
import { formatDistance, formatDuration, formatRouteDelta } from '../../../shared/utils/format';
import type { RouteResult, TruckRestrictions } from '../api/directions';

type RouteType = 'truck' | 'car';

type RouteState = {
  data?: RouteResult;
  error?: unknown;
};

type Props = {
  truckRoute: RouteState;
  carRoute: RouteState;
  selectedRouteType: RouteType;
  onSelectRouteType: (type: RouteType) => void;
  restrictions: TruckRestrictions | null;
  onSave?: () => void;
  isSaved?: boolean;
  onShare?: () => void;
};

const ROUTE_OPTIONS: { type: RouteType; label: string; activeClassName: string }[] = [
  { type: 'truck', label: 'Truck', activeClassName: 'bg-blue-600' },
  { type: 'car', label: 'Car', activeClassName: 'bg-orange-500' },
];

const ERROR_FALLBACK: Record<RouteType, string> = {
  truck: 'Could not find a truck route.',
  car: 'Could not find a car route.',
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const RouteSummaryCard = memo(
  ({
    truckRoute,
    carRoute,
    selectedRouteType,
    onSelectRouteType,
    restrictions,
    onSave,
    isSaved,
    onShare,
  }: Props) => {
    const routes: Record<RouteType, RouteState> = { truck: truckRoute, car: carRoute };
    const hasContent = truckRoute.data || carRoute.data || truckRoute.error || carRoute.error;
    if (!hasContent) {
      return null;
    }

    const selectedRoute = routes[selectedRouteType];
    const delta =
      truckRoute.data && carRoute.data
        ? {
            distanceMeters: truckRoute.data.distanceMeters - carRoute.data.distanceMeters,
            durationSeconds: truckRoute.data.durationSeconds - carRoute.data.durationSeconds,
          }
        : null;

    return (
      <View className="gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-md android:[elevation:4]">
        <View className="flex-row gap-2">
          {ROUTE_OPTIONS.filter((option) => routes[option.type].data).map((option) => (
            <TouchableOpacity
              key={option.type}
              className={`flex-1 items-center rounded-lg py-2 ${
                selectedRouteType === option.type ? option.activeClassName : 'border-2 border-gray-500 bg-gray-700'
              }`}
              onPress={() => onSelectRouteType(option.type)}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedRouteType === option.type ? 'text-white' : 'text-gray-200'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedRoute.data && (
          <View className="gap-1">
            <Text className="text-2xl font-bold" style={{ color: ROUTE_TYPE_COLOR[selectedRouteType] }}>
              {formatDistance(selectedRoute.data.distanceMeters)}
            </Text>
            <Text className="text-gray-300">{formatDuration(selectedRoute.data.durationSeconds)} drive</Text>
            {selectedRouteType === 'truck' && delta && (
              <Text className="text-xs text-gray-400">
                {formatRouteDelta(delta.distanceMeters, delta.durationSeconds)}
              </Text>
            )}
            {selectedRouteType === 'truck' && restrictions && (
              <Text className="text-xs text-gray-500">
                Restrictions used: {restrictions.heightMeters}m height · {restrictions.weightTons}t weight ·{' '}
                {restrictions.lengthMeters}m length
              </Text>
            )}
          </View>
        )}

        {(onSave || onShare) && (
          <View className="flex-row gap-2">
            {onSave && (
              <TouchableOpacity className="flex-1 items-center rounded-lg bg-blue-600 py-2" onPress={onSave}>
                <Text className="text-xs font-semibold text-white">
                  {isSaved ? 'Saved ✓' : 'Save this route'}
                </Text>
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

        {ROUTE_OPTIONS.filter((option) => routes[option.type].error).map((option) => (
          <Text key={option.type} className="text-red-400">
            {errorMessage(routes[option.type].error, ERROR_FALLBACK[option.type])}
          </Text>
        ))}
      </View>
    );
  }
);
