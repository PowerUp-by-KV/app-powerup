import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
    <View style={styles.card}>
      <Text className="text-slate-900 text-base font-bold mb-4 text-center">Weekly Streak</Text>
      <View className="flex-row justify-between px-1">
        {LABELS.map((label, i) => {
          const active = filled[i];
          return (
            <View key={i} className="items-center">
              {active ? (
                <LinearGradient
                  colors={["#4f46e5", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIndicator}
                >
                  <Ionicons name="flame" size={20} color="#ffffff" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIndicator} />
              )}
              <Text className="text-slate-400 text-xs font-semibold">{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2f9cc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
});

function mondayIndexFromDate(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}
