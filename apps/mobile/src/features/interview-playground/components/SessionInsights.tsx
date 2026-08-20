import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { EvaluationResult } from "../types";
import { useColorScheme } from "nativewind";

interface SessionInsightsProps {
  evaluation: EvaluationResult;
}

/**
 * Recap for Interview Playground (practice mode). Previously deliberately
 * omitted score/grade for a low-pressure feel; now shows a compact score
 * badge (final_score/grade) above the summary, while keeping the detailed
 * rubric bars (ScoreBreakdown's territory) out of this view.
 */
export function SessionInsights({ evaluation }: SessionInsightsProps) {
  const summary = evaluation.summary?.trim();
  const strengths = evaluation.strengths ?? [];
  const improvements = evaluation.improvement_areas ?? [];
  const starTip = evaluation.star_analysis?.feedback?.trim();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasScore = typeof evaluation.final_score === "number";

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, isDark && { backgroundColor: "#1E293B" }]}>
        <Text style={styles.headerEmoji}>💬</Text>
        <Text style={[styles.headerTitle, isDark && { color: "#F8FAFC" }]}>Practice Recap</Text>
        {hasScore && (
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, isDark && { color: "#A5B4FC" }]}>
              {evaluation.final_score}
              <Text style={styles.scoreOutOf}>/100</Text>
            </Text>
            {!!evaluation.grade && (
              <View style={[styles.gradeChip, isDark && { backgroundColor: "#312E81" }]}>
                <Text style={[styles.gradeChipText, isDark && { color: "#A5B4FC" }]}>
                  {evaluation.grade}
                </Text>
              </View>
            )}
          </View>
        )}
        <Text style={[styles.headerSub, isDark && { color: "#94A3B8" }]}>
          A quick look at how this session went and what to try next time.
        </Text>
      </View>

      {!!summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>How it went</Text>
          <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{summary}</Text>
        </View>
      )}

      {strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>
            What you did well
          </Text>
          {strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletGreen}>+</Text>
              <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {improvements.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>
            Things to try next time
          </Text>
          {improvements.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bulletAmber}>→</Text>
              <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {!!starTip && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "#F8FAFC" }]}>Tip</Text>
          <Text style={[styles.bodyText, styles.tipText, isDark && { color: "#CBD5E1" }]}>
            {starTip}
          </Text>
        </View>
      )}

      {!summary && strengths.length === 0 && improvements.length === 0 && (
        <View style={styles.section}>
          <Text style={[styles.bodyText, isDark && { color: "#CBD5E1" }]}>
            Nice work finishing the session! Keep practicing — every run builds your confidence.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },

  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  headerEmoji: { fontSize: 36 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  headerSub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 19 },

  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  scoreValue: { fontSize: 28, fontWeight: "800", color: "#4F46E5" },
  scoreOutOf: { fontSize: 14, fontWeight: "600", color: "#818CF8" },
  gradeChip: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  gradeChipText: { fontSize: 13, fontWeight: "700", color: "#4F46E5" },

  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  bodyText: { fontSize: 14, color: "#334155", lineHeight: 21, flex: 1 },
  tipText: { fontStyle: "italic" },

  listRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bulletGreen: { fontSize: 14, color: "#22C55E", fontWeight: "700", marginTop: 2 },
  bulletAmber: { fontSize: 14, color: "#F59E0B", fontWeight: "700", marginTop: 2 },
});
