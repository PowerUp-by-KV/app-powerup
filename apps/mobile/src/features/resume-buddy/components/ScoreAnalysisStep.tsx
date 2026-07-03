import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, {
  Line,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeToggle } from "@/hooks/useThemeToggle";
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

const getScoreColor = (pct: number): string => {
  if (pct >= 81) return "#4CAF50"; // Green for 81 to 100
  if (pct >= 41) return "#FF9800"; // Yellow for 41 to 80
  return "#EF5350"; // Red for below 41 (40 or lower)
};

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
  const { isDark } = useThemeToggle();
  // Helper to extract criteria percentage score
  const getCritScore = (key: string): number => {
    const crit = criteriaScores.find((c) => c.key === key);
    if (!crit) return 0;
    return Math.round((crit.score / crit.max_score) * 100);
  };

  // Helper to get raw percentage score for radiating nodes
  const getCritVal = (key: string, defaultVal: number): number => {
    const crit = criteriaScores.find((c) => c.key === key);
    if (!crit) return defaultVal;
    return Math.round((crit.score / crit.max_score) * 100);
  };

  const skillsRelevanceScore = getCritVal("skills_relevance", 33);
  const atsCompatibilityScore = getCritVal("ats_compatibility", 100);
  const resumeStructureScore = getCritVal("resume_structure", 100);
  const grammarClarityScore = getCritVal("grammar_clarity", 100);
  const projectsExperienceScore = getCritVal("projects_experience", 95);

  const atsPct = Math.round((atsScore / 20) * 100);
  const semPct = semanticScore > 100 ? Math.round(semanticScore / 10) : Math.round(semanticScore);
  const rulePct =
    ruleBasedScore > 100 ? Math.round(ruleBasedScore / 10) : Math.round(ruleBasedScore);

  // Dynamic list mapped from criteriaScores if available, else static fallback
  const breakdownList =
    criteriaScores.length > 0
      ? criteriaScores.map((c) => ({
          label: c.label,
          score: Math.min(Math.round((c.score / c.max_score) * 100), 100),
        }))
      : [
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
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main motiving gradient card */}
        <LinearGradient
          colors={isDark ? ["#4338CA", "#312E81", "#064E3B"] : ["#597AF4", "#AFC0FF", "#DEF684"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, isDark && { shadowColor: "#000", shadowOpacity: 0.4 }]}
        >
          {/* Background large faint green glow (replacing circles) */}
          <View
            style={{
              position: "absolute",
              left: -100,
              bottom: -150,
              width: 350,
              height: 350,
              borderRadius: 175,
              backgroundColor: isDark ? "rgba(163, 230, 53, 0.05)" : "rgba(163, 230, 53, 0.15)",
            }}
          />

          {/* Top Motivator Text */}
          <Text style={styles.cardHeader}>{getHeadline(overallScore)}</Text>

          {/* Web Chart Diagram Wrapper */}
          <View style={styles.diagramWrapper}>
            {/* Dotted connector lines (SVG) */}
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
              <Line
                x1={170}
                y1={150}
                x2={170}
                y2={35}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={170}
                y1={150}
                x2={280}
                y2={110}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={170}
                y1={150}
                x2={250}
                y2={250}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={170}
                y1={150}
                x2={90}
                y2={250}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Line
                x1={170}
                y1={150}
                x2={60}
                y2={110}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            </Svg>

            {/* Central Score Circle */}
            <View
              style={[styles.centerCircle, { backgroundColor: isDark ? "#1A1C29" : "#ffffff" }]}
            >
              <Svg width={90} height={90} style={{ position: "absolute" }}>
                <Defs>
                  <SvgLinearGradient id="scoreGradOverall" x1="0%" y1="100%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#3b82f6" />
                    <Stop offset="100%" stopColor="#a3e635" />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke={isDark ? "#2A2D40" : "#E2E8F0"}
                  strokeWidth={6}
                  fill="none"
                />
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke="url(#scoreGradOverall)"
                  strokeWidth={6}
                  fill="none"
                  strokeDasharray={`${(overallScore / 100) * (2 * Math.PI * 40)} 300`}
                  strokeDashoffset={0}
                  rotation="-90"
                  originX="45"
                  originY="45"
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={[styles.centerScoreText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                {Math.round(overallScore)}%
              </Text>
              <Text
                style={[
                  styles.centerScoreLabel,
                  { color: isDark ? "#94A3B8" : "#6B7280", marginTop: 0 },
                ]}
              >
                Overall Score
              </Text>
            </View>

            {/* Radiating Node 1: Basic Information (Top) */}
            <View style={[styles.radiatingNode, { top: 0, left: 135 }]}>
              <View style={styles.glowingOrbOuter}>
                <View style={styles.glowingOrbInner}>
                  <Text style={styles.glowingOrbText}>{skillsRelevanceScore}%</Text>
                </View>
              </View>
              <Text style={styles.orbLabel}>Basic Information</Text>
            </View>

            {/* Radiating Node 2: ATS (Right) */}
            <View style={[styles.radiatingNode, { top: 75, right: 25 }]}>
              <View style={styles.glowingOrbOuter}>
                <View style={styles.glowingOrbInner}>
                  <Text style={styles.glowingOrbText}>{atsCompatibilityScore}%</Text>
                </View>
              </View>
              <Text style={styles.orbLabel}>ATS</Text>
            </View>

            {/* Radiating Node 3: Section completeness (Bottom Right) */}
            <View style={[styles.radiatingNode, { bottom: 15, right: 55 }]}>
              <View style={styles.glowingOrbOuter}>
                <View style={styles.glowingOrbInner}>
                  <Text style={styles.glowingOrbText}>{resumeStructureScore}%</Text>
                </View>
              </View>
              <Text style={styles.orbLabel}>Section completeness</Text>
            </View>

            {/* Radiating Node 4: Resume Quality (Bottom Left) */}
            <View style={[styles.radiatingNode, { bottom: 15, left: 55 }]}>
              <View style={styles.glowingOrbOuter}>
                <View style={styles.glowingOrbInner}>
                  <Text style={styles.glowingOrbText}>{grammarClarityScore}%</Text>
                </View>
              </View>
              <Text style={styles.orbLabel}>Resume Quality</Text>
            </View>

            {/* Radiating Node 5: Professional Summary (Left) */}
            <View style={[styles.radiatingNode, { top: 75, left: 25 }]}>
              <View style={styles.glowingOrbOuter}>
                <View style={styles.glowingOrbInner}>
                  <Text style={styles.glowingOrbText}>{projectsExperienceScore}%</Text>
                </View>
              </View>
              <Text style={styles.orbLabel}>Professional Summary</Text>
            </View>
          </View>

          {/* Bottom Card quality summary */}
          <Text style={styles.cardSummary}>{qualitySummary}</Text>
        </LinearGradient>

        {/* Dynamic Score Rings Card */}
        <LinearGradient
          colors={isDark ? ["#4338CA", "#312E81", "#064E3B"] : ["#597AF4", "#AFC0FF", "#DEF684"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.threeScoresCardGradient,
            isDark && { shadowColor: "#000", shadowOpacity: 0.4 },
          ]}
        >
          <View style={styles.threeScoresCard}>
            {/* ATS Score */}
            <View style={styles.scoreCircleWrapper}>
              <View
                style={[
                  styles.scoreCircleRing,
                  {
                    borderWidth: 0,
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
                  },
                ]}
              >
                <Svg width={70} height={70} style={{ position: "absolute" }}>
                  <Defs>
                    <SvgLinearGradient id="scoreGradAts" x1="0%" y1="100%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#3b82f6" />
                      <Stop offset="100%" stopColor="#a3e635" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx={35}
                    cy={35}
                    r={33.25}
                    stroke="url(#scoreGradAts)"
                    strokeWidth={3.5}
                    fill="none"
                  />
                </Svg>
                <Text style={[styles.scoreCircleText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                  {atsPct}%
                </Text>
              </View>
              <Text style={styles.scoreCircleLabel}>ATS Score</Text>
            </View>

            {/* Semantic Score */}
            <View style={styles.scoreCircleWrapper}>
              <View
                style={[
                  styles.scoreCircleRing,
                  {
                    borderWidth: 0,
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
                  },
                ]}
              >
                <Svg width={70} height={70} style={{ position: "absolute" }}>
                  <Defs>
                    <SvgLinearGradient id="scoreGradSemantic" x1="0%" y1="100%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#3b82f6" />
                      <Stop offset="100%" stopColor="#a3e635" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx={35}
                    cy={35}
                    r={33.25}
                    stroke="url(#scoreGradSemantic)"
                    strokeWidth={3.5}
                    fill="none"
                  />
                </Svg>
                <Text style={[styles.scoreCircleText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                  {semPct}%
                </Text>
              </View>
              <Text style={styles.scoreCircleLabel}>Semantic Score</Text>
            </View>

            {/* Rule-Based */}
            <View style={styles.scoreCircleWrapper}>
              <View
                style={[
                  styles.scoreCircleRing,
                  {
                    borderWidth: 0,
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
                  },
                ]}
              >
                <Svg width={70} height={70} style={{ position: "absolute" }}>
                  <Defs>
                    <SvgLinearGradient id="scoreGradRule" x1="0%" y1="100%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#3b82f6" />
                      <Stop offset="100%" stopColor="#a3e635" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx={35}
                    cy={35}
                    r={33.25}
                    stroke="url(#scoreGradRule)"
                    strokeWidth={3.5}
                    fill="none"
                  />
                </Svg>
                <Text style={[styles.scoreCircleText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                  {rulePct}%
                </Text>
              </View>
              <Text style={styles.scoreCircleLabel}>Rule-Based</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Score Breakdown Section Header */}
        <View style={styles.breakdownHeaderRow}>
          <Text style={[styles.breakdownTitle, { color: isDark ? "#F8FAFC" : "#0f172a" }]}>
            Score Breakdown
          </Text>
          <View style={styles.trendContainer}>
            <Feather name="trending-up" size={14} color={isDark ? "#818cf8" : "#597AF4"} />
            <Text style={[styles.trendText, { color: isDark ? "#818cf8" : "#597AF4" }]}>
              +4 vs last
            </Text>
          </View>
        </View>

        {/* Score Breakdown items */}
        {breakdownList.map((item) => {
          const barColor = getScoreColor(item.score);
          return (
            <View
              key={item.label}
              style={[
                styles.breakdownCard,
                {
                  backgroundColor: isDark ? "#1A1C29" : "#ffffff",
                  borderColor: isDark ? "#2A2D40" : "#E5E7EB",
                  shadowColor: isDark ? "#000" : "#0f172a",
                  shadowOpacity: isDark ? 0.2 : 0.02,
                },
              ]}
            >
              <View style={styles.breakdownCardRow}>
                <Text
                  style={[styles.breakdownCardLabel, { color: isDark ? "#F8FAFC" : "#1F2937" }]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[styles.breakdownCardValue, { color: isDark ? "#F8FAFC" : "#1F2937" }]}
                >
                  {item.score}%
                </Text>
              </View>
              <View
                style={[styles.progressBarBg, { backgroundColor: isDark ? "#334155" : "#E5E7EB" }]}
              >
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
      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDark ? "#0F1020" : "#ffffff",
            borderTopColor: isDark ? "#1E293B" : "#f1f5f9",
          },
        ]}
      >
        <Pressable
          onPress={onDone}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            width: "100%",
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <LinearGradient
            colors={isDark ? ["#6366f1", "#3b82f6"] : ["#4f46e5", "#3b82f6"]}
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
    width: 340,
    height: 320,
    alignSelf: "center",
    position: "relative",
    marginTop: 10,
  },
  centerCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -45 }, { translateY: -45 }],
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  centerScoreText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  centerScoreLabel: {
    fontSize: 8,
    fontWeight: "800",
  },
  radiatingNode: {
    position: "absolute",
    alignItems: "center",
  },
  glowingOrbOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(129, 140, 248, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  glowingOrbInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(99, 102, 241, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  glowingOrbText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  orbLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
    maxWidth: 120,
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
  threeScoresCardGradient: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    marginTop: 16,
    width: "100%",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  threeScoresCard: {
    backgroundColor: "transparent",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  scoreCircleWrapper: {
    alignItems: "center",
    flex: 1,
  },
  scoreCircleRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3.5,
    borderColor: "#597AF4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  scoreCircleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  scoreCircleLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 8,
    textAlign: "center",
  },
});
