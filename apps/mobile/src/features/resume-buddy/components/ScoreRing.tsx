import React from "react";
import { View, Text } from "react-native";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  label: string;
}

export function ScoreRing({ score, maxScore = 100, label }: ScoreRingProps) {
  const percentage = Math.round((score / maxScore) * 100);
  return (
    <View className="items-center w-24">
      <View
        className="w-20 h-20 rounded-full items-center justify-center bg-white shadow-sm"
        style={{ borderWidth: 5, borderColor: "#4f46e5" }}
      >
        <Text className="text-slate-900 font-extrabold text-base">{percentage}%</Text>
      </View>
      <Text className="text-slate-600 text-xs mt-2 text-center font-semibold" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
