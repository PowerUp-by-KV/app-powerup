/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SessionCard Component - Displays a single practice session in the list
 * Shows session date, status, response count, and navigation to detail view
 */

import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import type { PracticeSession } from "@/services/interview-api";

interface SessionCardProps {
  session: PracticeSession;
  onPress: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  completed: {
    label: "Completed",
    color: "#15803d",
    bg: "#dcfce7",
    icon: "check-circle",
  },
  in_progress: {
    label: "In Progress",
    color: "#b45309",
    bg: "#fef3c7",
    icon: "access-time",
  },
  default: {
    label: "Unknown",
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: "help-outline",
  },
};

function formatSessionDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const statusKey = session.status?.toLowerCase().replace(/\s+/g, "_") || "default";
  const statusCfg = (STATUS_CONFIG[statusKey] || STATUS_CONFIG.default) as {
    label: string;
    color: string;
    bg: string;
    icon: string;
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : undefined]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={18} color="#64748b" />
          <Text style={styles.dateText}>{formatSessionDate(session.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <MaterialIcons name={statusCfg.icon as any} size={14} color={statusCfg.color} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.statRow}>
          <MaterialIcons name="question-answer" size={18} color="#3b82f6" />
          <Text style={styles.statText}>
            {session.response_count} {session.response_count === 1 ? "Response" : "Responses"}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewText}>View Replay</Text>
        <MaterialIcons name="chevron-right" size={22} color="#3b82f6" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardPressed: {
    backgroundColor: "#f8fafc",
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  viewText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
