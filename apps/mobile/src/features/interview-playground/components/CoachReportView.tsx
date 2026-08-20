import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

// Mirrors the `final_report` shape built by CoachService.complete_session
// (see app/services/coach_service_pipeline.py). Deliberately NOT a rubric/
// grade shape, and deliberately has NO numeric score anywhere — the Coach
// backend produces a purely qualitative, communication-first coaching
// report instead, by design ("NO rubric, NO grade — that belongs to the
// playground interview").
export interface CoachSkillMastery {
  level: string;
  rationale: string;
}

export interface CoachBetterAnswer {
  question: string;
  your_answer: string;
  model_answer: string;
  skill_alignment: string;
}

export interface CoachReport {
  questions_attempted: number;
  average_score?: number;
  final_score?: number;
  grade?: string;
  overall_summary: string;
  communication_highlights: string[];
  improvement_areas: string[];
  skills_mastery_level: Record<string, CoachSkillMastery>;
  actionable_coaching_tips: string[];
  better_answers: CoachBetterAnswer[];
}

interface CoachReportViewProps {
  report: CoachReport;
}

const MASTERY_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: "#FEE2E2", text: "#991B1B" },
  Intermediate: { bg: "#FEF3C7", text: "#92400E" },
  Advanced: { bg: "#DBEAFE", text: "#1E40AF" },
  Expert: { bg: "#D1FAE5", text: "#065F46" },
};

function masteryColors(level: string) {
  return MASTERY_COLORS[level] ?? { bg: "#F1F5F9", text: "#475569" };
}

