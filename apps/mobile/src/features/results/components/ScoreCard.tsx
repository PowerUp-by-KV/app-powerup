import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ScoreCardProps {
  title: string;
  score: number;
  total: number;
  icon: keyof typeof Feather.glyphMap;
}

export function ScoreCard({ title, score, total, icon }: ScoreCardProps) {
  return (
    <View className="w-[48%] bg-white dark:bg-[#1E1F2A] rounded-2xl p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-800">
      <View className="flex-row items-center mb-3">
        <Feather name={icon} size={18} color="#475569" />
        <Text className="text-base font-bold text-slate-600 dark:text-slate-300 ml-2">{title}</Text>
      </View>

      <View className="bg-blue-50/70 dark:bg-slate-800/50 py-5 rounded-xl items-center">
        <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
          {(score || 0).toFixed(1)} of {(total || 100).toFixed(0)}
        </Text>
      </View>
    </View>
  );
}
