import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useGetResumeBuddyHistoryQuery } from "./services/resume-buddy-api";
import { AnalysisCard } from "./components/AnalysisCard";
import { ScoreRing } from "./components/ScoreRing";
import { SkillChip } from "./components/SkillChip";

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

export function ResumeBuddyDetailScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index: string }>();
  const { data: history, isLoading } = useGetResumeBuddyHistoryQuery();

  const itemIndex = parseInt(index ?? "0", 10);
  const item = history?.[itemIndex];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
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

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Navigation */}
      <Pressable style={styles.backNav} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color="#4f46e5" />
        <Text style={styles.backNavText}>Back to History</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.roleRow}>
          <Feather name="briefcase" size={16} color="#4f46e5" style={{ marginRight: 8 }} />
          <Text style={styles.roleText}>{item.target_role}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      {/* ── Score Overview ── */}
      <Text style={styles.sectionHeading}>Score Overview</Text>
      <View style={styles.card}>
        <View style={styles.scoreRingsRow}>
          <ScoreRing score={item.overall_resume_score} maxScore={100} label="Overall" />
          <ScoreRing score={item.ats_score} maxScore={20} label="ATS Score" />
          <ScoreRing score={item.skills_match_percentage} maxScore={100} label="Skills Match" />
        </View>
        {!!item.resume_quality_summary && (
          <Text style={styles.qualitySummary}>{item.resume_quality_summary}</Text>
        )}
      </View>

      {/* ── ATS Analysis ── */}
      <Text style={styles.sectionHeading}>ATS Analysis</Text>
      <View style={styles.card}>
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
            <Feather
              name={passed ? "check-circle" : "x-circle"}
              size={16}
              color={passed ? "#22c55e" : "#ef4444"}
            />
            <Text style={[styles.atsCheckLabel, { color: passed ? "#166534" : "#991b1b" }]}>
              {label}
            </Text>
          </View>
        ))}
        {!!item.ats_analysis?.findings?.length && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.atsSubheading}>Findings</Text>
            {item.ats_analysis.findings.map((f, idx) => (
              <View key={idx} style={styles.findingRow}>
                <Feather name="arrow-right" size={11} color="#64748b" style={{ marginTop: 3 }} />
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
            return (
              <View key={`${c.key}-${idx}`} style={[styles.card, { marginBottom: 10 }]}>
                <View style={styles.criteriaHeader}>
                  <Text style={styles.criteriaLabel}>{c.label}</Text>
                  <Text style={styles.criteriaScore}>
                    {c.score}/{c.max_score}
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                </View>
                <Text style={styles.criteriaFeedback}>{c.feedback}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* ── Strengths & Weaknesses ── */}
      <Text style={styles.sectionHeading}>Strengths & Weaknesses</Text>
      <AnalysisCard items={item.strengths ?? []} type="strength" title="Key Strengths" />
      <AnalysisCard items={item.weaknesses ?? []} type="weakness" title="Areas to Improve" />

      {/* ── Missing Skills ── */}
      {!!item.missing_skills?.length && (
        <>
          <Text style={styles.sectionHeading}>Missing Skills</Text>
          <View style={[styles.card, { marginBottom: 20 }]}>
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
          <View style={[styles.card, { marginBottom: 20 }]}>
            <View style={styles.chipRow}>
              {item.skills_analysis.recommended_technologies.map((t, idx) => (
                <SkillChip key={`${t}-${idx}`} label={t} variant="recommended" />
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── Personalized Suggestions ── */}
      <Text style={styles.sectionHeading}>Personalized Suggestions</Text>
      <AnalysisCard
        items={item.personalized_suggestions ?? []}
        type="suggestion"
        title="Suggestions"
      />

      {/* Bottom padding */}
      <View style={{ height: 40 }} />
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
  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
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
    backgroundColor: "#4f46e5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
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
    color: "#4f46e5",
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  roleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  dateText: {
    fontSize: 13,
    color: "#64748b",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreRingsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  qualitySummary: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    fontStyle: "italic",
    textAlign: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  atsCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  atsCheckLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  atsSubheading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  findingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  findingText: {
    fontSize: 13,
    color: "#64748b",
    flex: 1,
    lineHeight: 18,
  },
  criteriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  criteriaLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  criteriaScore: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  progressBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 4,
  },
  criteriaFeedback: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
