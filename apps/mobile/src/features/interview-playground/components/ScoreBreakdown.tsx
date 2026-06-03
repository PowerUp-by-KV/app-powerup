import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { EvaluationResult, Grade } from "../types";

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

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${clamped}%` }]} />
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

export function ScoreBreakdown({ evaluation }: ScoreBreakdownProps) {
  const gradeColors = GRADE_COLORS[evaluation.grade] ?? GRADE_COLORS["F"];
  const { communication, behavioral, star_analysis } = evaluation;

  const communicationItems: { label: string; value: number }[] = [
    { label: "Clarity & Articulation", value: communication.clarity_articulation },
    { label: "Listening & Responsiveness", value: communication.listening_responsiveness },
    { label: "Verbal Fluency", value: communication.verbal_fluency },
    { label: "Confidence & Presence", value: communication.confidence_presence },
    { label: "Structured Responses", value: communication.structured_responses },
  ];

  const behavioralItems: { label: string; value: number }[] = [
    { label: "Emotional Intelligence", value: behavioral.emotional_intelligence },
    { label: "Teamwork", value: behavioral.teamwork },
    { label: "Problem Solving", value: behavioral.problem_solving },
    { label: "Adaptability", value: behavioral.adaptability },
    { label: "Motivation", value: behavioral.motivation },
    { label: "Integrity", value: behavioral.integrity },
    { label: "Stress Management", value: behavioral.stress_management },
    { label: "Culture Fit", value: behavioral.culture_fit },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication</Text>
        <ScoreBar label="Overall" value={communication.overall} />
        {communicationItems.map((item) => (
          <ScoreBar key={item.label} label={item.label} value={item.value} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavioral</Text>
        <ScoreBar label="Overall" value={behavioral.overall} />
        {behavioralItems.map((item) => (
          <ScoreBar key={item.label} label={item.label} value={item.value} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STAR Method</Text>
          <Text style={styles.starScore}>Score: {star_analysis.star_score}/4</Text>
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

      {evaluation.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          {evaluation.strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bullet}>+</Text>
              <Text style={styles.bodyText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {evaluation.improvements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          {evaluation.improvements.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, styles.bulletImprove]}>→</Text>
              <Text style={styles.bodyText}>{s}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    fontSize: 42,
    fontWeight: "800",
  },
  scoreBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 60,
  },
  scoreLabel: {
    fontSize: 18,
    color: "#64748B",
    paddingBottom: 6,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  starScore: {
    fontSize: 13,
    color: "#64748B",
  },
  bodyText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    flex: 1,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    color: "#64748B",
    width: 140,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  barValue: {
    fontSize: 12,
    color: "#475569",
    width: 28,
    textAlign: "right",
  },
  starRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  starBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  starAchieved: {
    backgroundColor: "#D1FAE5",
  },
  starMissed: {
    backgroundColor: "#F1F5F9",
  },
  starText: {
    fontSize: 13,
    fontWeight: "600",
  },
  starTextAchieved: {
    color: "#065F46",
  },
  starTextMissed: {
    color: "#94A3B8",
  },
  starFeedback: {
    marginTop: 4,
    fontStyle: "italic",
  },
  listRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    color: "#22C55E",
    fontWeight: "700",
    marginTop: 2,
  },
  bulletImprove: {
    color: "#F59E0B",
  },
});
