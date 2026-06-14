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
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        backgroundColor: isMissing ? "#F8F9FC" : "rgba(89, 122, 244, 0.08)",
        borderColor: isMissing ? "#E5E7EB" : "rgba(89, 122, 244, 0.2)",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: isMissing ? "#6B7280" : "#597AF4",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
