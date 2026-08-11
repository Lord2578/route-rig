import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { TouchableOpacity } from 'react-native';

type Props = {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
};

export const IconButton = ({ name, onPress, color = '#60A5FA' }: Props) => (
  <TouchableOpacity
    className="h-12 w-12 items-center justify-center rounded-full bg-gray-800 shadow-md android:[elevation:4]"
    onPress={onPress}
  >
    <Ionicons name={name} size={22} color={color} />
  </TouchableOpacity>
);
