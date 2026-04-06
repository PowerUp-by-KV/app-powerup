import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { COLORS, FONTS } from "@/constants/theme";

interface ModuleProgressCardProps {
  name: string;
  percentage: number;
  status: string;
}

export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({
  name,
  percentage,
  status,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Mastery":
        return COLORS.success;
      case "Done":
        return COLORS.primary;
      default:
        return COLORS.warning;
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.progressContainer}>
        <ProgressBar progress={percentage} color={COLORS.primary} style={styles.progressBar} />
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "15" }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {status === "Mastery" ? "⭐ " : status === "Done" ? "✅ " : ""}
          {status}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 15,
    padding: 12,
  },
  name: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    marginRight: 8,
  },
  percentage: {
    fontSize: 12,
    ...FONTS.medium,
    color: COLORS.gray,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    ...FONTS.bold,
  },
});
