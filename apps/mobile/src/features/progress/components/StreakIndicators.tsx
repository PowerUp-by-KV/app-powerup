import React from "react";
import { View, Text } from "react-native";
import { Zap } from "lucide-react-native";

interface StreakIndicatorProps {
  days: number;
}

export const StreakIndicators: React.FC<StreakIndicatorProps> = ({ days }) => {
  return (
    <View className="py-2.5">
      <View className="flex-row items-center">
        <Zap size={24} color="#F59E0B" fill="#F59E0B" />
        <Text className="text-xl font-bold text-black ml-2.5">{days} Day Streak!</Text>
      </View>
    </View>
  );
};
