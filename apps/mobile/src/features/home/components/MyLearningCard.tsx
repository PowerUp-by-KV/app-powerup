import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MyLearningCardProps {
  streakCount: number;
  badgesCount: number;
  xpPoints: number;
  daysCompleted: number;
  totalDays: number | null;
  onTrack: () => void;
}

function StatTile({
  value,
  label,
  colors,
}: {
  value: string | number;
  label: string;
  colors: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center rounded-3xl py-4 mx-1 shadow-sm"
    >
      <Text className="text-white font-extrabold text-4xl tracking-tight">{value}</Text>
      <Text className="text-indigo-100 text-[11px] font-semibold mt-1">
        {label}
      </Text>
    </LinearGradient>
  );
}

export function MyLearningCard({
  streakCount,
  badgesCount,
  xpPoints,
  daysCompleted,
  totalDays,
  onTrack,
}: MyLearningCardProps) {
  const pct =
    totalDays != null && totalDays > 0
      ? Math.round((daysCompleted / totalDays) * 100)
      : 0;

  const tileColors: readonly [string, string, ...string[]] = ["#4f46e5", "#3b82f6"];

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100/60 shadow-sm shadow-slate-100 mb-6">
      <Text className="text-slate-900 text-base font-bold mb-4 text-center">
        Daily Progress
      </Text>
      <View className="flex-row -mx-1 mb-5">
        <StatTile
          value={streakCount}
          label="Streaks"
          colors={tileColors}
        />
        <StatTile
          value={xpPoints}
          label="Xp points"
          colors={tileColors}
        />
        <StatTile
          value={badgesCount}
          label="Badges"
          colors={tileColors}
        />
      </View>
      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-400 text-xs font-semibold">
            {daysCompleted}
            {totalDays != null ? ` / ${totalDays}` : ""} days
          </Text>
          <Text className="text-slate-300 text-xs font-semibold">{pct}%</Text>
        </View>
        <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <LinearGradient
            colors={["#3b82f6", "#22c55e", "#84cc16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${pct}%`, height: "100%", borderRadius: 9999 }}
          />
        </View>
      </View>
      <Pressable onPress={onTrack} className="active:scale-98 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-3.5 items-center justify-center shadow-md shadow-indigo-100/20"
        >
          <Text className="text-white font-bold text-base tracking-wide">
            Track my Learning
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

