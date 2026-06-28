import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface SelectionPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function SelectionPill({ label, isSelected, onPress }: SelectionPillProps) {
  const { isDark } = useThemeToggle();
  return (
    <Pressable
      style={[
        styles.pill,
        {
          backgroundColor: isDark ? "#1e293b" : "white",
          borderColor: isDark ? "#334155" : "#e5e7eb",
        },
        isSelected && styles.pillSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          { color: isDark ? "#94a3b8" : "#6b7280" },
          isSelected && styles.textSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 16,
  },
  pillSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  textSelected: {
    color: "white",
    fontWeight: "700",
  },
});
