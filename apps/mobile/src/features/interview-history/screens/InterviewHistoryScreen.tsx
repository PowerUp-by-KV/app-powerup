/**
 * Interview History Screen
 * Displays a list of all past practice sessions with status and response counts.
 * Uses RTK Query to fetch from GET /api/v1/practice/history
 */

import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetPracticeHistoryQuery } from "@/services/interview-api";
import { SessionCard } from "../components/SessionCard";
import { EmptyState } from "../components/EmptyState";

export function InterviewHistoryScreen() {
  const router = useRouter();
  const { data: sessions, isLoading, isFetching, error, refetch } = useGetPracticeHistoryQuery();

  const handleStartInterview = useCallback(() => {
    // Navigate to the interview/mock interview start screen
    // Adjust route path to match your app's routing
    router.push("/mock-interview" as never);
  }, [router]);

  const handleViewSession = useCallback(
    (sessionId: string) => {
      router.push(`/interview-detail?sessionId=${sessionId}` as never);
    },
    [router],
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading practice history...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={56} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to Load History</Text>
        <Text style={styles.errorDescription}>
          Something went wrong while fetching your practice history. Please try again.
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <MaterialIcons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.emptyContentContainer}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <EmptyState onStartInterview={handleStartInterview} />
      </ScrollView>
    );
  }

  // List view
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice History</Text>
        <Text style={styles.headerSubtitle}>
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded
        </Text>
      </View>

      {/* Session List */}
      <View style={styles.listContainer}>
        {sessions.map((session) => (
          <SessionCard
            key={session.session_id}
            session={session}
            onPress={() => handleViewSession(session.session_id)}
          />
        ))}
      </View>
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
  emptyContentContainer: {
    flexGrow: 1,
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
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  listContainer: {
    gap: 0,
  },
});
