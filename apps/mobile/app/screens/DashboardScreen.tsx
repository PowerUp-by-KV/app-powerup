import { View, Text } from "react-native";

export default function DashboardScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-5">
      <Text className="text-3xl font-bold mb-2">Dashboard</Text>
      <Text className="text-lg text-gray-800 mb-3 text-center">
        Your profile is complete, welcome to the app.
      </Text>
      <Text className="text-sm text-gray-600 text-center">
        Use this page to display stats, recent activity, and navigation widgets.
      </Text>
    </View>
  );
}
