import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { TouchableOpacity } from 'react-native';

type Props = {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
  size?: number;
  className?: string;
};

export const IconButton = ({ name, onPress, color = '#60A5FA', size = 22, className }: Props) => (
  <TouchableOpacity
    className={
      className ??
      'h-12 w-12 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shadow-md android:[elevation:4]'
    }
    onPress={onPress}
  >
    <Ionicons name={name} size={size} color={color} />
  </TouchableOpacity>
);
