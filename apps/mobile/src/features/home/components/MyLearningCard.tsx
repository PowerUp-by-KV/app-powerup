import React from "react";
import { Pressable, Text, View } from "react-native";

interface MyLearningCardProps {
  streakCount: number;
  badgesCount: number;
  xpPoints: number;
  modulesCompleted: number;
  totalModules: number | null;
  onTrack: () => void;
}

function StatTile({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <View className="flex-1 items-center bg-slate-100 rounded-2xl py-3 mx-1">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-slate-900 font-bold text-base mt-1">{value}</Text>
      <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </Text>
    </View>
  );
}

export function MyLearningCard({
  streakCount,
  badgesCount,
  xpPoints,
  modulesCompleted,
  totalModules,
  onTrack,
}: MyLearningCardProps) {
  const pct =
    totalModules != null && totalModules > 0
      ? Math.round((modulesCompleted / totalModules) * 100)
      : 0;
  return (
    <View className="bg-white rounded-3xl p-4 border border-slate-100 mb-6">
      <Text className="text-slate-900 text-base font-bold mb-3 text-center">My Learning</Text>
      <View className="flex-row -mx-1 mb-4">
        <StatTile icon="🔥" value={streakCount} label="Streaks" />
        <StatTile icon="🏅" value={badgesCount} label="Badges" />
        <StatTile icon="⚡" value={xpPoints} label="XP Points" />
      </View>
      <View className="mb-3">
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-slate-500 text-xs">
            {modulesCompleted}
            {totalModules != null ? ` / ${totalModules}` : ""} modules
          </Text>
          <Text className="text-slate-900 text-xs font-bold">{pct}%</Text>
        </View>
        <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <View className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
        </View>
      </View>
      <Pressable
        onPress={onTrack}
        className="bg-slate-900 rounded-2xl py-3 items-center active:opacity-80"
      >
        <Text className="text-white font-bold">Track My Learning</Text>
      </Pressable>
    </View>
  );
}
