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
    <View className="w-[48%] bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-50">
      <View className="flex-row items-center mb-3">
        <Feather name={icon} size={18} color="#475569" />
        <Text className="text-base font-bold text-slate-600 ml-2">{title}</Text>
      </View>

      <View className="bg-[#EEF2FF] py-5 rounded-xl items-center">
        <Text className="text-lg font-extrabold text-slate-800">
          {(score || 0).toFixed(1)} of {(total || 100).toFixed(0)}
        </Text>
      </View>
    </View>
  );
}
