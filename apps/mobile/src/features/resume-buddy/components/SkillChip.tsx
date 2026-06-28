import React from "react";
import { View, Text } from "react-native";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface SkillChipProps {
  label: string;
  variant: "missing" | "recommended";
}

export function SkillChip({ label, variant }: SkillChipProps) {
  const { isDark } = useThemeToggle();
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
        backgroundColor: isMissing
          ? isDark
            ? "#1E293B"
            : "#F8F9FC"
          : isDark
            ? "rgba(99, 102, 241, 0.15)"
            : "rgba(89, 122, 244, 0.08)",
        borderColor: isMissing
          ? isDark
            ? "#334155"
            : "#E5E7EB"
          : isDark
            ? "rgba(99, 102, 241, 0.3)"
            : "rgba(89, 122, 244, 0.2)",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: isMissing ? (isDark ? "#94A3B8" : "#6B7280") : isDark ? "#818cf8" : "#597AF4",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
