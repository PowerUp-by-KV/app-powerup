import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
  style?: any;
  className?: string;
}

export const ProgressBar = ({
  progress,
  label,
  color,
  style,
  className = "",
}: ProgressBarProps) => {
  return (
    <View className={`w-full my-2.5 ${className}`} style={style}>
      {label && <Text className="text-sm text-[#475569] mb-[5px] font-medium">{label}</Text>}
      <View className="h-2.5 bg-[#E2E8F0] rounded-[5px] overflow-hidden">
        <View
          style={{
            width: `${Math.min(100, progress)}%`,
            backgroundColor: color || "#6366F1",
          }}
          className="h-full rounded-[5px]"
        />
      </View>
    </View>
  );
};
