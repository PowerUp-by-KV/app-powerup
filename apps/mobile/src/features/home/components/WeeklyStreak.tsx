import React from "react";
import { Text, View } from "react-native";

interface WeeklyStreakProps {
  // Optional bool[7] starting Monday. Falls back to a single-day fill at today's index.
  days?: boolean[];
  fallbackTodayIndex?: number;
}

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyStreak({ days, fallbackTodayIndex }: WeeklyStreakProps) {
  const today = fallbackTodayIndex ?? mondayIndexFromDate(new Date());
  const filled = days ?? Array.from({ length: 7 }, (_, i) => i <= today);

  return (
    <View className="bg-white rounded-3xl p-4 mb-4 border border-slate-100">
      <Text className="text-slate-900 text-base font-bold mb-3 text-center">Weekly Streak</Text>
      <View className="flex-row justify-between">
        {LABELS.map((label, i) => {
          const active = filled[i];
          return (
            <View key={i} className="items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mb-1"
                style={{ backgroundColor: active ? "#0f172a" : "#e2e8f0" }}
              >
                <Text style={{ color: active ? "#f97316" : "#94a3b8", fontSize: 14 }}>🔥</Text>
              </View>
              <Text className="text-slate-400 text-xs font-semibold">{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function mondayIndexFromDate(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}
