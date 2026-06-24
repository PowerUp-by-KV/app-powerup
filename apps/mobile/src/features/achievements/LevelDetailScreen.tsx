import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";

import { useGetProfileQuery } from "@/services/auth-api";

export function LevelDetailScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { data: profile } = useGetProfileQuery();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={`flex-1 ${isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}`}
    >
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color={isDark ? "#ffffff" : "#1B1F35"} />
        </Pressable>
        <Text
          className={`flex-1 text-center font-bold ${isDark ? "text-white" : "text-[#1B1F35]"}`}
        >
          Level
        </Text>
        <View className="w-9" />
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingVertical: 40,
          paddingBottom: 96,
        }}
      >
        <Text className={`mb-2 ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
          Keep going, you&apos;re in level
        </Text>
        <Text className="text-[#7174F6] text-7xl font-extrabold">
          {profile?.current_level ?? 1}
        </Text>
        <Text className={`text-center mt-4 mb-8 ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
          Practice every day to level up your skills.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/my-learning" as never)}
          className="bg-[#7174F6] rounded-full px-8 py-3 active:opacity-85"
        >
          <Text className="text-white font-bold">Continue learning</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
