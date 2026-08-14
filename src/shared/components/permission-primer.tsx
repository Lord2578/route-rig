import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native';

const PRIVACY_POLICY_URL = 'https://lord2578.github.io/route-rig/privacy-policy.html';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  onContinue: () => void;
};

export const PermissionPrimer = ({ visible, title, description, onContinue }: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/70 p-6">
      <View className="gap-3 rounded-xl bg-gray-800 p-5">
        <Text className="text-lg font-bold text-white">{title}</Text>
        <Text className="text-gray-300">{description}</Text>
        <TouchableOpacity
          className="mt-2 items-center rounded-lg bg-blue-600 py-2"
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text className="font-semibold text-white">Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Read the privacy policy"
        >
          <Text className="text-center text-xs text-blue-400 underline">Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
