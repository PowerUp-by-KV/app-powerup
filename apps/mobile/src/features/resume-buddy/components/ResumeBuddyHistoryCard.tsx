import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ResumeBuddyHistoryItem } from "../types";

interface ResumeBuddyHistoryCardProps {
  item: ResumeBuddyHistoryItem;
  onPress: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getScoreColor(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 70) return "#4CAF50";
  if (pct >= 45) return "#FF9800";
  return "#EF5350";
}

export function ResumeBuddyHistoryCard({ item, onPress }: ResumeBuddyHistoryCardProps) {
  const scoreColor = getScoreColor(item.overall_resume_score);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.roleContainer}>
          <View style={styles.iconContainer}>
            <Feather name="briefcase" size={18} color="#597AF4" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.roleText} numberOfLines={1}>
              {item.target_role}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color="#6B7280" />
      </View>

      {/* Metric Capsules Row */}
      <View style={styles.capsulesRow}>
        {/* Overall Score */}
        <View style={styles.capsule}>
          <Text style={[styles.capsuleValue, { color: scoreColor }]}>
            {Math.round(item.overall_resume_score)}%
          </Text>
          <Text style={styles.capsuleLabel}>OVERALL</Text>
        </View>

        {/* ATS Score */}
        <View style={styles.capsule}>
          <Text style={[styles.capsuleValue, { color: "#597AF4" }]}>
            {Math.round(((item.ats_score ?? 0) / 20) * 100)}%
          </Text>
          <Text style={styles.capsuleLabel}>ATS</Text>
        </View>

        {/* Skills Match */}
        <View style={styles.capsule}>
          <Text style={[styles.capsuleValue, { color: "#AFC0FF" }]}>
            {Math.round(item.skills_match_percentage ?? 0)}%
          </Text>
          <Text style={styles.capsuleLabel}>SKILLS</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardPressed: {
    backgroundColor: "#F8F9FC",
    transform: [{ scale: 0.985 }],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(89, 122, 244, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  roleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  capsulesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },
  capsule: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  capsuleValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  capsuleLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
