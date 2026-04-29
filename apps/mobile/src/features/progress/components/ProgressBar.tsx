import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  progress: number;
  color?: string;
  className?: string;
  height?: number;
}

export const ProgressBar = ({
  progress,
  color = "#6366F1",
  className = "",
  height,
}: ProgressBarProps) => {
  return (
    <View className={`w-full my-2.5 ${className}`}>
      <View className="bg-[#E2E8F0] rounded-[5px] overflow-hidden" style={{ height: height || 10 }}>
        <View
          style={{
            width: `${Math.min(100, progress)}%`,
            backgroundColor: color,
            height: "100%",
          }}
        />
      </View>
    </View>
  );
};
