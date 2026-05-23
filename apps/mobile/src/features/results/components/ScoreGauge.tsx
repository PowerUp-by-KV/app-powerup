import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ScoreGaugeProps {
  score: number;
  total: number;
  obtainedPoints: number;
  totalPoints: number;
  cefr: string;
}

export function ScoreGauge({ score, total, obtainedPoints, totalPoints, cefr }: ScoreGaugeProps) {
  const percentage = total > 0 ? ((score || 0) / total) * 100 : 0;

  // Rotation for the progress arc:
  // 0% -> -90deg, 100% -> 90deg (for a 180 degree gauge)
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <View className="items-center py-6">
      <View className="relative" style={{ width: 220, height: 110, overflow: "hidden" }}>
        {/* Background Arc */}
        <View
          style={[
            styles.arcBase,
            { borderColor: "#E2E8F0" }, // slate-200
          ]}
        />

        {/* Progress Arc */}
        <View
          style={[
            styles.arcBase,
            {
              borderColor: "#94A3B8", // slate-400 (base for progress)
              borderTopColor: "#93C5FD", // blue-300
              borderRightColor: "#93C5FD",
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        />

        {/* Center Content */}
        <View className="absolute bottom-0 w-full items-center">
          <Text className="text-3xl font-extrabold text-slate-900">
            {(score || 0).toFixed(1)} of {total}
          </Text>
          <Text className="text-slate-500 font-bold text-sm mt-1">
            {(obtainedPoints || 0).toFixed(0)} of {(totalPoints || 0).toFixed(0)}
          </Text>
        </View>
      </View>

      <Text className="text-xl font-black text-slate-700 mt-6 tracking-widest">CEFR: {cefr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  arcBase: {
    position: "absolute",
    top: 0,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 22,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
});
