import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOnboarded } from "@/store/slices/app.slice";

export function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOnboarded = useAppSelector((state) => state.app.isOnboarded);

  const handleGetStarted = () => {
    dispatch(setOnboarded(true));
    router.replace("/(tabs)");
  };

  if (isOnboarded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-4 text-3xl font-bold text-gray-900">Welcome to PowerUp</Text>
      <Text className="mb-8 text-center text-lg text-gray-600">
        Get started by exploring the app. This is a sample onboarding screen to demonstrate the
        feature pattern.
      </Text>
      <Pressable className="rounded-xl bg-blue-600 px-8 py-4" onPress={handleGetStarted}>
        <Text className="text-lg font-semibold text-white">Get Started</Text>
      </Pressable>
    </View>
  );
}
