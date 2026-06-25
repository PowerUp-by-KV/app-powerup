import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

interface MyLearningCardProps {
  streakCount: number;
  badgesCount: number;
  xpPoints: number;
  daysCompleted: number;
  totalDays: number | null;
  onTrack: () => void;
}

function StatTileLight({
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

function StatTileDark({
  value,
  label,
  iconName,
  iconType,
  iconColor,
}: {
  value: string | number;
  label: string;
  iconName: string;
  iconType: "feather" | "ionicons";
  iconColor: string;
}) {
  return (
    <View className="flex-1 items-center justify-center p-3.5 bg-slate-50 dark:bg-[#1a1924] border border-slate-100 dark:border-[#2b2a3a] rounded-2xl mx-1 shadow-sm shadow-slate-100/50 dark:shadow-none">
      <View className="mb-2">
        {iconType === "ionicons" ? (
          <Ionicons
            name={iconName as React.ComponentProps<typeof Ionicons>["name"]}
            size={22}
            color={iconColor}
          />
        ) : (
          <Feather
            name={iconName as React.ComponentProps<typeof Feather>["name"]}
            size={22}
            color={iconColor}
          />
        )}
      </View>
      <Text className="text-slate-900 dark:text-white font-extrabold text-sm text-center">
        {value} {label}
      </Text>
    </View>
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const pct =
    totalDays != null && totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

  const tileColors: readonly [string, string, ...string[]] = ["#4f46e5", "#3b82f6"];

  return (
    <View className="bg-white dark:bg-[#16161c] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-5 mb-5 shadow-sm shadow-slate-100 dark:shadow-none">
      <Text className="text-slate-900 dark:text-white text-base font-bold mb-4 text-center">
        Daily Progress
      </Text>

      <View className="flex-row -mx-1 mb-5">
        {isDark ? (
          <>
            <StatTileDark
              value={streakCount}
              label="Streaks"
              iconType="ionicons"
              iconName="flame"
              iconColor="#3b82f6"
            />
            <StatTileDark
              value={badgesCount}
              label="Badges"
              iconType="feather"
              iconName="award"
              iconColor="#a78bfa"
            />
            <StatTileDark
              value={xpPoints}
              label="XP Points"
              iconType="feather"
              iconName="zap"
              iconColor="#fbbf24"
            />
          </>
        ) : (
          <>
            <StatTileLight value={streakCount} label="Streaks" colors={tileColors} />
            <StatTileLight value={xpPoints} label="Xp points" colors={tileColors} />
            <StatTileLight value={badgesCount} label="Badges" colors={tileColors} />
          </>
        )}
      </View>

      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
            {daysCompleted}
            {totalDays != null ? ` / ${totalDays}` : ""} days
          </Text>
          <Text className="text-slate-300 dark:text-slate-500 text-xs font-semibold">{pct}%</Text>
        </View>
        <View className="h-2.5 bg-[#f1f5f9] dark:bg-[#21212b] rounded-full overflow-hidden">
          <LinearGradient
            colors={["#3b82f6", "#22c55e", "#84cc16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${pct}%`, height: "100%", borderRadius: 9999 }}
          />
        </View>
      </View>

      <Pressable
        onPress={onTrack}
        className="rounded-[9999px] overflow-hidden active:scale-[0.98] shadow-sm dark:shadow-none"
      >
        {isDark ? (
          <View className="bg-white py-3.5 items-center justify-center rounded-[9999px]">
            <Text className="text-slate-900 font-extrabold text-sm tracking-wide">
              Track my Learning
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={["#4f46e5", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text className="text-white font-bold text-base tracking-wide">Track my Learning</Text>
          </LinearGradient>
        )}
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
