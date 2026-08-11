import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';

type Props = TextInputProps & { className?: string };

export const AppTextInput = ({ className, ...rest }: Props) => (
  <TextInput
    className={`rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white ${className ?? ''}`}
    placeholderTextColor="#9CA3AF"
    {...rest}
  />
);
