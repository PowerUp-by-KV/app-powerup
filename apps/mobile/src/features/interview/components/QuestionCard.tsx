/**
 * src/features/interview/components/QuestionCard.tsx
 *
 * Displays a single interview question with its category badge and hint.
 * Renders the progress label (e.g. "Question 2 / 5") and an optional
 * difficulty chip.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { InterviewQuestion, QuestionDifficulty } from "../types/interview.types";

// ── Difficulty chip palette ───────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<
  QuestionDifficulty,
  { background: string; text: string }
> = {
  easy: { background: "#DCFCE7", text: "#166534" },
  medium: { background: "#FEF3C7", text: "#92400E" },
  hard: { background: "#FEE2E2", text: "#991B1B" },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: InterviewQuestion;
  /** e.g. "2 / 5" */
  progressLabel: string;
  showHint?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QuestionCard({
  question,
  progressLabel,
  showHint = true,
}: QuestionCardProps) {
  const diffColors = DIFFICULTY_COLORS[question.difficulty];

  return (
    <View style={styles.card}>
      {/* Top row — category + difficulty */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{question.category}</Text>
        </View>
        <View
          style={[
            styles.difficultyChip,
            { backgroundColor: diffColors.background },
          ]}
        >
          <Text style={[styles.difficultyText, { color: diffColors.text }]}>
            {question.difficulty.charAt(0).toUpperCase() +
              question.difficulty.slice(1)}
          </Text>
        </View>
      </View>

      {/* Progress label */}
      <Text style={styles.progressLabel}>Question {progressLabel}</Text>

      {/* Question text */}
      <Text style={styles.questionText}>{question.text}</Text>

      {/* Hint */}
      {showHint && question.hint ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>💡 Tip</Text>
          <Text style={styles.hintText}>{question.hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  difficultyChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 28,
    marginBottom: 14,
  },
  hintBox: {
    backgroundColor: "#F0FDF4",
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
    borderRadius: 8,
    padding: 12,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
});
