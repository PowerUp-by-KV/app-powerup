import React from "react";
import { View, Text } from "react-native";

interface ScoreBreakdownItem {
  label: string;
  score: number;
  weight: number;
}

interface ScoreCardProps {
  score: number;
  breakdown?: ScoreBreakdownItem[];
  showBreakdown?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22C55E"; // green
  if (score >= 60) return "#F59E0B"; // orange
  return "#EF4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Improvement";
}

export function ScoreCard({ score, breakdown, showBreakdown = true }: ScoreCardProps) {
  return (
    <View className="bg-slate-900 rounded-2xl p-5 w-full shadow-md">
      {/* Main Score */}
      <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <View>
          <Text className="text-gray-400 text-sm font-semibold">Question Score</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>
              {score}
            </Text>
            <Text className="text-gray-400">/100</Text>
          </View>
        </View>
        <View
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: getScoreColor(score) + "20" }}
        >
          <Text className="text-xl font-bold" style={{ color: getScoreColor(score) }}>
            {Math.round((score / 100) * 100)}%
          </Text>
        </View>
      </View>

      {/* Label */}
      <Text className="text-white font-semibold text-base">{getScoreLabel(score)}</Text>

      {/* Breakdown */}
      {showBreakdown && breakdown && breakdown.length > 0 && (
        <View className="mt-4 gap-2">
          {breakdown.map((item, idx) => (
            <View key={idx} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm">{item.label}</Text>
                <Text className="text-white font-semibold text-sm">{item.score}</Text>
              </View>
              <View className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: getScoreColor(item.score),
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
