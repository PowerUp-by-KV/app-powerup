import React from "react";
import { View, Text } from "react-native";

interface SkillChipProps {
  label: string;
  variant: "missing" | "recommended";
}

export function SkillChip({ label, variant }: SkillChipProps) {
  const isMissing = variant === "missing";
  return (
    <View
      className={`px-3 py-1.5 rounded-xl mr-2 mb-2 border ${
        isMissing ? "bg-red-50 border-red-200/60" : "bg-indigo-50 border-indigo-200/60"
      }`}
    >
      <Text className={`text-xs font-bold ${isMissing ? "text-red-600" : "text-indigo-600"}`}>
        {label}
      </Text>
    </View>
  );
}
