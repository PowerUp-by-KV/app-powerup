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
import { LinearGradient } from "expo-linear-gradient";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import { useSafeBack } from "@/hooks/useSafeBack";
import { useGetResumeBuddyHistoryQuery } from "./services/resume-buddy-api";
import { ResumeBuddyHistoryCard } from "./components/ResumeBuddyHistoryCard";
import type { ResumeBuddyHistoryItem } from "./types";

export function ResumeBuddyHistoryScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { isDark } = useThemeToggle();

  const { data: history, isLoading, isFetching, error, refetch } = useGetResumeBuddyHistoryQuery();

  const handleCardPress = (item: ResumeBuddyHistoryItem, index: number) => {
    router.push(`/resume-buddy-detail?index=${index}` as never);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }]}>
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#597AF4"} />
        <Text style={[styles.loadingText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
          Loading analysis history...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }]}>
        <View
          style={[
            styles.errorIconContainer,
            { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(244, 67, 54, 0.05)" },
          ]}
        >
          <Feather name="wifi-off" size={32} color={isDark ? "#f87171" : "#EF5350"} />
        </View>
        <Text style={[styles.errorTitle, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
          Failed to Load History
        </Text>
        <Text style={[styles.errorDescription, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
          Something went wrong while fetching your history. Please check your connection.
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: isDark ? "#4f46e5" : "#3b82f6" }]}
          onPress={() => void refetch()}
        >
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
        style={[styles.scrollContainer, { backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }]}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={isDark ? "#818cf8" : undefined}
          />
        }
      >
        <View
          style={[
            styles.emptyIconContainer,
            { backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(89, 122, 244, 0.08)" },
          ]}
        >
          <Feather name="inbox" size={40} color={isDark ? "#818cf8" : "#AFC0FF"} />
        </View>
        <Text style={[styles.emptyTitle, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
          No Analysis History
        </Text>
        <Text style={[styles.emptyDescription, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
          Run your first resume analysis to see results here.
        </Text>
        <Pressable
          style={[styles.analyzeButton, { backgroundColor: isDark ? "#4f46e5" : "#3b82f6" }]}
          onPress={() => safeBack()}
        >
          <Feather name="zap" size={16} color="#ffffff" />
          <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // List view
  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={refetch}
          tintColor={isDark ? "#818cf8" : undefined}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#4338CA", "#312E81", "#064E3B"] : ["#597AF4", "#AFC0FF", "#DEF684"]}
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, isDark && { shadowColor: "#000", shadowOpacity: 0.4 }]}
      >
        {/* Background overlapping semi-transparent circles */}
        <View
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 20,
            bottom: -60,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          }}
        />
        <Text style={styles.headerTitle}>
          {history.length} {history.length === 1 ? "Analysis" : "Analyses"}
        </Text>
        <Text style={styles.headerSubtitle}>Tap a card to view the full report</Text>
      </LinearGradient>

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
    backgroundColor: "#F8F9FC",
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
    backgroundColor: "#F8F9FC",
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(244, 67, 54, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
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
    backgroundColor: "rgba(89, 122, 244, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 260,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerGradient: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 24,
    paddingVertical: 28,
    marginBottom: 20,
    position: "relative",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
});
