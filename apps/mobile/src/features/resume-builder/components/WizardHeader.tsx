import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";

interface WizardHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  currentSubStep: number;
  totalSubSteps: number;
}

export function WizardHeader({
  title,
  subtitle,
  onBack,
  currentSubStep,
  totalSubSteps,
}: WizardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#4b5563" />
        </Pressable>
        <Text style={styles.headerTopText}>Resume Building</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentSubStep} / {totalSubSteps}
          </Text>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#f3f4f6",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTopText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  progressContainer: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  titleContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
