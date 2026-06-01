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
  if (pct >= 70) return "#22c55e";
  if (pct >= 45) return "#f59e0b";
  return "#ef4444";
}

export function ResumeBuddyHistoryCard({ item, onPress }: ResumeBuddyHistoryCardProps) {
  const scoreColor = getScoreColor(item.overall_resume_score);
  const skillsMatch = item.skills_match_percentage?.toFixed(1) ?? "0.0";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.roleContainer}>
          <Feather name="briefcase" size={14} color="#4f46e5" style={{ marginRight: 6 }} />
          <Text style={styles.roleText} numberOfLines={1}>
            {item.target_role}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      {/* Score pills */}
      <View style={styles.scoresRow}>
        {/* Overall Score */}
        <View style={styles.scoreItem}>
          <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}18` }]}>
            <Text style={[styles.scoreBadgeValue, { color: scoreColor }]}>
              {item.overall_resume_score?.toFixed(1) ?? "0"}
            </Text>
          </View>
          <Text style={styles.scoreItemLabel}>Overall</Text>
        </View>

        <View style={styles.scoreDivider} />

        {/* ATS Score */}
        <View style={styles.scoreItem}>
          <View style={[styles.scoreBadge, { backgroundColor: "#eff6ff" }]}>
            <Text style={[styles.scoreBadgeValue, { color: "#3b82f6" }]}>
              {item.ats_score ?? 0}/20
            </Text>
          </View>
          <Text style={styles.scoreItemLabel}>ATS</Text>
        </View>

        <View style={styles.scoreDivider} />

        {/* Skills Match */}
        <View style={styles.scoreItem}>
          <View style={[styles.scoreBadge, { backgroundColor: "#f5f3ff" }]}>
            <Text style={[styles.scoreBadgeValue, { color: "#7c3aed" }]}>{skillsMatch}%</Text>
          </View>
          <Text style={styles.scoreItemLabel}>Skills Match</Text>
        </View>
      </View>

      {/* Quality summary */}
      {!!item.resume_quality_summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {item.resume_quality_summary}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.viewText}>View Full Analysis</Text>
        <Feather name="chevron-right" size={16} color="#4f46e5" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardPressed: {
    backgroundColor: "#f8fafc",
    transform: [{ scale: 0.985 }],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  roleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  scoresRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreBadgeValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  scoreItemLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  scoreDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e2e8f0",
  },
  summary: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  viewText: {
    fontSize: 13,
    color: "#4f46e5",
    fontWeight: "600",
  },
});
