import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

interface ScoreGaugeProps {
  score: number;
  total: number;
  obtainedPoints: number;
  totalPoints: number;
  cefr: string;
}

function getCefrInfo(cefrStr: string) {
  const clean = (cefrStr || "").toUpperCase().trim();

  // Find all matches of CEFR levels: A1, A2, B1, B2, C1, C2
  const matches = clean.match(/[ABC][12]/g) || [];

  // Unique matches keeping order or sorting them
  const uniqueMatches = Array.from(new Set(matches));

  if (uniqueMatches.length >= 2) {
    // Sort uniqueMatches to ensure standard ascending order, e.g. A2-B1
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    uniqueMatches.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

    const rangeLabel = `${uniqueMatches[0]}-${uniqueMatches[1]}`;

    // Determine info based on the range
    if (rangeLabel === "A1-A2") {
      return { percentage: 25.0, label: "A1-A2", color: "#f97316" };
    }
    if (rangeLabel === "A2-B1") {
      return { percentage: 41.7, label: "A2-B1", color: "#f59e0b" };
    }
    if (rangeLabel === "B1-B2") {
      return { percentage: 58.3, label: "B1-B2", color: "#10b981" };
    }
    if (rangeLabel === "B2-C1") {
      return { percentage: 75.0, label: "B2-C1", color: "#06b6d4" };
    }
    if (rangeLabel === "C1-C2") {
      return { percentage: 91.7, label: "C1-C2", color: "#3b82f6" };
    }

    // Generic fallback for any other range
    return { percentage: 50.0, label: rangeLabel, color: "#10b981" };
  }

  if (uniqueMatches.length === 1) {
    const single = uniqueMatches[0];
    if (single === "C2") return { percentage: 100.0, label: "C2", color: "#3b82f6" };
    if (single === "C1") return { percentage: 83.3, label: "C1", color: "#06b6d4" };
    if (single === "B2") return { percentage: 66.7, label: "B2", color: "#10b981" };
    if (single === "B1") return { percentage: 50.0, label: "B1", color: "#f59e0b" };
    if (single === "A2") return { percentage: 33.3, label: "A2", color: "#f97316" };
    if (single === "A1") return { percentage: 16.7, label: "A1", color: "#ef4444" };
  }

  // 3. Fallback startWith or contains letter matches (ignores surrounding random text)
  if (clean.includes("C")) {
    return { percentage: 83.3, label: "C1-C2", color: "#3b82f6" };
  }
  if (clean.includes("B")) {
    return { percentage: 58.3, label: "B1-B2", color: "#10b981" };
  }
  if (clean.includes("A")) {
    return { percentage: 25.0, label: "A1-A2", color: "#f97316" };
  }

  // 4. Default fallback if no A/B/C match at all
  return { percentage: 16.7, label: "A1", color: "#ef4444" };
}

export function ScoreGauge({ score, total, obtainedPoints, totalPoints, cefr }: ScoreGaugeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cefrInfo = getCefrInfo(cefr);
  const percentage =
    cefrInfo.percentage > 0 ? cefrInfo.percentage : total > 0 ? ((score || 0) / total) * 100 : 0;
  const activeColor = cefrInfo.percentage > 0 ? cefrInfo.color : "#3b82f6";

  // Rotation for progress arc:
  // 0% -> -90deg, 100% -> 90deg (for a 180 degree gauge)
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <View className="items-center py-6">
      <View className="relative" style={{ width: 240, height: 120, overflow: "hidden" }}>
        {/* Background Arc */}
        <View
          style={[
            styles.arcBase,
            { borderColor: isDark ? "#1E1F2A" : "#f1f5f9" }, // slate-100 / slate-800 equivalent
          ]}
        />

        {/* Progress Arc */}
        <View
          style={[
            styles.arcBase,
            {
              borderColor: "transparent",
              borderTopColor: activeColor,
              borderRightColor: activeColor,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        />

        {/* Inner cutout to make it a ring */}
        <View
          className="absolute bottom-0 left-5 w-50 h-25 bg-white dark:bg-[#151620] rounded-t-full border-t border-slate-100 dark:border-[#1E1F2A]"
          style={{ width: 200, height: 100, left: 20 }}
        />

        {/* Center Content */}
        <View className="absolute bottom-0 w-full items-center">
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {(score || 0).toFixed(1)}%
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-1">
            {(obtainedPoints || 0).toFixed(0)} / {(totalPoints || 0).toFixed(0)} Marks
          </Text>
        </View>
      </View>

      {/* CEFR Level Pill Badge */}
      <View
        className="mt-6 px-6 py-2 rounded-full shadow-sm items-center justify-center flex-row"
        style={{
          backgroundColor: `${activeColor}15`,
          borderWidth: 1,
          borderColor: `${activeColor}30`,
        }}
      >
        <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: activeColor }} />
        <Text
          className="text-sm font-extrabold uppercase tracking-wider"
          style={{ color: activeColor }}
        >
          CEFR Level: {cefrInfo.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arcBase: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 20,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
});
