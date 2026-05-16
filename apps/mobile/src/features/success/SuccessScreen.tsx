import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export function SuccessScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  const isRegister = mode === "register";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px] items-center">
          <View className="w-20 h-20 rounded-full bg-gray-100 mb-8 items-center justify-center">
            <Text className="text-3xl">✓</Text>
          </View>

          <Text className="text-2xl font-extrabold text-center text-slate-900 mb-4">
            {isRegister ? "Thank You!" : "Welcome Back!"}
          </Text>

          <Text className="text-sm text-center text-slate-500 mb-8">
            {isRegister
              ? "Your account has been successfully created"
              : "Good to see you again. You’ve successfully signed in."}
          </Text>

          <TouchableOpacity
            className="rounded-full py-4 px-10 items-center bg-gray-700"
            onPress={() => router.replace(isRegister ? "/dynamic-onboarding" : ("/home" as any))}
          >
            <Text className="text-white font-bold">{isRegister ? "Continue" : "Get Started"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default SuccessScreen;
