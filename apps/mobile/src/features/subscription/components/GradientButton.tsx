import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  className?: string;
  textClassName?: string;
}

export const GradientButton = ({
  title,
  onPress,
  colors,
  className,
  textClassName,
}: GradientButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-xl overflow-hidden w-full my-2.5 ${className || ""}`}
    >
      <LinearGradient
        colors={
          (colors as unknown as readonly [string, string, ...string[]]) ||
          (["#FFAD60", "#FF8C42"] as const)
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-4 px-5 items-center justify-center"
      >
        <Text className={`color-white text-base font-semibold ${textClassName || ""}`}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
