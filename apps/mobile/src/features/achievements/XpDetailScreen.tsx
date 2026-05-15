import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";

export function XpDetailScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">XP Points</Text>
        <View className="w-9" />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-slate-900 text-7xl font-extrabold">{profile?.total_xp ?? 0}</Text>
        <Text className="text-slate-500 text-center mt-4 mb-8">
          Collect more XP points to reach the top of the leaderboard.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/my-learning" as never)}
          className="bg-slate-900 rounded-full px-8 py-3"
        >
          <Text className="text-white font-bold">Continue learning</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
