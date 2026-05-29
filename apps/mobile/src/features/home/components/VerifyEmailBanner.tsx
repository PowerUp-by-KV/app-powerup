import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface VerifyEmailBannerProps {
  email: string | null | undefined;
}

export function VerifyEmailBanner({ email }: VerifyEmailBannerProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/verify-email",
          params: { email: email ?? "", next: "/(tabs)" },
        } as never)
      }
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex-row items-center"
    >
      <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
        <Feather name="mail" size={18} color="#B45309" />
      </View>
      <View className="flex-1">
        <Text className="text-amber-900 font-bold text-sm">Verify your email</Text>
        <Text className="text-amber-800 text-xs mt-0.5">
          Tap to confirm {email ?? "your email"} so you can start lessons & save your profile.
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#B45309" />
    </Pressable>
  );
}
