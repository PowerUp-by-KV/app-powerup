import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-2xl font-bold mb-4 text-slate-900">
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" className="mt-4 py-4">
          <Text className="text-base text-blue-600">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
