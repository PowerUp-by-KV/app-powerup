import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StreakIndicators, CEFRLevelBar, ModuleProgressCard } from "./components";
import { useProgress } from "./hooks/ProgressContext";
import { COLORS, FONTS, SIZES } from "@/constants/theme";

export const ProgressDashboard = () => {
  const { summary, isLoading, error, refetchAll } = useProgress();

  // Use mock data if API fails or is empty
  const displaySummary = summary || {
    streak: 7,
    overallPercentage: 68,
    cefrLevel: "B1",
    modules: [
      { name: "grammar", percentage: 80, status: "Mastery" },
      { name: "Pronunciation", percentage: 50, status: "In Progress" },
      { name: "Behavioral", percentage: 100, status: "Done" },
      { name: "Vocabulary", percentage: 30, status: "In Progress" },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchAll} />}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>

        <View style={styles.streakSection}>
          <StreakIndicators days={displaySummary.streak} />
          <View style={styles.overallProgressContainer}>
            <View
              style={[styles.progressFill, { width: `${displaySummary.overallPercentage}%` }]}
            />
            <Text style={styles.progressText}>{displaySummary.overallPercentage}% Complete</Text>
          </View>
        </View>

        <CEFRLevelBar currentLevel={displaySummary.cefrLevel} />

        <View style={styles.moduleHeader}>
          <Text style={styles.sectionTitle}>Module Progress</Text>
          <TouchableOpacity onPress={() => router.push("/progress/trends")}>
            <Text style={styles.viewTrends}>View Trends</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.moduleGrid}>
          {displaySummary.modules.map((module, index) => (
            <ModuleProgressCard
              key={index}
              name={module.name}
              percentage={module.percentage}
              status={module.status}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => router.push("/progress/heatmap")}
        >
          <Text style={styles.detailsButtonText}>View Detailed Analysis</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: 24,
    ...FONTS.bold,
    color: COLORS.black,
    marginBottom: 20,
  },
  streakSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  overallProgressContainer: {
    height: 40,
    backgroundColor: COLORS.lightGray + "50",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    marginTop: 10,
  },
  progressFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary + "30",
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
  },
  progressText: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.black,
  },
  viewTrends: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailsButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    ...FONTS.bold,
  },
});
