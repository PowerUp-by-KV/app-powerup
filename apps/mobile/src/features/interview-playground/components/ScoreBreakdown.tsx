import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type {
  BehavioralScores,
  CommunicationScores,
  EvaluationResult,
  Grade,
  StarAnalysis,
} from "../types";

interface ScoreBreakdownProps {
  evaluation: EvaluationResult;
}

const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  A: { bg: "#D1FAE5", text: "#065F46" },
  B: { bg: "#DBEAFE", text: "#1E40AF" },
  C: { bg: "#FEF3C7", text: "#92400E" },
  D: { bg: "#FED7AA", text: "#9A3412" },
  E: { bg: "#FEE2E2", text: "#991B1B" },
  F: { bg: "#F1F5F9", text: "#475569" },
};

function barColor(value: number): string {
  if (value >= 80) return "#22C55E";
  if (value >= 60) return "#6366F1";
  if (value >= 40) return "#F59E0B";
  return "#EF4444";
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight?: string }) {
  // Guard against undefined/null/NaN from older evaluation payloads, which
  // would otherwise produce an invalid "NaN%" width.
  const clamped = Math.min(100, Math.max(0, value || 0));
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelWrap}>
        <Text style={styles.barLabel}>{label}</Text>
        {weight && <Text style={styles.barWeight}>{weight}</Text>}
      </View>
      <View style={styles.barTrack}>
        <View
          style={[styles.barFill, { width: `${clamped}%`, backgroundColor: barColor(clamped) }]}
        />
      </View>
      <Text style={styles.barValue}>{Math.round(clamped)}</Text>
    </View>
  );
}

function StarBadge({ label, achieved }: { label: string; achieved: boolean }) {
  return (
    <View style={[styles.starBadge, achieved ? styles.starAchieved : styles.starMissed]}>
      <Text style={[styles.starText, achieved ? styles.starTextAchieved : styles.starTextMissed]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  overall,
  weight,
}: {
  title: string;
  overall: number;
  weight: string;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionMeta}>
        <Text style={styles.sectionWeight}>{weight} of total</Text>
        <Text style={styles.sectionOverall}>{Math.round(overall)}/100</Text>
      </View>
    </View>
  );
}

// Defaults guard against older sessions saved before the evaluation shape was
// normalized, so a missing sub-object never crashes the results screen.
const EMPTY_COMMUNICATION: CommunicationScores = {
  clarity_articulation: 0,
  listening_responsiveness: 0,
  verbal_fluency: 0,
  confidence_presence: 0,
  structured_responses: 0,
  overall: 0,
};

const EMPTY_BEHAVIORAL: BehavioralScores = {
  emotional_intelligence: 0,
  teamwork: 0,
  problem_solving: 0,
  adaptability: 0,
  motivation: 0,
  integrity: 0,
  stress_management: 0,
  culture_fit: 0,
  overall: 0,
};

const EMPTY_STAR: StarAnalysis = {
  situation: false,
  task: false,
  action: false,
  result: false,
  star_score: 0,
  feedback: "",
};

