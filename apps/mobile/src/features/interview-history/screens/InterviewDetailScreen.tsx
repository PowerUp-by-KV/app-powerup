/**
 * Interview Detail Screen
 * Question-by-question replay of a practice session with user response and AI feedback.
 * Reads sessionId from route params and finds the matching session from cached RTK Query data.
 */

import React from "react";
import { View, ScrollView, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetPracticeHistoryQuery } from "@/services/interview-api";
import { ResponseCard } from "../components/ResponseCard";

function formatDetailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function InterviewDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: sessions, isLoading } = useGetPracticeHistoryQuery();

  const session = sessions?.find((s) => s.session_id === sessionId);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  // Session not found
  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="search-off" size={56} color="#94a3b8" />
        <Text style={styles.notFoundTitle}>Session Not Found</Text>
        <Text style={styles.notFoundDescription}>
          This practice session could not be found. It may have been removed.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const responses = session.responses || [];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      {/* Back Navigation */}
      <Pressable style={styles.backNav} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={22} color="#3b82f6" />
        <Text style={styles.backNavText}>Back to History</Text>
      </Pressable>

      {/* Session Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Replay</Text>
        <Text style={styles.headerDate}>{formatDetailDate(session.created_at)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="question-answer" size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{session.response_count}</Text>
            <Text style={styles.statLabel}>Responses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialIcons
              name={session.status === "completed" ? "check-circle" : "access-time"}
              size={20}
              color={session.status === "completed" ? "#15803d" : "#b45309"}
            />
            <Text style={styles.statValue}>{session.status}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>

      {/* Responses */}
      {responses.length === 0 ? (
        <View style={styles.noResponses}>
          <MaterialIcons name="inbox" size={40} color="#cbd5e1" />
          <Text style={styles.noResponsesText}>No responses recorded for this session.</Text>
        </View>
      ) : (
        <View style={styles.responsesList}>
          {responses.map((response, index) => (
            <ResponseCard key={response.response_id} response={response} index={index} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  backNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  backNavText: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16,
  },
  noResponses: {
    alignItems: "center",
    paddingVertical: 48,
  },
  noResponsesText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 12,
  },
  responsesList: {
    gap: 0,
  },
});
