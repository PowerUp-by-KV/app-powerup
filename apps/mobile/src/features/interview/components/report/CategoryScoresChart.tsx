/**
 * src/features/interview/components/report/CategoryScoresChart.tsx
 *
 * Horizontal animated bar chart for Technical / Communication / Behavioral scores.
 * No external chart libraries — pure RN + Animated API.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CategoryScoreItem {
  label: string;
  value: number; // 0–100
}

interface CategoryScoresChartProps {
  categories: CategoryScoreItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function barBgColor(value: number): string {
  if (value >= 75) return "#10B981"; // emerald-500
  if (value >= 50) return "#FBBF24"; // amber-400
  return "#F87171";                  // red-400
}

function scoreTextColor(value: number): string {
  if (value >= 75) return "#16A34A"; // emerald-600
  if (value >= 50) return "#D97706"; // amber-500
  return "#DC2626";                  // red-600
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function BarRow({ label, value }: CategoryScoreItem) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value,
      duration:        750,
      delay:           120,
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  const width = anim.interpolate({
    inputRange:  [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
        <Text className="text-sm font-bold" style={{ color: scoreTextColor(value) }}>{value}</Text>
      </View>
      <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={{ width, backgroundColor: barBgColor(value) }}
        />
      </View>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CategoryScoresChart({ categories }: CategoryScoresChartProps) {
  return (
    <View className="bg-white rounded-2xl px-5 py-5 shadow-sm">
      <Text className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Category Scores
      </Text>
      {categories.map(({ label, value }) => (
        <BarRow key={label} label={label} value={value} />
      ))}
    </View>
  );
}
