import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export function AchievementsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-extrabold text-slate-900 mb-2">Your Achievements!</Text>
        <Text className="text-slate-500 text-center">
          Trophies, XP, badges and skills land here in DK-F8 once the achievements / medals /
          accuracy / skills endpoints ship.
        </Text>
      </View>
    </SafeAreaView>
  );
}
