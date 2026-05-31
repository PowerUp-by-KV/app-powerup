import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useSafeBack } from "@/hooks/useSafeBack";
import { useGetResumeBuddyHistoryQuery } from "./services/resume-buddy-api";
import { ResumeBuddyHistoryCard } from "./components/ResumeBuddyHistoryCard";
import type { ResumeBuddyHistoryItem } from "./types";

export function ResumeBuddyHistoryScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();

  const { data: history, isLoading, isFetching, error, refetch } = useGetResumeBuddyHistoryQuery();

  const handleCardPress = (item: ResumeBuddyHistoryItem, index: number) => {
    router.push(`/resume-buddy-detail?index=${index}` as never);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading analysis history...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconContainer}>
          <Feather name="wifi-off" size={32} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Failed to Load History</Text>
        <Text style={styles.errorDescription}>
          Something went wrong while fetching your history. Please check your connection.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => void refetch()}>
          <Feather name="refresh-cw" size={16} color="#ffffff" />
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (!history || history.length === 0) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <View style={styles.emptyIconContainer}>
          <Feather name="inbox" size={40} color="#c7d2fe" />
        </View>
        <Text style={styles.emptyTitle}>No Analysis History</Text>
        <Text style={styles.emptyDescription}>
          Run your first resume analysis to see results here.
        </Text>
        <Pressable style={styles.analyzeButton} onPress={() => safeBack()}>
          <Feather name="zap" size={16} color="#ffffff" />
          <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // List view
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>
          {history.length} {history.length === 1 ? "Analysis" : "Analyses"}
        </Text>
        <Text style={styles.listHeaderSubtitle}>Tap any card to view the full report</Text>
      </View>

      {/* History cards */}
      {history.map((item, index) => (
        <ResumeBuddyHistoryCard
          key={item.id ?? `${item.target_role}-${index}`}
          item={item}
          onPress={() => handleCardPress(item, index)}
        />
      ))}
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
    fontWeight: "500",
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
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
    backgroundColor: "#4f46e5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 260,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
});
