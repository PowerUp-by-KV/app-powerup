import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useProgress } from "./hooks/ProgressContext";
import { BadgeGrid } from "./components";
import { Badge } from "@/services/types";

export const BadgesScreen = () => {
  const { badges } = useProgress();

  const allBadges: Badge[] =
    badges.length > 0
      ? badges
      : [
          {
            id: "1",
            title: "Grammar Master",
            icon: "🏆",
            category: "Module Mastery" as const,
            isLocked: false,
          },
          {
            id: "2",
            title: "Speed Reader",
            icon: "📚",
            category: "Module Mastery" as const,
            isLocked: false,
          },
          {
            id: "3",
            title: "7 Day Streak",
            icon: "🔥",
            category: "Streaks" as const,
            isLocked: false,
          },
          {
            id: "4",
            title: "First Quiz",
            icon: "⭐",
            category: "Special" as const,
            isLocked: false,
          },
          {
            id: "5",
            title: "Listening Pro",
            icon: "🎧",
            category: "Module Mastery" as const,
            isLocked: false,
          },
          {
            id: "6",
            title: "Early Bird",
            icon: "🌅",
            category: "Special" as const,
            isLocked: false,
          },
          {
            id: "7",
            title: "Word Smith",
            icon: "✍️",
            category: "Module Mastery" as const,
            isLocked: false,
          },
          {
            id: "8",
            title: "Social Bee",
            icon: "🐝",
            category: "Streaks" as const,
            isLocked: false,
          },
          {
            id: "9",
            title: "30 Day Streak",
            icon: "🔒",
            category: "Streaks" as const,
            isLocked: true,
          },
          {
            id: "10",
            title: "Pronunciation Pro",
            icon: "🔒",
            category: "Module Mastery" as const,
            isLocked: true,
          },
          {
            id: "11",
            title: "Certified",
            icon: "🔒",
            category: "Special" as const,
            isLocked: true,
          },
          {
            id: "12",
            title: "Mastermind",
            icon: "🔒",
            category: "Special" as const,
            isLocked: true,
          },
          { id: "13", title: "Polyglot", icon: "🔒", category: "Special" as const, isLocked: true },
        ];

  const earned = allBadges.filter((b) => !b.isLocked);
  const locked = allBadges.filter((b) => b.isLocked);

  const handleBadgePress = (badge: Badge) => {
    if (badge.isLocked) return;
    Alert.alert(badge.title, `Category: ${badge.category}\n\nYou've mastered this skill!`, [
      { text: "Share", onPress: () => console.log("Sharing badge...") },
      { text: "Close", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-row items-center justify-between px-5 py-[15px] bg-white shadow-sm shadow-black/5 elevation-2">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Badges & Achievements</Text>
        <View className="w-7" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <BadgeGrid title="Earned" badges={earned} onBadgePress={handleBadgePress} />
        <BadgeGrid title="Locked" badges={locked} onBadgePress={handleBadgePress} />

        <View className="h-[50px]" />
      </ScrollView>
    </SafeAreaView>
  );
};