export function ScoreBreakdown({ evaluation }: ScoreBreakdownProps) {
  const gradeColors = GRADE_COLORS[evaluation.grade] ?? GRADE_COLORS["F"];
  const communication = evaluation.communication ?? EMPTY_COMMUNICATION;
  const behavioral = evaluation.behavioral ?? EMPTY_BEHAVIORAL;
  const star_analysis = evaluation.star_analysis ?? EMPTY_STAR;

  const communicationItems: { label: string; value: number; weight: string }[] = [
    { label: "Clarity & Articulation", value: communication.clarity_articulation, weight: "15%" },
    {
      label: "Listening & Responsiveness",
      value: communication.listening_responsiveness,
      weight: "8%",
    },
    { label: "Verbal Fluency", value: communication.verbal_fluency, weight: "7%" },
    { label: "Confidence & Presence", value: communication.confidence_presence, weight: "5%" },
    { label: "Structured Responses", value: communication.structured_responses, weight: "5%" },
  ];

  const behavioralItems: { label: string; value: number; weight: string }[] = [
    { label: "Emotional Intelligence", value: behavioral.emotional_intelligence, weight: "12%" },
    { label: "Problem Solving", value: behavioral.problem_solving, weight: "15%" },
    { label: "Teamwork", value: behavioral.teamwork, weight: "10%" },
    { label: "Adaptability", value: behavioral.adaptability, weight: "10%" },
    { label: "Stress Management", value: behavioral.stress_management, weight: "8%" },
    { label: "Motivation & Drive", value: behavioral.motivation, weight: "8%" },
    { label: "Integrity", value: behavioral.integrity, weight: "7%" },
    { label: "Culture Fit", value: behavioral.culture_fit, weight: "5%" },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Overall score */}
      <View style={styles.headerRow}>
        <View style={[styles.gradeCircle, { backgroundColor: gradeColors.bg }]}>
          <Text style={[styles.gradeText, { color: gradeColors.text }]}>{evaluation.grade}</Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreNumber}>{evaluation.final_score}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
      </View>

      {!!evaluation.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.bodyText}>{evaluation.summary}</Text>
        </View>
      )}

      {/* Communication — 40% */}
      <View style={styles.section}>
        <SectionHeader title="Communication" overall={communication.overall} weight="40%" />
        {communicationItems.map((item) => (
          <ScoreBar key={item.label} label={item.label} value={item.value} weight={item.weight} />
        ))}
      </View>

      {/* Behavioral — 60% */}
      <View style={styles.section}>
        <SectionHeader title="Behavioral" overall={behavioral.overall} weight="60%" />
        {behavioralItems.map((item) => (
          <ScoreBar key={item.label} label={item.label} value={item.value} weight={item.weight} />
        ))}
      </View>

      {/* STAR Method */}
      <View style={styles.section}>
        <View style={styles.starHeaderRow}>
          <Text style={styles.sectionTitle}>STAR Method</Text>
          <Text style={styles.starScore}>{star_analysis.star_score}/4</Text>
        </View>
        <View style={styles.starRow}>
          <StarBadge label="Situation" achieved={star_analysis.situation} />
          <StarBadge label="Task" achieved={star_analysis.task} />
          <StarBadge label="Action" achieved={star_analysis.action} />
          <StarBadge label="Result" achieved={star_analysis.result} />
        </View>
        {!!star_analysis.feedback && (
          <Text style={[styles.bodyText, styles.starFeedback]}>{star_analysis.feedback}</Text>
        )}
      </View>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          {evaluation.strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletGreen}>+</Text>
              <Text style={styles.bodyText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Areas to improve */}
      {evaluation.improvements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          {evaluation.improvements.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletAmber}>→</Text>
              <Text style={styles.bodyText}>{s}</Text>
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

  headerRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: { fontSize: 42, fontWeight: "800" },
  scoreBlock: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  scoreNumber: { fontSize: 52, fontWeight: "700", color: "#1E293B", lineHeight: 60 },
  scoreLabel: { fontSize: 18, color: "#64748B", paddingBottom: 6 },

  section: { gap: 8 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  sectionMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionWeight: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
  sectionOverall: { fontSize: 13, color: "#4F46E5", fontWeight: "700" },

  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabelWrap: {
    width: 148,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barLabel: { fontSize: 12, color: "#64748B", flexShrink: 1 },
  barWeight: { fontSize: 10, color: "#CBD5E1", fontWeight: "600", marginLeft: 4 },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  barValue: { fontSize: 12, color: "#475569", width: 28, textAlign: "right", fontWeight: "600" },

  starHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starScore: { fontSize: 13, color: "#64748B" },
  starRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  starBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  starAchieved: { backgroundColor: "#D1FAE5" },
  starMissed: { backgroundColor: "#F1F5F9" },
  starText: { fontSize: 13, fontWeight: "600" },
  starTextAchieved: { color: "#065F46" },
  starTextMissed: { color: "#94A3B8" },
  starFeedback: { marginTop: 4, fontStyle: "italic" },

  listRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bodyText: { fontSize: 14, color: "#334155", lineHeight: 20, flex: 1 },
  bulletGreen: { fontSize: 14, color: "#22C55E", fontWeight: "700", marginTop: 2 },
  bulletAmber: { fontSize: 14, color: "#F59E0B", fontWeight: "700", marginTop: 2 },
});
