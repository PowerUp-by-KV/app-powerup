import React from "react";
import { View, Text } from "react-native";
import type { LiveIndicators } from "../../types/interview.types";

interface LiveIndicatorsCardProps {
  indicators: LiveIndicators;
  isLoading?: boolean;
}

export function LiveIndicatorsCard({
  indicators,
  isLoading = false,
}: LiveIndicatorsCardProps) {
  const getColor = (value: number, type: "pace" | "clarity" | "filler") => {
    if (type === "filler") {
      return value <= 2 ? "#22C55E" : value <= 5 ? "#F59E0B" : "#EF4444";
    }
    return value >= 75 ? "#22C55E" : value >= 55 ? "#F59E0B" : "#EF4444";
  };

  return (
    <View className="bg-slate-900 rounded-2xl p-5 w-full gap-4 shadow-md">
      <Text className="text-white font-bold text-base">Live Metrics</Text>

      {/* Speaking Pace */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm font-semibold">Speaking Pace</Text>
          <Text
            className="text-sm font-bold"
            style={{ color: getColor(indicators.speakingPace, "pace") }}
          >
            {indicators.speakingPace} WPM
          </Text>
        </View>
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${Math.min((indicators.speakingPace / 200) * 100, 100)}%`,
              backgroundColor: getColor(indicators.speakingPace, "pace"),
            }}
          />
        </View>
      </View>

      {/* Clarity */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm font-semibold">Clarity</Text>
          <Text
            className="text-sm font-bold"
            style={{ color: getColor(indicators.clarity, "clarity") }}
          >
            {indicators.clarity}%
          </Text>
        </View>
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${indicators.clarity}%`,
              backgroundColor: getColor(indicators.clarity, "clarity"),
            }}
          />
        </View>
      </View>

      {/* Filler Words */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm font-semibold">Filler Words</Text>
          <Text
            className="text-sm font-bold"
            style={{ color: getColor(indicators.fillerCount, "filler") }}
          >
            {indicators.fillerCount}
          </Text>
        </View>
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${Math.max(0, 100 - (indicators.fillerCount / 10) * 100)}%`,
              backgroundColor: getColor(indicators.fillerCount, "filler"),
            }}
          />
        </View>
      </View>

      {/* Confidence */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm font-semibold">Confidence</Text>
          <Text className="text-sm font-bold text-white">{indicators.confidence}%</Text>
        </View>
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full bg-blue-600"
            style={{
              width: `${indicators.confidence}%`,
            }}
          />
        </View>
      </View>

      {isLoading && (
        <Text className="text-gray-500 text-xs text-center mt-2">Updating metrics...</Text>
      )}
    </View>
  );
}