export function CoachReportView({ report }: CoachReportViewProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!report) return null;

  const communicationHighlights = Array.isArray(report.communication_highlights)
    ? report.communication_highlights
    : [];
  const improvementAreas = Array.isArray(report.improvement_areas) ? report.improvement_areas : [];
  const actionableCoachingTips = Array.isArray(report.actionable_coaching_tips)
    ? report.actionable_coaching_tips
    : [];
  const betterAnswers = Array.isArray(report.better_answers) ? report.better_answers : [];
  const skillEntries = Object.entries(report.skills_mastery_level ?? {});

  const rawScore =
    report.final_score ??
    (report.average_score !== undefined
      ? report.average_score <= 10
        ? report.average_score * 10
        : report.average_score
      : null);
  const displayScore = rawScore !== null ? Math.round(rawScore) : null;
  const displayGrade =
    report.grade ||
    (displayScore !== null
      ? displayScore >= 85
        ? "A"
        : displayScore >= 70
          ? "B"
          : displayScore >= 55
            ? "C"
            : displayScore >= 40
              ? "D"
              : "F"
      : null);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Overall Score & Grade Card */}
      {displayScore !== null && (
        <View
          style={[
            styles.scoreHeroCard,
            isDark && { backgroundColor: "#1E293B", borderColor: "#334155" },
          ]}
        >
          <View style={styles.scoreHeroRow}>
            <View style={{ gap: 2 }}>
              <Text style={[styles.scoreHeroLabel, isDark && { color: "#94A3B8" }]}>
                Overall Performance Score
              </Text>
              <Text style={[styles.scoreHeroValue, isDark && { color: "#F8FAFC" }]}>
                {displayScore} <Text style={styles.scoreHeroMax}>/ 100</Text>
              </Text>
            </View>
            {displayGrade && (
              <View style={[styles.gradeHeroBadge, isDark && { backgroundColor: "#312E81" }]}>
                <Text style={[styles.gradeHeroText, isDark && { color: "#A5B4FC" }]}>
                  Grade {displayGrade}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Session recap — questions covered */}
      <View style={styles.headerRow}>
        <View style={[styles.headerIconCircle, isDark && { backgroundColor: "#312E81" }]}>
          <Text style={[styles.headerIconText, isDark && { color: "#A5B4FC" }]}>
            {report.questions_attempted ?? 1}
          </Text>
        </View>
        <View style={styles.headerBlock}>
          <Text style={[styles.headerLabel, isDark && { color: "#F8FAFC" }]}>
            Question{(report.questions_attempted ?? 1) === 1 ? "" : "s"} practiced this session
          </Text>
          <Text style={[styles.headerSubLabel, isDark && { color: "#94A3B8" }]}>
            Detailed analysis & actionable coaching
          </Text>
        </View>
      </View>

      {/* Summary */}
      {!!report.overall_summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>How you did</Text>
          <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>
            {report.overall_summary}
          </Text>
        </View>
      )}

      {/* Skills mastery */}
      {skillEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>Skills Mastery</Text>
          {skillEntries.map(([skill, mastery]) => {
            const colors = masteryColors(mastery.level);
            return (
              <View key={skill} style={styles.masteryRow}>
                <View style={styles.masteryHeaderRow}>
                  <Text style={[styles.masterySkill, isDark && { color: "#F8FAFC" }]}>{skill}</Text>
                  <View style={[styles.masteryBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.masteryBadgeText, { color: colors.text }]}>
                      {mastery.level}
                    </Text>
                  </View>
                </View>
                {!!mastery.rationale && (
                  <Text style={[styles.bodyTextSmall, isDark && { color: "#94A3B8" }]}>
                    {mastery.rationale}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Communication highlights */}
      {communicationHighlights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>
            Communication Highlights
          </Text>
          {communicationHighlights.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletGreen}>+</Text>
              <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Areas to improve */}
      {improvementAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>
            Areas to Improve
          </Text>
          {improvementAreas.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletAmber}>→</Text>
              <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Coaching tips */}
      {actionableCoachingTips.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>Coaching Tips</Text>
          {actionableCoachingTips.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletIndigo}>★</Text>
              <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Per-question model answers — transcript-style, no scores */}
      {betterAnswers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>
            Question-by-Question Review
          </Text>
          {betterAnswers.map((qa, i) => (
            <View
              key={i}
              style={[
                styles.qaCard,
                isDark && { backgroundColor: "#1E293B", borderColor: "#334155" },
              ]}
            >
              <Text style={[styles.qaQuestion, isDark && { color: "#F8FAFC" }]}>{qa.question}</Text>
              {!!qa.your_answer && (
                <View
                  style={[
                    styles.yourAnswerBox,
                    isDark && {
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.yourAnswerLabel, isDark && { color: "#94A3B8" }]}>
                    Your answer
                  </Text>
                  <Text style={[styles.bodyTextSmall, isDark && { color: "#F8FAFC" }]}>
                    {qa.your_answer}
                  </Text>
                </View>
              )}
              {!!qa.skill_alignment && (
                <Text style={[styles.bodyTextSmall, isDark && { color: "#94A3B8" }]}>
                  {qa.skill_alignment}
                </Text>
              )}
              {!!qa.model_answer && (
                <View
                  style={[
                    styles.modelAnswerBox,
                    isDark && {
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.modelAnswerLabel, isDark && { color: "#A5B4FC" }]}>
                    Model answer
                  </Text>
                  <Text style={[styles.bodyTextSmall, isDark && { color: "#F8FAFC" }]}>
                    {qa.model_answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 20, paddingBottom: 32 },

  scoreHeroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreHeroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreHeroLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreHeroValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
  },
  scoreHeroMax: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94A3B8",
  },
  gradeHeroBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gradeHeroText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "800",
  },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  headerIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  headerIconText: { fontSize: 28, fontWeight: "800", color: "#4F46E5" },
  headerBlock: { flex: 1, gap: 2 },
  headerLabel: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  headerSubLabel: { fontSize: 12, color: "#94A3B8" },

  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  bodyText: { fontSize: 14, color: "#334155", lineHeight: 20, flex: 1 },
  bodyTextSmall: { fontSize: 12, color: "#64748B", lineHeight: 18 },

  listRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bulletGreen: { fontSize: 14, color: "#22C55E", fontWeight: "700", marginTop: 2 },
  bulletAmber: { fontSize: 14, color: "#F59E0B", fontWeight: "700", marginTop: 2 },
  bulletIndigo: { fontSize: 13, color: "#6366F1", fontWeight: "700", marginTop: 2 },

  masteryRow: { gap: 2, marginBottom: 6 },
  masteryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  masterySkill: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  masteryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  masteryBadgeText: { fontSize: 11, fontWeight: "700" },

  qaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  qaQuestion: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  yourAnswerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  yourAnswerLabel: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  modelAnswerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    gap: 2,
    marginTop: 4,
  },
  modelAnswerLabel: { fontSize: 11, fontWeight: "700", color: "#4F46E5" },
});
