import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      style={styles.statTile}
    >
      <Text className="text-white font-extrabold text-3xl tracking-tight">{value}</Text>
      <Text className="text-indigo-100 text-[11px] font-semibold mt-1">{label}</Text>
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
    totalDays != null && totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

  const tileColors: readonly [string, string, ...string[]] = ["#4f46e5", "#3b82f6"];

  return (
    <View style={styles.card}>
      <Text className="text-slate-900 text-base font-bold mb-4 text-center">Daily Progress</Text>
      <View className="flex-row -mx-1 mb-5">
        <StatTile value={streakCount} label="Streaks" colors={tileColors} />
        <StatTile value={xpPoints} label="Xp points" colors={tileColors} />
        <StatTile value={badgesCount} label="Badges" colors={tileColors} />
      </View>
      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-400 text-xs font-semibold">
            {daysCompleted}
            {totalDays != null ? ` / ${totalDays}` : ""} days
          </Text>
          <Text className="text-slate-300 text-xs font-semibold">{pct}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={["#3b82f6", "#22c55e", "#84cc16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${pct}%` }]}
          />
        </View>
      </View>
      <Pressable onPress={onTrack} style={styles.buttonPressable} className="active:scale-98">
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text className="text-white font-bold text-base tracking-wide">Track my Learning</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 16,
    marginHorizontal: 4,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  buttonPressable: {
    borderRadius: 9999,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
