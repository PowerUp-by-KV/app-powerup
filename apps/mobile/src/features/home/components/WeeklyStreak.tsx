import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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
    <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100/60 shadow-sm shadow-slate-100">
      <Text className="text-slate-900 text-base font-bold mb-4 text-center">Weekly Streak</Text>
      <View className="flex-row justify-between px-1">
        {LABELS.map((label, i) => {
          const active = filled[i];
          return (
            <View key={i} className="items-center">
              {active ? (
                <LinearGradient
                  colors={["#4f46e5", "#3b82f6"]}
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5 shadow-sm shadow-indigo-100/30"
                >
                  <Ionicons name="flame" size={20} color="#ffffff" />
                </LinearGradient>
              ) : (
                <View
                  style={{ backgroundColor: "#e2f9cc" }}
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
                />
              )}
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
