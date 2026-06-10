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
        style={{ borderWidth: 5, borderColor: "#597AF4" }}
      >
        <Text style={{ color: "#1F2937", fontWeight: "800", fontSize: 16 }}>{percentage}%</Text>
      </View>
      <Text
        style={{
          color: "#6B7280",
          fontSize: 12,
          marginTop: 8,
          textAlign: "center",
          fontWeight: "600",
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}
