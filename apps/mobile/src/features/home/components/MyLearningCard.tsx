import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

interface MyLearningCardProps {
  streakCount: number;
  badgesCount: number;
  xpPoints: number;
  daysCompleted: number;
  totalDays: number | null;
  /** While true, show skeleton placeholders instead of zeros that haven't resolved yet. */
  isLoading?: boolean;
  onTrack: () => void;
}

function SkeletonBlock({ className }: { className: string }) {
  // No default rounding — each caller sets its own (rounded-full for the icon dot,
  // rounded-lg for bars) so the two radius classes never collide on one element.
  return <View className={`bg-slate-200 dark:bg-slate-700/60 animate-pulse ${className}`} />;
}

function StatTileSkeleton() {
  return (
    <View className="flex-1 items-center justify-center p-3.5 bg-slate-50 dark:bg-[#1a1924] border border-slate-200 dark:border-[#2b2a3a] rounded-2xl mx-1">
      <SkeletonBlock className="w-6 h-6 mb-2 rounded-full" />
      <SkeletonBlock className="w-14 h-3.5 rounded-lg" />
    </View>
  );
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <View className="flex-1 mx-1 overflow-hidden rounded-[20px] shadow-sm shadow-indigo-300/30">
      <LinearGradient
        colors={["#5479f7", "#3257e8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 4,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          position: "relative",
        }}
      >
        {/* Glossy light shine overlay */}
        <View
          style={{
            position: "absolute",
            top: -18,
            left: -18,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "rgba(255, 255, 255, 0.22)",
          }}
        />
        <Text
          style={{
            color: "#ffffff",
            fontSize: 26,
            fontWeight: "900",
            textAlign: "center",
            lineHeight: 30,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.95)",
            fontSize: 11,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
}

export function MyLearningCard({
  streakCount,
  badgesCount,
  xpPoints,
  daysCompleted,
  totalDays,
  isLoading = false,
  onTrack,
}: MyLearningCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const pct =
    totalDays != null && totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

  return (
    <View className="bg-white dark:bg-[#16161c] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-5 mb-5 shadow-sm shadow-slate-100 dark:shadow-none">
      <Text className="text-slate-900 dark:text-white text-base font-bold mb-4 text-center">
        Daily Progress
      </Text>

      {isLoading ? (
        <>
          <View className="flex-row -mx-1 mb-5">
            <StatTileSkeleton />
            <StatTileSkeleton />
            <StatTileSkeleton />
          </View>
          <View className="mb-5">
            <View className="flex-row justify-between mb-2">
              <SkeletonBlock className="w-20 h-3 rounded-lg" />
              <SkeletonBlock className="w-8 h-3 rounded-lg" />
            </View>
            <SkeletonBlock className="h-2.5 w-full rounded-full" />
          </View>
        </>
      ) : (
        <>
          <View className="flex-row -mx-1 mb-5">
            <StatTile value={streakCount} label="Streaks" />
            <StatTile value={xpPoints} label="Xp points" />
            <StatTile value={badgesCount} label="Badges" />
          </View>

          <View className="mb-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                {daysCompleted}
                {totalDays != null ? ` / ${totalDays}` : ""} modules
              </Text>
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                {pct}%
              </Text>
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
        </>
      )}

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
