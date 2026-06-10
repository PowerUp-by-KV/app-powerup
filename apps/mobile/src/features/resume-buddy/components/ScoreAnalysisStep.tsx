import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { ResumeBuddyCriterionScore } from "../types";

interface ScoreAnalysisStepProps {
  overallScore: number;
  atsScore: number;
  semanticScore: number;
  ruleBasedScore: number;
  criteriaScores: ResumeBuddyCriterionScore[];
  qualitySummary: string;
  onDone: () => void;
}

const BAR_COLORS = ["#4CAF50", "#597AF4", "#AFC0FF", "#6B7280"];

const getHeadline = (score: number) => {
  if (score >= 85) return "Excellent! You are ready to apply!";
  if (score >= 70) return "You're half way to a great start!";
  return "Let's polish your resume to stand out!";
};

export function ScoreAnalysisStep({
  overallScore,
  atsScore,
  semanticScore,
  ruleBasedScore,
  criteriaScores = [],
  qualitySummary,
  onDone,
}: ScoreAnalysisStepProps) {
  // Helper to extract criteria percentage score
  const getCritScore = (key: string): number => {
    const crit = criteriaScores.find((c) => c.key === key);
    if (!crit) return 0;
    return Math.round((crit.score / crit.max_score) * 100);
  };

  // 5 dynamic radiating nodes based on weightings
  const basicInfoPct = Math.round((getCritScore("professional_presence") / 100) * 15);
  const atsPct = Math.round((getCritScore("ats_compatibility") / 100) * 15);
  const sectionCompletenessPct = Math.round((getCritScore("resume_structure") / 100) * 30);
  const resumeQualityPct = Math.round((getCritScore("grammar_clarity") / 100) * 20);
  const professionalSummaryPct = Math.round((getCritScore("projects_experience") / 100) * 20);

  // Four items for bottom list
  const breakdownList = [
    {
      label: "ATS Score",
      score: getCritScore("ats_compatibility") || Math.round((atsScore / 20) * 100),
    },
    {
      label: "Content Score",
      score: getCritScore("skills_relevance") || Math.round(semanticScore * 10),
    },
    { label: "Resume Quality", score: getCritScore("grammar_clarity") || 78 },
    { label: "Professional Summary", score: getCritScore("projects_experience") || 75 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main motiving gradient card */}
        <LinearGradient
          colors={["#597AF4", "#AFC0FF", "#DEF684"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Background overlapping semi-transparent circles */}
          <View
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 20,
              bottom: -80,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: -80,
              bottom: -40,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          />

          {/* Top Motivator Text */}
          <Text style={styles.cardHeader}>{getHeadline(overallScore)}</Text>

          {/* Web Chart Diagram Wrapper */}
          <View style={styles.diagramWrapper}>
            {/* Dotted connector lines (SVG) */}
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
              <Line
                x1={160}
                y1={130}
                x2={160}
                y2={32}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={160}
                y1={130}
                x2={255}
                y2={95}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={160}
                y1={130}
                x2={230}
                y2={195}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={160}
                y1={130}
                x2={90}
                y2={195}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={160}
                y1={130}
                x2={65}
                y2={95}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            </Svg>

            {/* Central Score Circle */}
            <View style={styles.centerCircle}>
              <Text style={styles.centerScoreText}>{overallScore}%</Text>
              <Text style={styles.centerScoreLabel}>OVERALL SCORE</Text>
            </View>

            {/* Radiating Node 1: Basic Information */}
            <View style={[styles.radiatingNode, { top: 10, left: 110, width: 100 }]}>
              <View style={styles.outerCircle}>
                <Text style={styles.outerText}>{basicInfoPct}%</Text>
              </View>
              <Text style={styles.outerLabel}>Basic Information</Text>
            </View>

            {/* Radiating Node 2: ATS */}
            <View style={[styles.radiatingNode, { top: 73, right: 15, width: 80 }]}>
              <View style={styles.outerCircle}>
                <Text style={styles.outerText}>{atsPct}%</Text>
              </View>
              <Text style={styles.outerLabel}>ATS</Text>
            </View>

            {/* Radiating Node 3: Section completeness */}
            <View style={[styles.radiatingNode, { bottom: 20, right: 10, width: 120 }]}>
              <View style={styles.outerCircle}>
                <Text style={styles.outerText}>{sectionCompletenessPct}%</Text>
              </View>
              <Text style={styles.outerLabel}>Section completeness</Text>
            </View>

            {/* Radiating Node 4: Resume Quality */}
            <View style={[styles.radiatingNode, { bottom: 20, left: 10, width: 120 }]}>
              <View style={styles.outerCircle}>
                <Text style={styles.outerText}>{resumeQualityPct}%</Text>
              </View>
              <Text style={styles.outerLabel}>Resume Quality</Text>
            </View>

            {/* Radiating Node 5: Professional Summary */}
            <View style={[styles.radiatingNode, { top: 73, left: 15, width: 80 }]}>
              <View style={styles.outerCircle}>
                <Text style={styles.outerText}>{professionalSummaryPct}%</Text>
              </View>
              <Text style={styles.outerLabel}>Professional Summary</Text>
            </View>
          </View>

          {/* Bottom Card quality summary */}
          <Text style={styles.cardSummary}>{qualitySummary}</Text>
        </LinearGradient>

        {/* Score Breakdown Section Header */}
        <View style={styles.breakdownHeaderRow}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          <View style={styles.trendContainer}>
            <Feather name="trending-up" size={14} color="#597AF4" />
            <Text style={styles.trendText}>+4 vs last</Text>
          </View>
        </View>

        {/* Score Breakdown items */}
        {breakdownList.map((item, idx) => {
          const barColor = BAR_COLORS[idx % BAR_COLORS.length];
          return (
            <View key={item.label} style={styles.breakdownCard}>
              <View style={styles.breakdownCardRow}>
                <Text style={styles.breakdownCardLabel}>{item.label}</Text>
                <Text style={styles.breakdownCardValue}>{item.score}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.score}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky footer action button */}
      <View style={styles.footer}>
        <Pressable
          onPress={onDone}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            width: "100%",
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <LinearGradient
            colors={["#4f46e5", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardGradient: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 24,
    paddingVertical: 28,
    marginBottom: 24,
    width: "100%",
    position: "relative",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  diagramWrapper: {
    width: 320,
    height: 260,
    alignSelf: "center",
    position: "relative",
  },
  centerCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -45 }, { translateY: -45 }],
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  centerScoreText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -1,
  },
  centerScoreLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6B7280",
    marginTop: 2,
  },
  radiatingNode: {
    position: "absolute",
    alignItems: "center",
  },
  outerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  outerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  outerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 11,
  },
  cardSummary: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
    paddingHorizontal: 12,
    marginTop: 10,
  },
  breakdownHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    color: "#597AF4",
    fontWeight: "700",
  },
  breakdownCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  breakdownCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  breakdownCardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  breakdownCardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  nextButton: {
    backgroundColor: "#597AF4",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
