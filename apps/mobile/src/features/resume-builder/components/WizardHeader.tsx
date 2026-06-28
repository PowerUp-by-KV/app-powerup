import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface WizardHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  currentSubStep?: number;
  totalSubSteps?: number;
}

export function WizardHeader({
  title,
  subtitle,
  onBack,
  currentSubStep,
  _totalSubSteps,
}: WizardHeaderProps) {
  const { isDark } = useThemeToggle();

  return (
    <View style={[styles.header, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      {currentSubStep === undefined && (
        <View style={styles.topRow}>
          <Pressable
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: isDark ? "#1f2937" : "white" }]}
          >
            <Feather name="arrow-left" size={20} color={isDark ? "#D1D5DB" : "#4b5563"} />
          </Pressable>
        </View>
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6b7280" }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
