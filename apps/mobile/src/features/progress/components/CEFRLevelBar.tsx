import React from "react";
import { View, Text } from "react-native";
import { COLORS } from "@/constants/theme";

interface CEFRLevelBarProps {
  currentLevel: string;
}

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const CEFRLevelBar: React.FC<CEFRLevelBarProps> = ({ currentLevel }) => {
  const currentIndex = levels.indexOf(currentLevel) === -1 ? 2 : levels.indexOf(currentLevel);

  return (
    <View className="my-[15px]">
      <Text className="text-base font-semibold text-black mb-5">
        CEFR Level: {currentLevel} (Intermediate)
      </Text>
      <View className="h-10 justify-center">
        <View className="absolute h-1 left-0 right-0 bg-[#E2E8F0] rounded-full" />
        <View
          className="absolute h-1 left-0 bg-[#6366F1] rounded-full"
          style={{ width: `${(currentIndex / (levels.length - 1)) * 100}%` }}
        />
        <View className="flex-row justify-between items-center">
          {levels.map((level, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <View key={level} className="items-center">
                <View
                  className={`border-2 border-white mb-1 ${
                    isCurrent
                      ? "w-4 h-4 rounded-full bg-[#6366F1] -translate-y-0.5 z-10"
                      : `w-3 h-3 rounded-full ${isActive ? "bg-[#6366F1]" : "bg-[#E2E8F0]"}`
                  }`}
                />
                <Text
                  className={`text-[12px] ${
                    isCurrent ? "text-[#6366F1] font-bold" : "text-[#94A3B8] font-medium"
                  }`}
                >
                  {level}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
