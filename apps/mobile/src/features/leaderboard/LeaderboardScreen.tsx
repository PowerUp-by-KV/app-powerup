import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export function LeaderboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-extrabold text-slate-900 mb-2">Leaderboard</Text>
        <Text className="text-slate-500 text-center">
          Weekly / Monthly / Yearly rankings + friends land here in DK-F9 once the leaderboard /
          friends endpoints ship.
        </Text>
      </View>
    </SafeAreaView>
  );
}
