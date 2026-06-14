/**
 * EmptyState Component - Empty state placeholder for interview history
 * Displays when no practice sessions exist yet
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "@/features/resume/components/Button";

interface EmptyStateProps {
  onStartInterview: () => void;
}

export function EmptyState({ onStartInterview }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="history" size={72} color="#cbd5e1" />
      </View>
      <Text style={styles.title}>No Interviews Yet</Text>
      <Text style={styles.description}>
        Start your first mock interview to see your practice history and track your progress over
        time.
      </Text>
      <View style={styles.buttonWrapper}>
        <Button variant="primary" size="lg" onPress={onStartInterview}>
          Start Mock Interview
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: 260,
  },
});
