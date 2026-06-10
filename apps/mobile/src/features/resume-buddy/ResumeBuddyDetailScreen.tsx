/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import { useGetResumeBuddyHistoryQuery } from "./services/resume-buddy-api";
import { SkillChip } from "./components/SkillChip";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const BAR_COLORS = ["#4CAF50", "#597AF4", "#AFC0FF", "#FF9800"];

const getHeadline = (score: number) => {
  if (score >= 85) return "Excellent! You are ready to apply!";
  if (score >= 70) return "You're half way to a great start!";
  return "Let's polish your resume to stand out!";
};

export function ResumeBuddyDetailScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index: string }>();
  const { data: history, isLoading } = useGetResumeBuddyHistoryQuery();

  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [weaknessesExpanded, setWeaknessesExpanded] = useState(true);
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllWeaknesses, setShowAllWeaknesses] = useState(false);

  const itemIndex = parseInt(index ?? "0", 10);
  const item = history?.[itemIndex];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#597AF4" />
        <Text style={styles.loadingText}>Loading analysis...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.notFoundIcon}>
          <Feather name="search" size={32} color="#94a3b8" />
        </View>
        <Text style={styles.notFoundTitle}>Analysis Not Found</Text>
        <Text style={styles.notFoundDescription}>
          This analysis could not be found. It may have been removed.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color="#ffffff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const toggleStrengths = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStrengthsExpanded(!strengthsExpanded);
  };

  const toggleWeaknesses = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWeaknessesExpanded(!weaknessesExpanded);
  };

  // Helper to extract criteria percentage score
  const getCritScore = (key: string): number => {
    const crit = item.criteria_scores?.find((c) => c.key === key);
    if (!crit) return 0;
    return Math.round((crit.score / crit.max_score) * 100);
  };

  const basicInfoPct = Math.round((getCritScore("professional_presence") / 100) * 15);
  const atsPct = Math.round((getCritScore("ats_compatibility") / 100) * 15);
  const sectionCompletenessPct = Math.round((getCritScore("resume_structure") / 100) * 30);
  const resumeQualityPct = Math.round((getCritScore("grammar_clarity") / 100) * 20);
  const professionalSummaryPct = Math.round((getCritScore("projects_experience") / 100) * 20);

  const limit = 4;
  const strengths = item.strengths ?? [];
  const weaknesses = item.weaknesses ?? [];
  const hasMoreStrengths = strengths.length > limit;
  const hasMoreWeaknesses = weaknesses.length > limit;

  const visibleStrengths = showAllStrengths ? strengths : strengths.slice(0, limit);
  const visibleWeaknesses = showAllWeaknesses ? weaknesses : weaknesses.slice(0, limit);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Navigation */}
      <Pressable style={styles.backNav} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color="#597AF4" />
        <Text style={styles.backNavText}>Back to History</Text>
      </Pressable>

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconContainer}>
          <Feather name="briefcase" size={20} color="#597AF4" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.roleText} numberOfLines={1}>
            {item.target_role}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      {/* ── Score Overview ── */}
      <Text style={styles.sectionHeading}>Score Overview</Text>
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

        <Text style={styles.cardHeader}>{getHeadline(item.overall_resume_score)}</Text>

        {/* Web Chart Diagram Wrapper */}
        <View style={styles.diagramWrapper}>
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

          <View style={styles.centerCircle}>
            <Text style={styles.centerScoreText}>{Math.round(item.overall_resume_score)}%</Text>
            <Text style={styles.centerScoreLabel}>OVERALL SCORE</Text>
          </View>

          {/* Radiating Nodes */}
          <View style={[styles.radiatingNode, { top: 10, left: 110, width: 100 }]}>
            <View style={styles.outerCircle}>
              <Text style={styles.outerText}>{basicInfoPct}%</Text>
            </View>
            <Text style={styles.outerLabel}>Basic Information</Text>
          </View>

          <View style={[styles.radiatingNode, { top: 73, right: 15, width: 80 }]}>
            <View style={styles.outerCircle}>
              <Text style={styles.outerText}>{atsPct}%</Text>
            </View>
            <Text style={styles.outerLabel}>ATS</Text>
          </View>

          <View style={[styles.radiatingNode, { bottom: 20, right: 10, width: 120 }]}>
            <View style={styles.outerCircle}>
              <Text style={styles.outerText}>{sectionCompletenessPct}%</Text>
            </View>
            <Text style={styles.outerLabel}>Section completeness</Text>
          </View>

          <View style={[styles.radiatingNode, { bottom: 20, left: 10, width: 120 }]}>
            <View style={styles.outerCircle}>
              <Text style={styles.outerText}>{resumeQualityPct}%</Text>
            </View>
            <Text style={styles.outerLabel}>Resume Quality</Text>
          </View>

          <View style={[styles.radiatingNode, { top: 73, left: 15, width: 80 }]}>
            <View style={styles.outerCircle}>
              <Text style={styles.outerText}>{professionalSummaryPct}%</Text>
            </View>
            <Text style={styles.outerLabel}>Professional Summary</Text>
          </View>
        </View>

        {!!item.resume_quality_summary && (
          <Text style={styles.cardSummary}>{item.resume_quality_summary}</Text>
        )}
      </LinearGradient>

      {/* ── ATS Analysis ── */}
      <Text style={styles.sectionHeading}>ATS Analysis</Text>
      <View style={styles.card}>
        <View style={styles.cardHeaderWithIcon}>
          <View style={[styles.badgeCircle, { backgroundColor: "rgba(89, 122, 244, 0.1)" }]}>
            <Feather name="shield" size={18} color="#597AF4" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>ATS Layout Findings</Text>
            <Text style={styles.cardSubtitle}>ATS compatibility checklist</Text>
          </View>
        </View>

        {(
          [
            ["Single Column Layout", item.ats_analysis?.single_column_layout],
            ["Proper Section Headings", item.ats_analysis?.proper_section_headings],
            ["No Tables / Images / Icons", item.ats_analysis?.no_tables_images_icons],
            ["Standard Formatting", item.ats_analysis?.standard_formatting],
            ["Keyword Optimization", item.ats_analysis?.keyword_optimization],
          ] as [string, boolean][]
        ).map(([label, passed]) => (
          <View key={label} style={styles.atsCheckRow}>
            <View
              style={[
                styles.checkIconWrapper,
                { backgroundColor: passed ? "rgba(76, 175, 80, 0.1)" : "rgba(107, 114, 128, 0.1)" },
              ]}
            >
              <Feather
                name={passed ? "check" : "x"}
                size={13}
                color={passed ? "#4CAF50" : "#6B7280"}
              />
            </View>
            <Text style={styles.atsCheckLabel}>{label}</Text>
          </View>
        ))}

        {!!item.ats_analysis?.findings?.length && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.atsSubheading}>Findings</Text>
            {item.ats_analysis.findings.map((f, idx) => (
              <View key={idx} style={styles.findingRow}>
                <Feather name="arrow-right" size={12} color="#94a3b8" style={{ marginTop: 3 }} />
                <Text style={styles.findingText}>{f}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Criteria Scores ── */}
      {!!item.criteria_scores?.length && (
        <>
          <Text style={styles.sectionHeading}>Criteria Scores</Text>
          {item.criteria_scores.map((c, idx) => {
            const pct = Math.min((c.score / c.max_score) * 100, 100);
            const barColor = BAR_COLORS[idx % BAR_COLORS.length];
            return (
              <View key={`${c.key}-${idx}`} style={styles.card}>
                <View style={styles.breakdownCardRow}>
                  <Text style={styles.breakdownCardLabel}>{c.label}</Text>
                  <Text style={styles.breakdownCardValue}>
                    {c.score}/{c.max_score}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${pct}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <Text style={styles.criteriaFeedback}>{c.feedback}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* ── Strengths & Weaknesses ── */}
      <Text style={styles.sectionHeading}>Strengths & Weaknesses</Text>

      {/* Key Strengths */}
      <View style={styles.card}>
        <Pressable onPress={toggleStrengths} style={styles.collapsibleHeader}>
          <View style={[styles.badgeCircle, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
            <Feather name="check-circle" size={18} color="#4CAF50" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>Key Strengths</Text>
            <Text style={styles.cardSubtitle}>{strengths.length} items</Text>
          </View>
          <Feather
            name={strengthsExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        {strengthsExpanded && (
          <View style={styles.listContainer}>
            {strengths.length === 0 ? (
              <Text style={styles.emptyText}>No key strengths detected yet.</Text>
            ) : (
              <>
                {visibleStrengths.map((s, idx) => (
                  <View key={`strength-${idx}`} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: "#4CAF50" }]} />
                    <Text style={styles.itemText}>{s}</Text>
                  </View>
                ))}

                {hasMoreStrengths && !showAllStrengths && (
                  <Pressable onPress={() => setShowAllStrengths(true)} style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </Pressable>
                )}
                {showAllStrengths && (
                  <Pressable
                    onPress={() => setShowAllStrengths(false)}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>Show Less</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </View>

      {/* Areas to Improve */}
      <View style={styles.card}>
        <Pressable onPress={toggleWeaknesses} style={styles.collapsibleHeader}>
          <View style={[styles.badgeCircle, { backgroundColor: "rgba(107, 114, 128, 0.1)" }]}>
            <Feather name="alert-triangle" size={18} color="#6B7280" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>Areas to Improve</Text>
            <Text style={styles.cardSubtitle}>{weaknesses.length} items</Text>
          </View>
          <Feather
            name={weaknessesExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        {weaknessesExpanded && (
          <View style={styles.listContainer}>
            {weaknesses.length === 0 ? (
              <Text style={styles.emptyText}>No areas to improve detected yet.</Text>
            ) : (
              <>
                {visibleWeaknesses.map((w, idx) => (
                  <View key={`weakness-${idx}`} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: "#6B7280" }]} />
                    <Text style={styles.itemText}>{w}</Text>
                  </View>
                ))}

                {hasMoreWeaknesses && !showAllWeaknesses && (
                  <Pressable
                    onPress={() => setShowAllWeaknesses(true)}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </Pressable>
                )}
                {showAllWeaknesses && (
                  <Pressable
                    onPress={() => setShowAllWeaknesses(false)}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>Show Less</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </View>

      {/* ── Missing Skills ── */}
      {!!item.missing_skills?.length && (
        <>
          <Text style={styles.sectionHeading}>Missing Skills</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Missing Skills</Text>
              <Text style={styles.cardSubtitle}>Add these to match the role</Text>
            </View>
            <View style={styles.chipRow}>
              {item.missing_skills.map((s, idx) => (
                <SkillChip key={`${s}-${idx}`} label={s} variant="missing" />
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── Recommended Technologies ── */}
      {!!item.skills_analysis?.recommended_technologies?.length && (
        <>
          <Text style={styles.sectionHeading}>Recommended Technologies</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recommended Tech Stack</Text>
              <Text style={styles.cardSubtitle}>
                Trending for {item.target_role || "Full Stack Dev"}
              </Text>
            </View>
            <View style={styles.chipRow}>
              {item.skills_analysis.recommended_technologies.map((t, idx) => (
                <SkillChip key={`${t}-${idx}`} label={t} variant="recommended" />
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── Personalized Suggestions ── */}
      {!!item.personalized_suggestions?.length && (
        <>
          <Text style={styles.sectionHeading}>Personalized Suggestions</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderWithIcon}>
              <View style={[styles.badgeCircle, { backgroundColor: "rgba(89, 122, 244, 0.1)" }]}>
                <Feather name="zap" size={18} color="#597AF4" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>Personalized Suggestions</Text>
                <Text style={styles.cardSubtitle}>From AI Coach</Text>
              </View>
            </View>
            <View style={styles.listContainer}>
              {item.personalized_suggestions.map((sug, idx) => (
                <View key={`suggestion-${idx}`} style={styles.listItem}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{sug}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Bottom padding */}
      <View style={{ height: 40 }} />
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
  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(107, 114, 128, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  notFoundDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
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
    marginBottom: 16,
  },
  backNavText: {
    fontSize: 15,
    color: "#597AF4",
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(89, 122, 244, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  roleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
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
  cardHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  badgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  atsCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  checkIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  atsCheckLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  atsSubheading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  findingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 6,
  },
  findingText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
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
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  criteriaFeedback: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    fontWeight: "500",
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContainer: {
    marginTop: 18,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  viewAllButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(89, 122, 244, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#597AF4",
  },
});
